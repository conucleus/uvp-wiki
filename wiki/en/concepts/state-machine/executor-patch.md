---
title: Executor Patch
type: explanation
audience: 工程贡献者
status: verified
---

# Executor Patch

Executor patch is one kind of Stage Overlay runtime change. It affects only the target stage executor of one Order. It does not modify the Plan and does not modify the Supplier Directory.

## What It Solves

Some stage executors are settled at order runtime by a selector stage. The Plan fixes the flow and the candidate scope; the concrete wallet lands as an order-level decision. For example, after a buyer confirms materials, the buyer can assign a concrete customs broker wallet for a later customs stage.

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

## Contract Checks

Executor patch is constrained by at least these checks:

- Selector stage and target stage must have a `StageSelectorBinding`.
- The selector must have order-level internal patch authorization.
- Patch nonce must increase.
- Executor address cannot be zero.
- The mode set is `assign` / `handoff`: `assign` lands before the target stage's first signal, `handoff` lands after it and requires the previous executor's signature over the same digest.
- The Plan must declare at least one current-order signal capability for the target stage through `sendSignals`, and must commit the executor candidate set through `executorCandidatesRoot` (candidateProof membership proof; plans without a committed candidate set fail closed for all executor patches).
- Eligibility is proven by the submitter: the patch carries a bindingProof (membership proof for the selector-binding leaf) and stageFacts (capability-leaf proofs for the target stage), which the contract verifies against `capabilitiesRoot`; all-zero means no proof carried.
- After activation, the contract automatically delegates those Plan-declared `(sourceId, signalId)` capabilities to the new executor; the wallet does not need to be in the candidate-wallet authorization table when the Order is created.
- A later handoff moves the still-unwritten capability scope to the new executor; already-written Signals stay as recorded and keep their original submitters.

This is Plan-bounded automatic delegation, not wildcard Signal authority for the executor. The selector may change who executes, but cannot expand what the Zhixu has declared that this stage may emit. The selector binding is a public-interface constraint frozen when the Plan is published; patches can only consume it, never bypass or rewrite it. For the public-interface boundary, see [Protocol Boundaries](../protocol-boundaries.md).

## Code Entry Points

| Code | Meaning |
| --- | --- |
| `UVPStagePatchModule.sol` | `applyStageExecutorPatch`, `applyStageExecutorPatchFor`, patch digest, mode checks (EIP-712 domain `stageExecutorPatch` 0.4). |
| `UVPStateMachine.sol` | Active executor activation and later signal checks. |
| `UVPPlanMetadataModule.sol` | Stores the `capabilitiesRoot` and verifies the bindingProof/stageFacts carried by patches. |
| `protocol-bindings/src/index.ts` | Stage executor patch typed data, call builder, signer recovery. |
| `uvp-chain-services/service/src/stage-patches/` | Product API prepare/submit executor patch. |

## Dock-Stage Executor: a One-Time Selection Path

A dock-stage executor does not use the generic executor patch. It is selected once through `UVPStagePatchModule.selectStageDockExecutor`: the `StageDockExecutorSelected` event records dockId, fromPlanId, executor, selector, and patchHash; replays of the same dkid + executor are absorbed idempotently, replacing the selection rejects with `StageDockExecutorAlreadySelected`, and later generic patches reject with `StageExecutorPatchForbiddenOnDockStage`. See [Dock and Binding](docking.md).

## Boundaries

- Executor patch is not supplier capability proof; capability and matching remain Store judgments, while Identity Registry only resolves subject-to-account identity.
- Executor patch is not business completion; whether an outcome occurred still comes from the target source/signal `SignalSubmitted`.
- Executor patch does not write back to the Plan; the Plan remains the published static version.

See [Stage Overlay: Executor Patch and Stage File Patch](stage-overlay.md) for the overview.
