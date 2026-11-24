---
title: Submissions and Stage Patch
type: reference
audience: 应用开发者
status: verified
---

# Submissions and Stage Patch

This page states the boundary between off-chain submission paths and stage patches: signing and direct/relay delivery are done by participant wallets, `uvp-client`, and the application side; chain-services only indexes events, rebuilds projections, and serves chain reads — it does not broadcast transactions or create business signatures.

## Submission Lifecycle

```text
prepare UVPStateMachineSignalSubmission typed data
  -> payload hash / files hash / attribution hash binding
  -> assigned supplier account signs EIP-712 typed data
  -> submit signed payload (direct or relay)
  -> verify signer and payload structure
  -> broadcast
  -> track tx hash / failure / retry
  -> indexer confirms chain event
```

- Business signatures can only come from the assigned supplier account; a relayer pays gas and broadcasts but creates no business signature.
- Submission state is operational state: it says whether a transaction was sent, failed, or confirmed; order progress comes from `SignalSubmitted`, `HookReady`, or stage supplier patch events.
- Product business rows, wallet sessions, and submission orchestration belong to the application side; chain-services keeps only chain projections and generic chain reads.

## The Two Kinds of Stage Patch Action

| Action | What it changes | Boundary |
| --- | --- | --- |
| Stage supplier patch | The supplierId of a target stage within one order. | The Plan static version is unchanged; candidate stages prove a kind=1 leaf in `supplierBindingsRoot`, and the selector must be the selector stage's assigned supplier account. |
| Stage file write | The target stage's `{key, payload}` map within one order. | The body stays off chain; the same key overwrites and the call is atomic; event `StageFileWritten`. |

- Stage supplier patch entry: `UVPStagePatchModule.applyStageSupplierPatch` / `applyStageSupplierPatchFor` (with `previousSupplierId` distinguishing assign / handoff; `candidateProof` membership proof), event `StageSupplierPatchApplied`.
- Dock supplier selection: `selectStageDockSupplier` / `selectStageDockSupplierFor` selects once, event `StageDockSupplierSelected`; binding and output emission events are `DockBindingPoked` / `DockOutputSubmitted`.
- Stage file write entry: `submitSignal`'s `files: StageFile[]` (`signalId == 0` is a pure file write), applied by `UVPFileResourceModule.applyStageFiles` with the same key overwriting.
- Both actions are order-level facts and the projection rebuilds them from the same event stream; typed data, call builders, and digests are maintained by `uvp-client/package/src/core/` and `uvp-protocol/packages/protocol-bindings/`.

## Projection Entries

The chain-services projection entries are `src/indexer/projections/stage.ts` (`StageSupplierPatchApplied` / `StageDockSupplierSelected` / hook lifecycle), `src/indexer/projections/stage-files.ts` (`StageFileWritten`), and `src/indexer/projections/dock.ts` (bindings and outputs); generic chain reads live in `src/api/routes/chain-read.ts`.

## Boundaries

The boundaries below make the [protocol boundary overview](../protocol-boundaries.md) concrete on the submission path; for patch authorization and trust semantics see also [Stage Patch Authorization](../trust/stage-patch.md).

- The selector signature must come from the authorized selector (the selector stage's assigned supplier account), not from the relayer.
- A patch only affects a single order's supplier or file references and does not modify the plan version.
- Business completion and patch outcomes are determined by on-chain events; submission state does not advance orders.
- The file map stores only opaque `{key, payload}`; business bodies stay off chain.
