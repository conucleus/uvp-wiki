---
title: File Resources
type: explanation
audience: 协议读者
preread: ../README.md
status: verified
---

# File Resources

> Prerequisite reading: [Core Concepts](../README.md)
`fileResources` are stage resource handles. They describe which off-chain objects, protocol files, evidence templates, acceptance criteria, or resource manifests a stage needs to reference. On the DSL side they are static declarations; runtime rewrites of a stage's file map for one order are order-level facts carried by the file module. On-chain facts come from authorized signals, content hashes, opaque handles, and events; file plaintext stays off-chain.

## Who Uses It

Nuclei declare fileResources on stages; Store/Product API use them to present protocol and evidence requirements; Order App and uvp-client translate them into upload and validation flows; operators and executors use the same handle model during order-level stage file patches.

## What It Produces

Static declarations enter the compiled artifact's stage route metadata, so read surfaces such as Product API and uvp-client can present protocol and evidence requirements; runtime rewrites are stage file patches — the order atomically rewrites the target stage's file map (`key -> (contentHash, handle)`) with strict ops in its own context, producing `StageFilePatchApplied` / `StageFileOpApplied` events. Whether business is complete still follows authorized signals and proof, not the files themselves.

## Where Authority Comes From

Whether resources satisfy requirements is finally decided by authorized signals and proof, not by the files themselves; only content hashes, opaque handles, and patch events are stored on chain, and plaintext always stays off-chain.

The current compiler's TS shell defines it as a loose handle:

```ts
interface FileResourceLike {
  readonly fileType: string;
  readonly [key: string]: unknown;
}
```

This loose interface is only the shell shape — it is **not** a semantic open-endedness promise: the `fileType` closed set is enforced by the Go cloud-side compile entries (`v0.IsValidFileResourceType`, one shared set across /compile, /validate, and /signal) and the TS chain-track precheck (`FILE_TYPES`, same set); Rust `uvp-core` passes `file_resources` through as opaque JSON values and does not validate `fileType`. Legal values are the closed set `local` / `http` / `txcloud` / `plain_text` (see the table below); invented values outside the set are rejected at compile time. `fileResources`' first responsibility is "a resolvable resource reference" — the storage backend is determined by the handle type, and the DSL offers no arbitrary storage-backend extension point.

## Resource Handles

A stage can use `fileResources` to point to off-chain protocol files, evidence templates, or object-storage resources, with verification info attached:

```yaml
fileResources:
  stage_protocol:
    fileType: http
    httpFile:
      url: "https://example.com/protocols/payment-settlement-v1.json"
  evidence_bucket:
    fileType: txcloud
    txCloudFile:
      bucket: "evidence-bucket"
      region: "ap-guangzhou"
      objectKey: "protocols/payment-settlement-v1.json"
```

This YAML gives Store, Product API, uvp-client, or adapters one resource handle: they can display the protocol, compute hashes, surface evidence requirements, and check acceptance rules. On chain, content hashes, opaque handles, and stage file patch events are stored.

## What fileType Means

`fileType` indicates the handle type; legal values are the DSL closed set (the Go cloud-side compile entries and the TS chain-track precheck reject values outside the set at compile time, by one shared collection):

| fileType | Meaning |
| --- | --- |
| `local` | Local file-path handle (`localFile.path`); suited to fixtures and development samples. |
| `http` | HTTP/HTTPS file URL handle (`httpFile.url`). |
| `txcloud` | Off-chain object-storage (Tencent Cloud COS) handle (`txCloudFile` bucket/region/objectKey); production must not expose plaintext credentials. |
| `plain_text` | Inline plaintext (base64); local fixtures or development samples only, never a production evidence carrier. |

There is no `manifest` / `uri` / `ipfs` / `arweave` / `object_storage` / `onchain` fileType — and no DSL handle for storing resources directly on chain. Contracts, invoices, logistics documents, photos, reports, and vehicle-condition evidence should never go on chain in plaintext; when a verifiable reference is needed, express it via a handle plus a content hash, or keep only hashes and metadata URIs on chain.

## Stage File Map

The runtime file map is an order-level fact owned by `UVPFileResourceModule` (the `UVPStateMachine` only routes through the `fileResourceModule()` directory, and the module trusts `msg.sender == stateMachine` as its only trust gate). Each stage's map is:

```text
key -> (contentHash, handle)
```

- `handle` is an opaque, bounded (≤512 bytes) reference; the engine neither parses it, stores the body, nor touches application storage.
- The chain defines no `fileType` and carries no type/storage semantics: file types are backend-defined, freestyle, and non-enumerable, and the engine provides only the minimal primitive.
- Writes are strict, whole-patch atomic `add` / `replace` / `remove`: `add` requires the key absent, `replace`/`remove` require it present; any failure rolls back the whole request.
- `baseHash` is mandatory and must equal the stage's current files version at signing time (`filesHash = keccak256(abi.encode(oldHash, patchHash))` rolling); a mismatch rejects the whole request. The map holds exactly one current value per key; replacement is expressed with `replace`/`remove`, there is no nonce, and an already-applied `patchHash` is absorbed first-win.

Write authorization comes from the stage-level `fileWriters` allowlist (the target stage declares which stages may write its files; the stage itself is implicitly writable and never self-referenced) plus the existing `SignalAuthorization` table — see [Stage File Patch](../state-machine/file-patch.md). File patches travel in the tail of the direct `submitSignal` with `bytes32 filesDigest` and `FilePatch`; a pure file patch uses `signalId == 0`, is not a business signal, does not increment business signal counts, does not evaluate hooks, does not run admission, and is not subject to the executor patch "stage already has signal" timing gate.

## Store and Product Display Boundary

Store can organize resource handles into:

- stage protocol, evidence requirement, acceptance criteria;
- manifest hash, metadata URI, content hash;
- whether resources are missing, expired, or need operator review.

Order App and uvp-client translate them into "what evidence to upload, what the hash is, where proof lives". Ordinary participant interfaces never show bucket secrets, storage credentials, presigned URLs, or internal object paths.

## Disallowed Uses

For contributor security rules see ../../meta/documentation-rules.md.

- Putting contract, invoice, logistics file, photo, or report plaintext on chain.
- Treating `fileResources` as meaning resource requirements are met; business completion follows signal/proof.
- Treating object-storage accessibility as more than an auxiliary condition; on-chain proof follows events and hashes.
- Confusing stage file patch with executor patch: they are two independent order-level actions, each with its own authorization face.

## Related Pages

- [Stage File Patch](../state-machine/file-patch.md)
- [Evidence, Proof, and File Resource](../services/evidence-proof.md)
- [Artifacts and Hashes](../artifacts-and-hashes.md)
- [Stage Overlay](../state-machine/stage-overlay.md)
