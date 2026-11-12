---
title: Stage Patch Authorization
type: explanation
audience: 工程贡献者
status: verified
---

# Stage Patch Authorization

A stage patch is a controlled runtime change action for an order and comes in two kinds: an executor patch selects or hands off the executor of a target stage within the order, and a stage file patch rewrites the target stage's file map. Both reuse order-level authorization; the Plan stays a static version and the change lands only on the single Order.

## Internal Signals

Product submission flows derive internal order-level authorizations per action:

| Action | Internal signal |
| --- | --- |
| `stage_executor_patch` | `EXECUTOR_PATCH_SIGNAL_ID` |
| Pure stage file patch | `FILE_WRITE_SIGNAL_ID` (the writer stage's reserved authorization row) |
| File patch riding a business signal | Reuses that business signal's authorization row |

The source usually comes from the stage that initiated the patch:

```text
sourceId = keccak256(stageId)
```

When an order is registered these rows can be written through `SignalAuthorization[]`; the executor patch selector must be the order creator or hold an order-level authorization for `(selectorStageId, EXECUTOR_PATCH_SIGNAL_ID)`.

## Stage-to-target Binding

The change relation between two stages is constrained by the stage-to-target binding frozen by the Plan:

```text
selectorStageId -> targetStageId
```

The contract verifies it with `UVPPlanMetadataModule.verifyStageSelectorBinding` against a `capabilitiesRoot` membership proof; an executor patch without a declared binding is rejected. Stage file writes are additionally constrained by the target stage's `fileWriters` allowlist (a `UVP_FILE_WRITER_V1` capability leaf).

## Executor Patch

An executor patch selects or hands off the executor of the target stage within an order, with the closed mode set `assign` / `handoff`: `assign` lands before the target stage's first signal, while `handoff` lands after the first signal and requires the previous executor's signature over the same EIP-712 digest.

The contract checks the increasing nonce, order-level authorization, the stage-to-target binding, and that the candidate executor belongs to the candidate set committed by the Plan via `executorCandidatesRoot` (a `candidateProof` membership proof; a Plan without a candidate set is fail-closed for all executor patches). The patch's EIP-712 signature carries `authorizationsHash`; on effect the contract writes the new executor's authorizations for the Plan's predeclared current-order `(sourceId, signalId)` pairs as order-level explicit authorizations. The executor need not be in the authorization table when the Order is created, but the patch cannot grant signal authority the Plan did not declare. First-writer-wins still applies, and a Signal already written keeps its original submitter.

## Stage File Patch

A stage file patch rewrites the target stage's `fileResources` map (`key -> (contentHash, handle)`); the chain stores only a content hash and an opaque handle. The entry point is the tail of `submitSignal`: `signalId == 0` means a pure file patch (no business signal), otherwise a business signal is submitted first and the file patch applied in the same transaction. The write is owned by `UVPFileResourceModule.applyStageFilePatch`, whose ops are `add` / `replace` / `remove`; `baseHash` is mandatory (the stage's current file version), the patch is whole-and-atomic with rollback on any failure, and there is no nonce. Events `StageFilePatchApplied` / `StageFileOpApplied` are replayed by the indexer in same-transaction log order.

Write authorization combines the stage-level `fileWriters` allowlist with the `SignalAuthorization` table: a signal + file request reuses the business signal's existing authorization row (`writerStageId == 0` resolves to the signal's stage), and a pure file patch uses the writer stage's `FILE_WRITE_SIGNAL_ID` row.

## Why It Belongs to the Authorization System

A stage patch changes an order's execution path and stage file references. Both patch kinds require order-level authorization and an EIP-712 signature, so the Store or a backend cannot bypass participant permissions to change an executor or a file reference; the contract and the projection recover state from the same event stream.

For the executor patch mechanism see [Executor Patch](../state-machine/executor-patch.md), for the stage file patch mechanism see [Stage File Patch](../state-machine/file-patch.md), and for the authorization layering overview see [Protocol Boundaries](../protocol-boundaries.md).
