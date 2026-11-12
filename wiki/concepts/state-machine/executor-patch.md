---
title: Executor Patch
type: explanation
audience: 工程贡献者
status: verified
---

# Executor Patch

Executor patch 是 Stage Overlay 的一类运行时变更。它只影响某个 Order 的目标 stage executor，不修改 Plan，也不修改 Supplier Directory。

## 解决什么问题

有些 stage 的执行者会在订单运行时由 selector stage 选择或交接，Plan 固定流程与候选范围，具体钱包在订单级落定。例如买家确认资料后，为后续报关 stage 指定具体报关行钱包。

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
- mode 闭集为 `assign` / `handoff`：`assign` 在目标 stage 首个信号之前落窗，`handoff` 在首信号之后并需 previous executor 对同一 digest 的签名。
- Plan 必须为目标 stage 通过 `sendSignals` 预声明至少一个 current-order signal capability，并通过 `executorCandidatesRoot` 承诺候选执行者集合（candidateProof 成员证明；未承诺候选集的 Plan 对所有 executor patch fail-closed）。
- 资格核验由提交方自证：patch 携带 bindingProof（selector 绑定叶的成员资格证明）与 stageFacts（目标 stage 的 capability 叶证明），合约按 `capabilitiesRoot` 验证；全零表示不携证。
- patch 激活后，合约把这些 Plan 预声明的 `(sourceId, signalId)` 权限自动委任给新 executor；executor 不需要在 Order 创建时已经位于候选钱包授权表中。
- 后续 handoff 会把尚未首次写入的同一能力范围切换给新 executor；已经写入的 Signal 保持原样，历史 `SignalSubmitted` 保留原 submitter。

这是一种受 Plan 限定的自动委任，而不是给 executor 任意写 Signal 的通配权限。选择者能改变“谁执行”，但不能扩大 Zhixu 已声明的“这个 stage 能发什么”。selector binding 是 Plan 发布时冻结的公共接口约束，patch 只能消费它而不能绕过或改写；公共接口边界见 [协议边界](../protocol-boundaries.md)。

## 代码入口

| 代码 | 说明 |
| --- | --- |
| `UVPStagePatchModule.sol` | `applyStageExecutorPatch`、`applyStageExecutorPatchFor`、patch digest、mode 校验（EIP-712 域 `stageExecutorPatch` 0.4）。 |
| `UVPStateMachine.sol` | active executor 激活和后续 signal 检查。 |
| `UVPPlanMetadataModule.sol` | 保存 `capabilitiesRoot`，验证 patch 携带的 bindingProof 与 stageFacts。 |
| `protocol-bindings/src/index.ts` | stage executor patch typed data、call builder、signer recovery。 |
| `uvp-chain-services/service/src/stage-patches/` | Product API prepare/submit executor patch。 |

## dock 阶段执行者：一次性选择路径

dock 阶段的执行者不走通用 executor patch，而由 `UVPStagePatchModule.selectStageDockExecutor` 一次性选定：事件 `StageDockExecutorSelected` 记录 dockId、fromPlanId、executor、selector 与 patchHash；同 dkid + executor 的重放幂等吸收，换选由 `StageDockExecutorAlreadySelected` 拒绝，后续通用 patch 由 `StageExecutorPatchForbiddenOnDockStage` 拒绝。详见 [Dock 与 Binding](docking.md)。

## 边界

- Executor patch 不是 Supplier 能力证明；能力与匹配仍是 Store 链下判断，Identity Registry 只解析主体与钱包。
- Executor patch 不是业务完成；某个业务结果是否发生仍看目标 source/signal 的 `SignalSubmitted`。
- Executor patch 不回写 Plan；Plan 仍代表被 published 的静态版本。

相关总览见 [Stage Overlay：Executor Patch 与阶段文件 Patch](stage-overlay.md)。
