---
title: 编译输入
type: reference
audience: 工程贡献者
status: verified
---

# 编译输入

编译输入是 `ZhixuDefinition`；跨秩序协作另有一份独立的 `kind: Dock` 文档，两对象并列发布、分别编译。编译器不会只做字符串搬运，它会先验证定义是否能生成确定性的协议产物。

## 进入产物的字段

| 字段 | 用途 |
| --- | --- |
| `metadata.name` | 必填 slug（`^[a-z][a-z0-9_-]{0,99}$`）；纯展示属性，不参与定义身份派生。 |
| `metadata.uid` | 不是 DSL 字段：源定义出现 `metadata.uid` 按未知字段响亮拒绝；身份是内容派生 uid `zx-<32hex>`。 |
| `metadata.labels` | 定义内容的一部分，参与内容派生身份。 |
| `metadata.annotations` | 自由注解，永不参与身份或哈希推导（无原生版本语义）。 |
| `spec.platform` | 轨道声明，参与哈希。 |
| `stages[].name` | stage 标识（`stageIdentifier`）本身，秩序内唯一。 |
| `stages[].source` | hook source 和 `sourceId` 输入。 |
| `stages[].sendSignals` | 出站 signal 声明（条目对象 `{name, validWhen?}`，`trigger: true` 标记出生信号：能力清单 + 出生集 + 发射适格产物）。 |
| `stages[].receiveSignals` | 生成 receive hook。 |
| `stages[].executor` | executor route、reachability 与 dock 执行者标记。 |
| `stages[].selectedStages` | selector binding 和 executor closure。 |
| `stages[].fileResources` | 静态资源句柄与 stage route 元数据。 |
| `stages[].fileWriters` | 跨阶段文件写 allowlist，编译为 file-writer capability 叶。 |

`Dock` 文档（`spec.from{zhixu,source}` / `spec.to{zhixu,stage}` / `spec.signalMap`）由 `uvp-core analyzeDock` 单独编译为 `uvp.dock.v1`：`from.zhixu`/`to.zhixu` 必须是已发布定义的内容派生 uid，`to.stage` 以 `executor.supplierType: dock` 承接，`signalMap` 的 atoms 落在 `from.source` 的阶段的 `sendSignals` 上。

## 编译器请求面

默认 target 是 `hook_plan`（`evm` 为其别名），另有 `cloud`/`cloud_db`（云轨产物）与 `analyze`（共享校验 + hook IR + 出生信号集 + hook 解析结果）。Dock 文档走 `analyzeDock` 请求（`{dock, published}`）。

uvp-core analyze 的 wire schema 是 `uvp.zhixuAnalysis.v4`：它输出共享定义校验结果（含链轨出生信号集校验与阶段物化门）、每 stage 规范化的出生信号名、解析后的 hook AST、signal capabilities、折叠后的 admissions 与每 stage 的执行者配置；链轨编译器只消费 analyze 结果做 lowering/装饰/壳层总装，不重复校验。

## 编译器会拒绝什么

定义级与链轨接受域在哈希前拒绝这些形状（共享校验归 uvp-core analyze）：

- 缺少必要的 `metadata`、`spec`、`stages` 或 stage 字段。
- stage 名在秩序内重复。
- `selectedStages` 指向不存在的 stage；executor closure 无法被静态 executor 或 selector 触达。
- `sendSignals[].trigger` 条目不属本 stage `sendSignals`、同阶段重复，或出生阶段的 executor 不是静态 plain executor（`individual`/`organization` + `supplierID`，非 dock）。
- 出生信号声明了互相冲突的适格形态（表达式不合法、引用不存在、`validWhen` 列表 header source 不一致、嵌套延时、无锚延时等）。
- dock 阶段没有 `receiveSignals` 绑定面，或 plan 级执行者路由/候选集指向 dock 阶段。
- 阶段物化门：既无出生信号又无 `receiveSignals` 的阶段编译为零 hook，链上 target 整体拒绝。
- 依赖键全计划去重后超限（>1024）、同一 signalKey 被多个阶段的非出生 hook 观察。
- `fileWriters` 引用不存在或不自洽（重复、自指）。
- Dock 文档：from/to 未发布、`to.stage` 不是 dock 阶段、output 不在 `sendSignals`、`signalMap` 表达式 atoms 越界或空集等。

这些错误要在编译期暴露，而不是等到合约注册或订单执行时才发现。

## 源定义如何进入哈希

链上 runtime `planHash` 覆盖三元组：`hooksHash`、`capabilitiesRoot`、`executorCandidatesRoot`（公式见 [Canonical Hash](canonical-hashes.md)）——canonicalized source Zhixu 不在其中。影响协议语义的源定义变化会改变 hooks、能力表或候选集，因此必然改变 `planHash`；整个 `OnchainHookPlanArtifact` 另有 canonical payload hash（经 `sourcePlanHash` 锚定源定义快照），只用于产物追溯与 fixture 固定，不充当链上 `planHash`。编译产物不是手写 JSON，应由脚本从源定义可重复生成。

字段清单以 `uvp-protocol/packages/compiler/src/types` 与语言层正本 `uvp-core/docs/zhixu-dsl-grammar.md` 为准。

## 相关页面

- [Compiler 与 Hook Core](../compiler-and-hooks.md)
- [Canonical Hash](canonical-hashes.md)
- [链上注册参数](solidity-registration.md)
- [版本与语义矩阵](../../reference/version-matrix.md)
