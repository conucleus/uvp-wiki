---
title: Stage Supplier Patch
type: explanation
audience: 工程贡献者
status: verified
---

# Stage Supplier Patch

A stage supplier patch is one kind of Stage Overlay runtime change. It affects only the target stage supplier of one Order. It does not modify the Plan and does not modify the Store's Supplier Directory.

## What It Solves

Some stage suppliers are selected or handed off at order runtime by a selector stage: the Plan fixes the flow, the selector relation, and the candidate scope, while the concrete SID lands at order level. For example, after a buyer confirms materials, the buyer can assign a concrete customs broker SID for a later customs stage.

```text
selector stage
  -> StageSupplierPatch typed data
  -> selector (assigned supplier account) signature
  -> applyStageSupplierPatchFor
  -> StageSupplierPatchApplied
  -> stage -> supplierId assignment updated
  -> target stage future signal must be signed by accountOf(new SID)
```

## Contract Checks

A stage supplier patch is constrained by at least these checks:

- The selector stage and target stage must have a `StageSelectorBinding` (`bindingProof` verified against `capabilitiesRoot`).
- The selector must be the selector stage's currently effective assigned supplier account (`isEffectiveStageAccount`).
- The patch nonce must increase.
- The target supplierId cannot be zero, and the SID must be `active`.
- `previousSupplierId == 0` is an assign (only before the target stage's first signal); a non-zero value is a handoff (only after the first signal, and it requires the previous assigned supplier account's signature over the same digest; revoking a supplier in `UVPIdentityRegistry` is terminal and prevents further handoff).
- Fixed stages always reject a patch; candidate stages must hit the Plan's kind=1 candidate leaf in `supplierBindingsRoot` (`candidateProof`); dynamic stages need no proof and may assign any active SID; birth/dock stages always reject a patch.
- The patch only changes `stage -> supplierId` and writes no authorization set; already-written Signals stay as recorded, and historical `SignalSubmitted` keeps its original submitter.

This is a Plan-bounded supplier assignment, not wildcard Signal-writing authority for the supplier. The selector may change who carries the stage, but cannot expand what the Zhixu has declared that this stage may emit. The selector binding is a public-interface constraint frozen when the Plan is published; patches can only consume it, never bypass or rewrite it. For the public-interface boundary, see [Protocol Boundaries](../protocol-boundaries.md).

## Code Entry Points

| Code | Meaning |
| --- | --- |
| `UVPStagePatchModule.sol` | `applyStageSupplierPatch`, `applyStageSupplierPatchFor`, patch digest, assign/handoff and candidate checks (EIP-712 domain `stageSupplierPatch` 1). |
| `UVPStateMachine.sol` | `activateStageSupplierFromModule`, effective-supplier resolution, and later signal checks. |
| `UVPPlanMetadataModule.sol` | Stores the `capabilitiesRoot` and verifies `bindingProof`. |
| `protocol-bindings/src/index.ts` | Stage supplier patch typed data, call builder, signer recovery. |
| `uvp-chain-services/service/src/stage-patches/` | Chain-read projection. |

## Dock Supplier: a One-Time Selection Path

A dock-stage supplier does not use the generic stage supplier patch. It is selected once through `UVPStagePatchModule.selectStageDockSupplier`: the `StageDockSupplierSelected` event records targetStageId, dockId, supplierId, and patchNonce; replays of the same dkid + supplier are absorbed idempotently, replacing the selection rejects with `StageDockSupplierAlreadySelected`, and later generic patches reject with `StageSupplierPatchForbiddenOnDockStage`. See [Dock and Binding](docking.md).

## Boundaries

- A stage supplier patch is not supplier capability proof; capability and matching remain Store judgments, while `UVPIdentityRegistry` only resolves the SID, account, and active status.
- A stage supplier patch is not business completion; whether an outcome occurred still comes from the target source/signal `SignalSubmitted`.
- A stage supplier patch does not write back to the Plan; the Plan remains the published static version.

See [Stage Overlay: Supplier Patch and Stage File Writes](stage-overlay.md) for the overview.
