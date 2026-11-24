---
title: Stage Overlay (Supplier Patch and Stage File Writes)
type: explanation
audience: 工程贡献者
status: verified
---

# Stage Overlay (Supplier Patch and Stage File Writes)

Stage overlay is the order-level change mechanism: it lets one order assign a new supplier for a target stage, or write that stage's file map, without modifying the Plan. Both actions are order-level execution facts, and both keep the Plan statically auditable. The contract checks and code entry points of each kind are in [Stage Supplier Patch](executor-patch.md) and [Stage File Writes](file-patch.md).

## Stage Supplier Patch

`StageSupplierPatchApplied` (the first-assignment path also emits `StageSupplierAssigned`) changes the target stage supplier of a single order; the Plan and the Supplier Directory stay as published. The contract requires:

- A `StageSelectorBinding` between the patching stage and the target stage (membership proven by the bindingProof carried with the patch).
- The patch selector must be the selector stage's currently effective assigned supplier account; there is no order-level internal patch authorization table.
- The target supplier of a candidate stage must hit the Plan's kind=1 candidate leaf in `supplierBindingsRoot` committed at `commitPlan` (candidateProof membership proof); fixed stages always reject; dynamic stages need no proof and may assign any active SID; birth/dock stages always reject.
- `previousSupplierId` distinguishes: `0` is an assign (before the target stage's first signal), non-zero is a handoff (after the first signal, and it requires the previous assigned supplier account's signature over the same digest).
- The nonce must increase, so an older patch cannot overwrite a newer one.

A patch only changes `stage -> supplierId` and writes no authorization set. The selected SID's supplier account thereby gains that stage's submission authority; a patch cannot expand the Plan's capability boundary. A later handoff moves the same stage, as long as it has not been written for the first time, to the new supplier; already-written Signals stay as recorded, and historical `SignalSubmitted` keeps its original submitter.

A dock-stage supplier is a separate one-time selection path: `UVPStagePatchModule.selectStageDockSupplier` selects the dock supplier and emits `StageDockSupplierSelected`; replacing the selection is rejected with `StageDockSupplierAlreadySelected`. It is not a generic stage supplier patch; see [Stage Supplier Patch](executor-patch.md) and [Dock and Binding](docking.md).

## Stage File Writes

The stage file map is a stage fact owned by `UVPFileResourceModule`: each stage keeps `StageFile{string key; bytes payload}`; the chain stores only the opaque payload, never the body, and carries no file-type semantics.

An order-level write travels in `submitSignal`'s `files` field:

```text
submitSignal(
  SignalSubmission {
    ...,
    targetStageId,
    files: StageFile[]   // { string key; bytes payload }
  },
  signature
)
```

- `signalId == 0` is a pure file write: it carries no business signal and is submitted on its own.
- Re-writing the same key overwrites it; each key has exactly one current payload, with no per-key version history.
- Entries apply one by one and the whole call is atomic; any failure rolls the whole transaction back.
- One call carries at most 16 entries; a key is ≤128 bytes and a payload ≤4096 bytes.

Events: `StageFileWritten` (one per key write, carrying `key` / `payload` / `submitter`); indexers replay in log order within the same transaction and never derive. Authorization and the full rule set are in [Stage File Writes](file-patch.md).

## Why the Plan Is Not Modified

The Plan is the publisher-signed static version. Runtime supplier selection, handoff, and file writes are execution facts of one order: they land only as order-level chain records, while the Plan's commitment surface stays intact. Any participant can replay these overlays from events.

## Boundaries

- A stage supplier patch changes "who carries the stage"; a stage file write changes "which opaque payload the stage stores". Their fields and signed payloads are never mixed.
- A stage supplier patch is not supplier capability proof; capability and matching remain Store judgments, while `UVPIdentityRegistry` only resolves SID, account, and active status.
- A stage file write never puts a business body on chain; the body is carried by object storage, metadata URIs, and content hashes.
- Neither action represents business completion; outcomes still come from the target source/signal's `SignalSubmitted` and hook status.
