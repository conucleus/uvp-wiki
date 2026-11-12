---
title: Stage Overlay (Executor Patch and Stage File Patch)
type: explanation
audience: 工程贡献者
status: verified
---

# Stage Overlay (Executor Patch and Stage File Patch)

Stage overlay is the order-level patch mechanism: it lets one order assign a new executor for a target stage, or rewrite that stage's file map, without modifying the Plan. Both actions are order-level execution facts, and both keep the Plan statically auditable. The contract checks and code entry points of each kind are in [Executor Patch](executor-patch.md) and [Stage File Patch](file-patch.md).

## Executor Patch

`StageExecutorPatchApplied` / `StageExecutorActivated` change the target stage executor of a single order; the Plan and the Supplier Directory stay as published. The contract requires:

- A `StageSelectorBinding` between the patching stage and the target stage (membership proven by the bindingProof carried with the patch).
- The patch selector holds order-level authorization for the internal `EXECUTOR_PATCH_SIGNAL_ID` (the order creator may act as selector, still subject to the binding and candidate-set gates).
- The target executor must be a member of the `executorCandidatesRoot` committed by the Plan at `commitPlan` (candidateProof membership proof; plans without a committed candidate set fail closed for all executor patches).
- The mode set is `assign` / `handoff`: `assign` lands before the target stage's first signal, `handoff` lands after it and requires the previous executor's signature over the same digest.
- The nonce must increase, so an older patch cannot overwrite a newer one.

When a patch activates, the contract writes the target stage's Plan-declared `(sourceId, signalId)` capabilities as an explicit order-level authorization set (its hash is committed by the selector signature). The selected wallet gains exactly that submittable scope; a patch cannot expand Plan capabilities. A later handoff moves the still-unwritten scope to the new executor; already-written Signals stay as recorded and keep their original submitters.

A dock-stage executor is a separate one-time selection path: `UVPStagePatchModule.selectStageDockExecutor` selects the dock executor and emits `StageDockExecutorSelected`; replacing the selection is rejected with `StageDockExecutorAlreadySelected`. It is not a generic executor patch; see [Executor Patch](executor-patch.md) and [Dock and Binding](docking.md).

## Stage File Patch

The stage file map is a stage fact owned by `UVPFileResourceModule`: each stage keeps `key -> (contentHash, handle)`; the chain stores only the content hash and an opaque, bounded handle, never plaintext, and carries no file-type semantics.

An order-level rewrite travels in the trailing `FilePatch` of `submitSignal`:

```text
submitSignal(planId, orderId, sourceId, signalId, payloadHash, idempotencyKey,
             attribution, filesDigest, FilePatch filePatch)

FilePatch {
  bytes32 targetStageId;
  bytes32 baseHash;        // required: the stage's current file version
  bytes32 writerStageId;   // 0 resolves to the signal's stage
  bytes32[] writerProof;   // fileWriters capability-leaf membership proof
  FileOp[] ops;            // add / replace / remove
}
```

- `signalId == 0` is a pure file patch: it carries no business signal and is submitted on its own; `filesDigest = keccak256(canonicalFilePatch(planId, orderId, filePatch))`.
- `add` requires the key to be absent; `replace` / `remove` require it to be present. Preconditions are strict and the whole patch is atomic: any failing op rolls the whole transaction back.
- `baseHash` is required and must equal the stage's file version at signing time (`filesHash = keccak256(abi.encode(oldHash, patchHash))` rolling); a mismatch rejects the whole patch.
- The map always holds exactly one current value per key; replacements use `replace` / `remove`, and an already-applied `patchHash` is absorbed first-win.

Events: `StageFilePatchApplied` (once per transaction, with `patchHash` / `baseHash` / `writerStageId` / `opCount`) and `StageFileOpApplied` (once per op, with `kind` / `key` / `contentHash` / `handle`). Indexers replay them in log order within the same transaction. Authorization and the full rule set are in [Stage File Patch](file-patch.md).

## Why the Plan Is Not Modified

The Plan is the publisher-signed static version. Runtime supplier selection, executor handoff, and file-map rewrites are execution facts of one order: they land only as order-level chain records, while the Plan's commitment surface stays intact. Anyone can replay these overlays from events.

## Boundaries

- An executor patch changes who executes; a stage file patch changes which files the stage references. Their fields and signed payloads are never mixed.
- An executor patch is not supplier capability proof; capability and matching remain Store judgments, while the Identity Registry only resolves subject-to-account identity.
- A stage file patch never puts business plaintext on chain; text is carried by object storage, metadata URIs, and content hashes.
- Neither patch represents business completion; outcomes still come from the target source/signal's `SignalSubmitted` and hook status.
