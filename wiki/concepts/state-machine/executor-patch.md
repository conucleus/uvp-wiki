---
title: Executor Patch
type: explanation
audience: 工程贡献者
status: verified
---

# Executor Patch

Executor patch 是 Stage Overlay 的一类运行时变更。它只影响某个 Order 的目标 stage executor，不修改 Plan，也不修改 Supplier Directory。

## 解决什么问题

有些 stage 的执行者会在订单运行时由 selector stage 选择、交接或替换，Plan 不预先完全固定。例如买家确认资料后，为后续报关 stage 指定具体报关行钱包。

```text
selector stage
  -> stage_executor_patch typed data
  -> selector wallet signature
  -> applyStageExecutorPatchFor
  -> StageExecutorPatchApplied
  -> StageExecutorActivated
  -> Plan-declared target-stage signal authority is delegated to executor
  -> target stage future signal must match active executor
```

## 合约检查

Executor patch 至少受这些条件约束：

- selector stage 和 target stage 必须存在 `StageSelectorBinding`。
- selector 必须有订单级内部 patch 授权。
- patch nonce 必须递增。
- executor 地址不能是零地址。
- assign、handoff、replacement 等 mode 有不同的 previous executor 或 approval signal 要求。
- Plan 必须为目标 stage 通过 `sendSignals` 预声明至少一个 current-order signal capability。
- patch 激活后，合约把这些 Plan 预声明的 `(sourceId, signalId)` 权限自动委任给新 executor；executor 不需要在 Order 创建时已经位于候选钱包授权表中。
- 后续 replacement 或 handoff 会把尚未首次写入的同一能力范围切换给新 executor；已经写入的 Signal 不会被重写。

这是一种受 Plan 限定的自动委任，而不是给 executor 任意写 Signal 的通配权限。选择者能改变“谁执行”，但不能扩大 Zhixu 已声明的“这个 stage 能发什么”。selector binding 是 Plan 发布时冻结的公共接口约束，patch 只能消费它而不能绕过或改写；公共接口边界见 [合约与事件](../../reference/contracts-and-events.md)。

## 代码入口

| 代码 | 说明 |
| --- | --- |
| `UVPStagePatchModule.sol` | `applyStageExecutorPatch`、`applyStageExecutorPatchFor`、patch digest、mode 校验。 |
| `UVPStateMachine.sol` | active executor 激活和后续 signal 检查。 |
| `UVPPlanMetadataModule.sol` | 保存编译器从 `sendSignals` 生成的 signal capability，作为动态委任上限。 |
| `protocol-bindings/src/index.ts` | stage executor patch typed data、call builder、signer recovery。 |
| `uvp-chain-services/service/src/stage-patches/` | Product API prepare/submit executor patch。 |

## 边界

- Executor patch 不是 Supplier 能力证明；能力与匹配仍是 Store 链下判断，Identity Registry 只解析主体与钱包。
- Executor patch 不是业务完成；某个业务结果是否发生仍看目标 source/signal 的 `SignalSubmitted`。
- Executor patch 不回写 Plan；Plan 仍代表被 published 的静态版本。

相关总览见 [Stage Overlay：Executor Patch 与 Resource Patch](stage-overlay.md)。
