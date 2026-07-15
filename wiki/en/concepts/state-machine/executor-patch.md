# Executor Patch

Executor patch is one kind of Stage Overlay runtime change. It affects only the target stage executor of one Order. It does not modify the Plan and does not modify the Supplier Directory.

## What It Solves

Some stage executors are not fully fixed in the Plan. They are selected, handed off, or replaced at order runtime by a selector stage. For example, after a buyer confirms materials, the buyer can assign a concrete customs broker wallet for a later customs stage.

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

- selector stage and target stage must have a `StageSelectorBinding`.
- the selector must have order-level internal patch authorization.
- patch nonce must increase.
- executor address cannot be zero.
- modes such as assign, handoff, and replacement have different previous-executor or approval-signal requirements.
- the Plan must declare at least one current-order signal capability for the target stage through `sendSignals`.
- after activation, the contract automatically delegates those Plan-declared `(sourceId, signalId)` capabilities to the new executor; the wallet does not need to be a preauthorized candidate when the Order is created.
- a later replacement or handoff moves the still-unwritten capability scope to the new executor; already written Signals remain unchanged.

This is Plan-bounded automatic delegation, not wildcard Signal authority. The selector may change who executes, but cannot expand what the Zhixu says that stage may emit.

## Code Entry

| Code | Meaning |
| --- | --- |
| `UVPStagePatchModule.sol` | `applyStageExecutorPatch`, `applyStageExecutorPatchFor`, patch digest, mode checks. |
| `UVPStateMachine.sol` | active executor activation and later signal checks. |
| `UVPPlanMetadataModule.sol` | Plan signal capabilities compiled from `sendSignals`, which cap dynamic delegation. |
| `protocol-bindings/src/index.ts` | stage executor patch typed data, call builder, signer recovery. |
| `uvp-chain-services/service/src/stage-patches/` | Product API prepare/submit executor patch. |

## Boundaries

- Executor patch is not Supplier capability proof; capability and matching remain Store judgments, while Identity Registry only resolves subject/account identity.
- Executor patch is not a business outcome; whether an outcome occurred still comes from the target source/signal `SignalSubmitted`.
- Executor patch does not write back to the Plan; the Plan remains the published static version.

See [Stage Overlay: Executor Patch and Resource Patch](stage-overlay.md) for the overview.
