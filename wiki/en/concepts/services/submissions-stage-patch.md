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
prepare typed data
  -> payload hash binding
  -> participant signs EIP-712 typed data
  -> submit signed payload (direct or relay)
  -> verify signer and payload structure
  -> broadcast
  -> track tx hash / failure / retry
  -> indexer confirms chain event
```

- Business signatures can only come from authorized participant wallets; a relayer pays gas and broadcasts but creates no business signature.
- Submission state is operational state: it says whether a transaction was sent, failed, or confirmed; order progress comes from `SignalSubmitted`, `HookReady`, or stage patch events.
- Product business rows, wallet sessions, and submission orchestration belong to the application side; chain-services keeps only chain projections and generic chain reads.

## The Two Kinds of Stage Patch Authorization Action

| Patch | What it changes | Boundary |
| --- | --- | --- |
| Executor patch | The active executor of the target stage within one order. | The Plan static version is unchanged; candidate executors are committed by `executorCandidatesRoot`, and the selector's EIP-712 signature plus order-level authorization take effect together. |
| Stage file patch | The target stage's file map within one order (`key -> contentHash + handle`). | The body stays off chain; `baseHash` is mandatory and the patch is whole-and-atomic; events `StageFilePatchApplied` / `StageFileOpApplied`. |

- Executor patch entry: `UVPStagePatchModule.applyStageExecutorPatch` / `applyStageExecutorPatchFor` (the `assign` / `handoff` modes; `candidateProof` membership proof), event `StageExecutorPatchApplied`.
- Dock executor selection: `selectStageDockExecutor` / `selectStageDockExecutorFor` selects once, event `StageDockExecutorSelected`; binding and output emission events are `DockBindingPoked` / `DockOutputSubmitted`.
- Stage file patch entry: `filesDigest` / `FilePatch` at the tail of direct `submitSignal` (`signalId == 0` means a pure file patch), applied through `UVPFileResourceModule.applyStageFilePatch` as `add` / `replace` / `remove`.
- Both patch kinds are order-level facts and the projection rebuilds them from the same event stream; typed data, call builders, and digests are maintained by `uvp-client/package/src/core/` and `uvp-protocol/packages/protocol-bindings/`.

## Projection Entries

The chain-services projection entries are `src/indexer/projections/stage.ts` (`StageExecutorPatchApplied` / `StageDockExecutorSelected` / hook lifecycle), `src/indexer/projections/stage-files.ts` (`StageFilePatchApplied` / `StageFileOpApplied`), and `src/indexer/projections/dock.ts` (bindings and outputs); generic chain reads live in `src/api/routes/chain-read.ts`.

## Boundaries

The boundaries below make the [protocol boundary overview](../protocol-boundaries.md) concrete on the submission path; for patch authorization and trust semantics see also [Stage Patch Authorization](../trust/stage-patch.md).

- The selector signature must come from the authorized selector, not from the relayer.
- A patch only affects a single order's executor or file references and does not modify the plan version.
- Business completion and patch outcomes are determined by on-chain events; submission state does not advance orders.
- The file map stores only a contentHash and an opaque handle; business bodies stay off chain.
