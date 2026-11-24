---
title: Compiler 与 Hook Core
type: explanation
audience: 工程贡献者
status: verified
---

# Compiler 与 Hook Core

Compiler 和 Hook Core 是协议语义进入链上前的入口。它们不处理订单运行、数据库、资金或前端 UI，只负责把 DSL 变成确定性语义产物。

## Hook Core

`uvp-protocol/packages/hook-core` 负责：

- 解析 `source::condition`。
- 支持 `&`、`|`、`~`、delay；Hook 表达式只在当前订单事实集上解释；跨秩序事实由静态 Dock 的 binding 发射为本订单事实后再由 hook 消费。
- 为 stage 的 `receiveSignals` 生成 receive Hook，并为 `sendSignals` 中 `trigger: true` 的出生信号合成 order-trigger Hook。
- 把 `~A` 解释为“A signal 尚未出现在当前订单事件集中”。signal 一旦出现就不会消失，所以这里是单调存在逻辑。
- 抽取 positive、negative、timer dependencies。
- 提供本地 evaluator，供 compiler 和 reference runtime 共享。

Hook Core 的输出仍然是平台中立语义，不含 Solidity ABI。

## Compiler

`uvp-protocol/packages/compiler` 负责：

- 加载 YAML/JSON Zhixu。
- 校验 stage、`receiveSignals`、`sendSignals[].trigger` 条目与静态 executor 约束、`selectedStages`、executor reachability 与 `fileWriters` 引用。
- 调用 uvp-core 的 analyze wire `uvp.zhixuAnalysis.v1`，按每 stage 规范化的出生信号名合成出生钩子并生成 `OnchainHookPlanArtifact`（含派生的 `triggers[]` 枚举）；独立 `kind: Dock` 文档走 `analyzeDock` 出 `uvp.dock.v1`。
- 生成 Solidity `commitPlan`/`finalizePlan` 参数。
- 计算 `planId`、`planHash`、hook/stage/source/signal/dependency/route id。

## 组件职责

| 组件 | 负责什么 | 相邻边界 |
| --- | --- | --- |
| uvp-core | Hook DSL、AST、求值、依赖提取、正向锚点与 canonical semantic version 的规范实现。 | Solidity ABI、钱包授权、Product task 语言由后续层处理。 |
| hook-core | 对 uvp-core 语义的 TypeScript adapter 和版本断言，不另立语义。 | 不得形成与 uvp-core 分叉的解析／求值规则。 |
| compiler | 秩序 input schema、OnchainHookPlan、register 参数（commitPlan+finalizePlan）、canonical hash；调用 uvp-core 语义，HookPlan 仅为内部 IR。 | 订单参与者选择、supplier identity 判断、Dock 运行期选择/binding、支付/资金托管逻辑由产品、registry、部署工具或 periphery 处理。 |
| artifact/hash | `planId`、`planHash`、`hookId`、`sourceId`、`signalId`、`signalKey` 的稳定边界。 | Store draft 状态和 Product DB primary key 属于读模型。 |

## Compiler 的输入输出边界

Compiler 的输出是确定性的计划产物和注册参数。订单参与者、钱包授权、合约部署、supplier identity、资金托管或 funding 由后续的 Product、registry、deployment 或 periphery 层处理。Compiler 只回答一个问题：这份静态 Zhixu 能否被确定性地编译成 EVM 可注册计划。

## 为什么它是架构核心

Compiler 的确定性保证各方得到同一个 plan hash。合约注册 compact hooks，publisher 对 plan hash 签名，Product DTO 显示该 Plan 对应的任务。哈希与 schema 可复现，整条链路才能审计。

## 必须守住的编译语义

以下都是 compile 期规则，不是运行时规则；运行时求值见 [Hook 求值](state-machine/evaluation.md)。

- `receiveSignals` 的 key 是本 stage 的 receive hook 名称，value 是该 hook 的规范化表达式；`sendSignals` 中 `trigger: true` 的出生信号由 analyze 规范化后合成 order-trigger hook。
- Hook 的订单入口由 `orderTriggerKind` 明确表达（闭集 `none`/`trigger`）；Ready 事件是否对外发出由独立的 `emitReady` 布尔值表达；dock 阶段以 `HOOK_FLAG_DOCK_EXECUTOR` 标记区分。
- 每条出生信号合成一条 order-trigger hook（单条 `SIGNAL` 指令、`emitReady=true`，注册位置位 `ORDER_TRIGGER_MINT`）；一个 stage/plan 可有多条出生信号，出生时用 `triggerHookId` + `triggerStageId` 显式选择。
- `supplierType: dock` 的阶段由另一条秩序承接：B 侧发布独立 `kind: Dock` 文档（`spec.from` / `spec.to` / `spec.signalMap`），`signalMap` 值是 Hook DSL 发射适格表达式、header source 固定为 `spec.from.source`；该文档由 `analyzeDock` 编出 `uvp.dock.v1`。挂接 stage 只声明 `supplierType: dock`（B 侧无需 `supplierID`），执行者在订单上经 `selectStageDockSupplier` 一次性选定，binding 由 `dock_link` 文件项与 `pokeDockBinding` 的 A/B 时间窗发射承载。
- Hook 表达式按单调存在逻辑求值：`A` 表示 signal 已出现，`~A` 表示 signal 尚未出现；signal 出现后不会消失。
- Hook 表达式必须有正向锚点；纯缺席条件不能成为可推进 hook。
