---
title: Stage Supplier Patch
type: explanation
audience: 工程贡献者
status: verified
---

# Stage Supplier Patch

Stage supplier patch 是 Stage Overlay 的一类运行时变更。它只影响某个 Order 的目标 stage supplier，不修改 Plan，也不修改 Store 的 Supplier Directory。

## 解决什么问题

有些 stage 的 supplier 会在订单运行时由 selector stage 选择或交接，Plan 固定流程、selector 关系与候选范围，具体 SID 在订单级落定。例如买家确认资料后，为后续报关 stage 指定具体报关行 SID。

```text
selector stage
  -> StageSupplierPatch typed data
  -> selector (assigned supplier account) signature
  -> applyStageSupplierPatchFor
  -> StageSupplierPatchApplied
  -> stage -> supplierId assignment updated
  -> target stage future signal must be signed by accountOf(new SID)
```

## 合约检查

stage supplier patch 至少受这些条件约束：

- selector stage 和 target stage 必须存在 `StageSelectorBinding`（`bindingProof` 按 `capabilitiesRoot` 验证）。
- selector 必须是 selector stage 当前生效的 assigned supplier account（`isEffectiveStageAccount`）。
- patch nonce 必须递增。
- target supplierId 不能为零，且该 SID 必须 `active`。
- `previousSupplierId == 0` 是 assign（只在目标 stage 首个信号之前）；非零是 handoff（只在首信号之后，且需原 assigned supplier account 对同一 digest 的签名；在 `UVPIdentityRegistry` 中撤销 supplier 为终态，会阻止后续 handoff）。
- fixed 阶段 patch 恒拒；candidate 阶段必须命中 Plan `supplierBindingsRoot` 的 kind=1 candidate 叶（`candidateProof`）；dynamic 阶段免 proof、可指派任意 active SID；birth/dock 阶段 patch 恒拒。
- patch 只改 `stage -> supplierId`，不写任何授权集；已经写入的 Signal 保持原样，历史 `SignalSubmitted` 保留原 submitter。

这是一种受 Plan 限定的 supplier 指派，而不是给 supplier 任意写 Signal 的通配权限。选择者能改变“谁承接”，但不能扩大 Zhixu 已声明的“这个 stage 能发什么”。selector binding 是 Plan 发布时冻结的公共接口约束，patch 只能消费它而不能绕过或改写；公共接口边界见 [协议边界](../protocol-boundaries.md)。

## 代码入口

| 代码 | 说明 |
| --- | --- |
| `UVPStagePatchModule.sol` | `applyStageSupplierPatch`、`applyStageSupplierPatchFor`、patch digest、assign/handoff 与 candidate 校验（EIP-712 域 `stageSupplierPatch` 1）。 |
| `UVPStateMachine.sol` | `activateStageSupplierFromModule`、effective supplier 解析和后续 signal 检查。 |
| `UVPPlanMetadataModule.sol` | 保存 `capabilitiesRoot`，验证 `bindingProof`。 |
| `protocol-bindings/src/index.ts` | stage supplier patch typed data、call builder、signer recovery。 |
| `uvp-chain-services/service/src/stage-patches/` | 链读投影。 |

## Dock Supplier：一次性选择路径

dock 阶段的 supplier 不走通用 stage supplier patch，而由 `UVPStagePatchModule.selectStageDockSupplier` 一次性选定：事件 `StageDockSupplierSelected` 记录 targetStageId、dockId、supplierId 与 patchNonce；同 dkid + supplier 的重放幂等吸收，换选由 `StageDockSupplierAlreadySelected` 拒绝，后续通用 patch 由 `StageSupplierPatchForbiddenOnDockStage` 拒绝。详见 [Dock 与 Binding](docking.md)。

## 边界

- Stage supplier patch 不是 Supplier 能力证明；能力与匹配仍是 Store 链下判断，`UVPIdentityRegistry` 只解析 SID、account 与 active 状态。
- Stage supplier patch 不是业务完成；某个业务结果是否发生仍看目标 source/signal 的 `SignalSubmitted`。
- Stage supplier patch 不回写 Plan；Plan 仍代表被 published 的静态版本。

相关总览见 [Stage Overlay：Supplier Patch 与阶段文件写入](stage-overlay.md)。
