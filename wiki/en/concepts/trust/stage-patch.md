---
title: Stage Patch Authorization
type: explanation
audience: 工程贡献者
status: verified
---

# Stage Patch Authorization

A stage patch is a controlled runtime change action for an order and comes in two kinds: a stage supplier patch selects or hands off the target stage's supplier within the order, and a stage file write rewrites the target stage's file map. Both reuse assigned-supplier authority; the Plan stays a static version and the change lands only on the single Order.

## Where Authority Comes From

Authority reuses the stage's assigned supplier:

- A stage supplier patch's selector must be the selector stage's currently effective assigned supplier account (or be authorized by its signature).
- A stage file write's submitter must be the target stage's assigned supplier account, or the assigned supplier account of a writer stage declared in the target stage's `fileWriters`.
- Every path resolves through `UVPIdentityRegistry.accountOf(supplierId)`, and the SID must be `active`.

## Stage-to-target Binding

The change relation between two stages is constrained by the stage-to-target binding frozen by the Plan:

```text
selectorStageId -> targetStageId
```

The contract verifies it with `UVPPlanMetadataModule.verifyStageSelectorBinding` against a `capabilitiesRoot` membership proof; a supplier patch without a declared binding is rejected. Stage file writes are additionally constrained by the target stage's `fileWriters` allowlist (`StageFileWriter[]`, committed by the PlanCommit `fileWritersHash`).

## Stage Supplier Patch

A stage supplier patch selects or hands off the target stage's supplier within an order, distinguished by `previousSupplierId`: `0` is a first assignment (assign, only before the target stage's first signal), and a non-zero value is a handoff (only after the first signal, and it requires the previous assigned supplier account's signature over the same EIP-712 digest).

The contract checks the increasing nonce, that the selector is the selector stage's assigned supplier account, the stage-to-target binding, and that the candidate supplier belongs to the Plan's kind=1 candidate leaf committed through `supplierBindingsRoot` (a Merkle proof; fixed stages always reject a patch, dynamic stages need no proof and may assign any active supplier, birth/dock stages always reject). When the patch takes effect it only changes `stage -> supplierId` and writes no authorization set; first-writer-wins still applies, and an already-written Signal keeps its original submitter. The event is `StageSupplierPatchApplied`.

## Dock Supplier Selection

For a dock stage, the selector calls `selectStageDockSupplier` (or `selectStageDockSupplierFor` with the selector's EIP-712 signature) to select the supplier once. The contract checks the dock marker, the selector binding, the SID's active status, and the dkid/stage/plan relation; replaying the same dkid+supplier is absorbed idempotently, re-selection reverts `StageDockSupplierAlreadySelected`, and the event is `StageDockSupplierSelected`.

## Stage File Writes

A stage file write directly changes the target stage's `{key, payload}` map, and the chain stores only the opaque payload. The entry is `submitSignal`'s `files: StageFile[]`: `signalId == 0` is a pure file write (no business signal), otherwise the business signal and the file writes take effect atomically in one transaction; `UVPFileResourceModule.applyStageFiles` settles it and the same key overwrites; there is no operation state machine, per-key version history, or nonce. The only event is `StageFileWritten`, which indexers replay in same-transaction log order.

## Why It Belongs to the Authorization System

A stage patch changes an order's execution path and stage file references. Both actions require an assigned supplier account and an EIP-712 signature, so the Store or a backend cannot bypass supplier permissions to change a supplier or a file reference; the contract and projection recover state from the same event stream.

For the supplier patch mechanism see [Stage Supplier Patch](../state-machine/executor-patch.md), for the stage file write mechanism see [Stage File Map](../state-machine/file-patch.md), and for the authorization layering overview see [Protocol Boundaries](../protocol-boundaries.md).
