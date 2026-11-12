---
title: Stage File Patch
type: explanation
audience: 工程贡献者
status: verified
---

# Stage File Patch

A stage file patch rewrites the file map of one target stage at order level: the order keeps its Plan and changes only that stage's `fileResources` mapping (`key -> (contentHash, handle)`). The chain stores content hashes and opaque handles; business plaintext stays in object storage or participant-private storage. For the static resource object see [File Resources](../core/file-resources.md).

## Data Structure and Entry Point

The file map is owned by `UVPFileResourceModule`; the core `UVPStateMachine` reaches it only through the `fileResourceModule()` directory, and the module treats `msg.sender == stateMachine` as its single trust gate.

The order-level entry point is the trailing part of direct `submitSignal`:

```text
submitSignal(planId, orderId, sourceId, signalId, payloadHash, idempotencyKey,
             attribution, bytes32 filesDigest, FilePatch filePatch)

FilePatch {
  bytes32 targetStageId;
  bytes32 baseHash;        // required: the stage's current file version
  bytes32 writerStageId;   // 0 resolves to the signal's stage
  bytes32[] writerProof;   // fileWriters capability-leaf membership proof
  FileOp[] ops;            // {kind, key, contentHash, handle}
}
```

- `signalId == 0`: a pure file patch, with no business signal, submitted on its own; `filesDigest = keccak256(canonicalFilePatch(planId, orderId, filePatch))`.
- `signalId != 0`: the business signal is submitted first, then the file patch is applied in the same transaction (one business signal, one target stage).
- One request carries at most one business signal and one target stage.

## Keys and Ops

| op | Precondition | Result |
| --- | --- | --- |
| `add` | key absent | writes `key -> (contentHash, handle)` |
| `replace` | key present | replaces the current value |
| `remove` | key present | deletes the key |

- `handle` is an opaque, bounded (≤512 bytes) reference; the engine never resolves it, never stores plaintext, and never reaches application storage.
- The chain defines no `fileType` and carries no type/storage semantics: file types are backend-defined, freestyle, and non-enumerable; the engine exposes only a minimal primitive.
- `baseHash` is required and equals the stage's file version at signing time (`filesHash = keccak256(abi.encode(oldHash, patchHash))` rolling); a mismatch rejects the whole patch.
- The map always holds exactly one current value per key; replacement uses `replace` / `remove`, there is no nonce, and an already-applied `patchHash` is absorbed first-win instead of being recorded twice.

## Authorization

Writer authorization comes from the stage-level `fileWriters` allowlist (the target stage declares which stages may write its files; the stage itself is implicitly allowed and does not self-reference). At compile time every `(targetStageId, writerStageId)` pair is folded into a `UVP_FILE_WRITER_V1` capability leaf inside `capabilitiesRoot`; on chain `UVPPlanMetadataModule.verifyFileWriter` verifies membership proofs.

Submitter authentication reuses the `SignalAuthorization` table:

- signal + file: the business signal's existing authorization row; `writerStageId == 0` resolves to the signal's stage, and a different target must additionally pass that target's `fileWriters` allowlist.
- pure file patch: the writer stage's reserved `FILE_WRITE_SIGNAL_ID` row.
- static and dynamic executors are both just rows on that table; `activeStageExecutor` is not a file-write oracle.

## Events and Replay

- `StageFilePatchApplied`: once per transaction, with `patchHash` / `baseHash` / `writerStageId` / `opCount`.
- `StageFileOpApplied`: once per op, with `kind` / `key` / `contentHash` / `handle`.

Indexers replay the file map in log order within the same transaction instead of deriving it; projections can be rebuilt from these events plus `order_stage_record.file_resources`.

## Relationship to Business Signals

- A pure file patch is a first-class patch fact: it does not increment business signal counts, evaluate hooks, or run admission.
- File writes are independent of the "stage already has a signal" timing gate; that gate belongs to executor patch assign/handoff.
- Terminal state is driven only by the local stage/order end; a file patch only changes the file handles the stage references.

## Code Entry Points

| Code | Meaning |
| --- | --- |
| `UVPFileResourceModule.sol` | `applyStageFilePatch`, `fileWriters` capability checks, `StageFilePatchApplied` / `StageFileOpApplied`. |
| `UVPStateMachine.sol` | Trailing `filesDigest` / `FilePatch` entry in `submitSignal`; the `signalId == 0` pure file branch. |
| `UVPPlanMetadataModule.sol` | `verifyFileWriter` membership verification. |
| `protocol-bindings/src/index.ts` | File patch typed data / call builder and signer recovery. |
| `uvp-chain-services/service/src/` | `/chain/*` projections and Product API read surface. |

See [Stage Overlay](stage-overlay.md) for the overview, and [Executor Patch](executor-patch.md) for the other overlay kind.
