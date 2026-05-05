# Executor Patch

Executor patch is one kind of Stage Overlay runtime change. It affects only the target stage executor of one Order. It does not modify the Plan and does not modify the Supplier Registry.

## What It Solves

Some stage executors are not fully fixed in the Plan. They are selected, handed off, or replaced at order runtime by a selector stage. For example, after a buyer confirms materials, the buyer can assign a concrete customs broker wallet for a later customs stage.

```text
selector stage
  -> stage_executor_patch typed data
  -> selector wallet signature
  -> applyStageExecutorPatchFor
  -> StageExecutorPatchApplied
  -> StageExecutorActivated
  -> target stage future signal must match active executor
```

## Contract Checks

Executor patch is constrained by at least these checks:

- selector stage and target stage must have a `StageSelectorBinding`.
- the selector must have order-level internal patch authorization.
- patch nonce must increase.
- executor address cannot be zero.
- modes such as assign, handoff, and replacement have different previous-executor or approval-signal requirements.
- after activation, future business signals for the target stage still pass normal source/signal authorization checks, and the submitter must match the active executor.

## Code Entry

| Code | Meaning |
| --- | --- |
| `UVPStagePatchModule.sol` | `applyStageExecutorPatch`, `applyStageExecutorPatchFor`, patch digest, mode checks. |
| `UVPStateMachine.sol` | active executor activation and later signal checks. |
| `protocol-bindings/src/index.ts` | stage executor patch typed data, call builder, signer recovery. |
| `uvp-chain-services/service/src/stage-patches/` | Product API prepare/submit executor patch. |

## Boundaries

- Executor patch is not Supplier trust; supplier endorsement still comes from `ZhixuTrustRegistry`.
- Executor patch is not business completion; completion still comes from the target source/signal `SignalSubmitted`.
- Executor patch does not write back to the Plan; the Plan remains the attested static version.

See [Stage Overlay: Executor Patch and Resource Patch](stage-overlay.md) for the overview.
