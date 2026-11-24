---
title: Stage File Writes
type: explanation
audience: 工程贡献者
status: verified
---

# Stage File Writes

A stage file write is an order-level file-map change: an order does not modify the Plan, it only writes the target stage's `{key, payload}` map. The chain stores opaque payloads; business bodies stay in object storage or participant-private storage. For static resource declarations see [File Resources](../core/file-resources.md).

## Data Structure and Entry Point

The file map is owned by `UVPFileResourceModule`; the core `UVPStateMachine` reaches it only through the `fileResourceModule()` directory, and the module treats `msg.sender == stateMachine` as its single trust gate.

The order-level entry point is direct `submitSignal`'s `files` field:

```text
submitSignal(
  SignalSubmission {
    ...,
    targetStageId,
    files: StageFile[]   // StageFile { string key; bytes payload }
  },
  signature
)
```

- `signalId == 0`: a pure file write with no business signal, submitted on its own.
- `signalId != 0`: the business signal is submitted first, then the file writes are applied in the same transaction (one business signal, one target stage).
- One call carries at most 16 file entries; a key is ≤128 bytes and a payload is ≤4096 bytes.

## Keys and Overwrite

```text
key -> payload
```

- `payload` is an opaque, bounded (≤4096 bytes) byte string; the engine does not parse it, stores no body, and never reaches application storage.
- The chain defines no `fileType` and carries no type/storage semantics: file types are application-defined, non-enumerable open strings, and the engine provides only the minimal primitive.
- Re-writing the same key overwrites it; each key has exactly one current payload, with no per-key version history and no operation state machine.
- Entries within one write apply one by one; any failure rolls the whole call back.

## Authorization

Writer authorization comes from the stage-level `fileWriters` allowlist (the target stage declares which stages may write its files; the stage itself is implicitly writable and never self-referenced). `fileWriters` produces no capability leaf: the compiler turns each `(targetStageId, writerStageId)` pair into `StageFileWriter[]`, separately signed and committed by the PlanCommit's `fileWritersHash`.

The concrete submitter is resolved by assigned supplier account:

- signal + file: the submitter is the assigned supplier account of the source/stage owning the business signal; if the target differs, the target's `fileWriters` allowlist must also contain that writer stage.
- pure file write: the submitter is the assigned supplier account of the target stage or of a writer stage declared in `fileWriters`.
- All SIDs must be `active`; static, dynamic, and dock stages all resolve through the same `accountOf(effective supplier)`.

## Events and Replay

- `StageFileWritten`: one event per key write, carrying `key` / `payload` / `submitter`.

Indexers replay the file map in log order within the same transaction instead of deriving it; projections can be rebuilt from these events and the order facts.

## Relationship to Business Signals

- A pure file write is a first-class fact: it does not increment business signal counts, evaluate hooks, or run admission.
- File writes are not subject to the "target stage already has a signal" stage supplier patch timing gate.
- Terminal state is driven only by the local stage/order end; a file write only changes that stage's opaque payload.

## Code Entry Points

| Code | Meaning |
| --- | --- |
| `UVPFileResourceModule.sol` | `applyStageFiles`, `getStageFile`, `StageFileWritten`. |
| `UVPStateMachine.sol` | `submitSignal`'s `files` entry; the `signalId == 0` pure file branch and `isAuthorizedFileWriter` check. |
| `protocol-bindings/src/index.ts` | `StageFile` typed data / call builder and signer recovery. |
| `uvp-chain-services/service/src/` | `/chain/*` projections and the Product API read surface. |

See [Stage Overlay](stage-overlay.md) for the overview, and [Stage Supplier Patch](executor-patch.md) for the other overlay kind.
