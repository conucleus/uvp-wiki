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
- 支持 `&`、`|`、`~`、delay，以及跨 source 的 `::ANCHOR(@source::task.stage.signal)` 订阅；旧的 `::OUTSIDE@`、`::MERGE@`、`::ANCHOR@` wrapper 和 `OUTSOURCE` 已退役（解析期报错）。
- 只为 stage 的 `receiveSignals` 生成 receive Hook；不存在一套绕过 AST 的 `externalSignals` 或 trigger wrapper 语义。
- 把 `~A` 解释为“A signal 尚未出现在当前订单事件集中”。signal 一旦出现就不会消失，所以这里是单调存在逻辑。
- 抽取 positive、negative、timer dependencies。
- 提供本地 evaluator，供 compiler 和 reference runtime 共享。

Hook Core 的输出仍然是平台中立语义，不含 Solidity ABI。

## Compiler

`uvp-protocol/packages/compiler` 负责：

- 加载 YAML/JSON Zhixu。
- 校验 stage、`receiveSignals`、`mint`、`selectedStages`、executor reachability，以及 dock route/interface commitment。
- 生成 `OnchainHookPlanArtifact`。
- 生成 Solidity `commitPlan`/`finalizePlan` 参数。
- 计算 `planId`、`planHash`、hook/stage/source/signal/dependency/route id。

## 组件职责

| 组件 | 负责什么 | 相邻边界 |
| --- | --- | --- |
| uvp-core | Hook DSL、AST、求值、依赖提取、正向锚点与 canonical semantic version 的规范实现。 | Solidity ABI、钱包授权、Product task 语言由后续层处理。 |
| hook-core | 对 uvp-core 语义的 TypeScript adapter 和版本断言，不另立语义。 | 不得形成与 uvp-core 分叉的解析／求值规则。 |
| compiler | 秩序 input schema、OnchainHookPlan、register 参数（commitPlan+finalizePlan）、canonical hash；调用 uvp-core 语义，HookPlan 仅为内部 IR。 | 订单参与者选择、supplier identity 判断、linked order 注册、支付/escrow 逻辑由产品、registry 或 periphery 处理。 |
| artifact/hash | `planId`、`planHash`、`hookId`、`sourceId`、`signalId`、`signalKey` 的稳定边界。 | Store draft 状态和 Product DB primary key 属于读模型。 |

## Compiler 的输入输出边界

Compiler 的输出是确定性的计划产物和注册参数。订单参与者、钱包授权、合约部署、supplier identity、escrow 或 funding 由后续的 Product、registry、deployment 或 periphery 层处理。Compiler 只回答一个问题：这份静态 Zhixu 能否被确定性地编译成 EVM 可注册计划。

## 为什么它是架构核心

Compiler 的确定性保证各方得到同一个 plan hash。合约注册 compact hooks，publisher 对 plan hash 签名，Product DTO 显示该 Plan 对应的任务。哈希与 schema 可复现，整条链路才能审计。

## 必须守住的编译语义

以下都是 compile 期规则，不是运行时规则；运行时求值见 [Hook 求值](state-machine/evaluation.md)。

> 待确认（TODO）：指令称八条细则，源页（components/semantics-and-compiler.md）实际仅七条。

- `receiveSignals` 的 key 是本 stage 的 receive hook 名称，value 是该 hook 的规范化表达式；不再读取 `stage.trigger` 或 `externalSignals`。
- Hook 的订单入口由 `orderTriggerKind` 明确表达：`none`、`mint` 或 `dock`；Ready 事件是否对外发出由独立的 `emitReady` 布尔值表达。
- `mint: per-fact` 只能用于出生 stage：每个满足锚点的事实铸造一个新订单；docking 出生必须带完整 dock route/interface proof。
- `supplierType=zhixu` 必须提供 `zhixuExecutorConfig`，其中 target 是版本化的 peer UID，`inputMap`/`signalMap` 使用目标接口端口名；它不使用 `supplierID`。
- `signalMap` 的输出映射必须包含 `str` 和 `cmp`，`err` 可选但建议配置，并且同一个 map 引用同一个 source。
- Hook 表达式按单调存在逻辑求值：`A` 表示 signal 已出现，`~A` 表示 signal 尚未出现；signal 出现后不会消失。
- Hook 表达式必须有正向锚点；纯缺席条件不能成为可推进 hook。
