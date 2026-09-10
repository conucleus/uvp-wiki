---
title: File Resources
type: explanation
audience: 协议读者
preread: ../README.md
status: verified
---

# File Resources

> Prerequisite reading: [Core Concepts](../README.md)
`fileResources` are stage resource handles. They describe which off-chain objects, protocol files, evidence templates, acceptance criteria, or resource manifests a stage needs to reference. On-chain facts come from authorized signals, hashes, metadata URIs, and events; file plaintext stays off-chain.

## Who Uses It

Nuclei declare fileResources on stages; Store/Product API use them to present protocol and evidence requirements; Order App and executor-kit translate them into upload and validation flows; operators use the same handle model during resource patches.

## What It Produces

Static declarations enter the Plan's resource description; runtime replacement or supplement is expressed through the resource overlay (`StageResourcePatchApplied`), producing verifiable handles such as manifest hash, visibility, and encrypted object references.

## Where Authority Comes From

Whether resources satisfy requirements is finally decided by authorized signals and proof, not by the files themselves; only hashes, URIs, or patch events are stored on chain, and plaintext always stays off-chain.

The current compiler's TS shell defines it as a loose handle:

```ts
interface FileResourceLike {
  readonly fileType: string;
  readonly [key: string]: unknown;
}
```

This loose interface is only the shell shape — it is **not** a semantic open-endedness promise: the `fileType` closed set is enforced by the Go cloud-side compile entries (`v0.IsValidFileResourceType`, one shared set across /compile, /validate, order-level resource patch, and /signal) and the TS chain-track precheck (`FILE_TYPES`, same set); Rust `uvp-core` passes `file_resources` through as opaque JSON values and does not validate `fileType`. Legal values are the closed set `local` / `http` / `txcloud` / `plain_text` (see the table below); invented values outside the set are rejected at compile time. `fileResources`' first responsibility is "a resolvable resource reference" — the storage backend is determined by the handle type, and the DSL offers no arbitrary storage-backend extension point.

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

This YAML gives Store, Product API, executor-kit, or adapters one resource handle: they can display the protocol, compute hashes, surface evidence requirements, and check acceptance rules. Only hashes, URIs, or patch events are stored on chain.

## What fileType Means

`fileType` indicates the handle type; legal values are the DSL closed set (the Go cloud-side compile entries and the TS chain-track precheck reject values outside the set at compile time, by one shared collection):

| fileType | Meaning |
| --- | --- |
| `local` | Local file-path handle (`localFile.path`); suited to fixtures and development samples. |
| `http` | HTTP/HTTPS file URL handle (`httpFile.url`). |
| `txcloud` | Off-chain object-storage (Tencent Cloud COS) handle (`txCloudFile` bucket/region/objectKey); production must not expose plaintext credentials. |
| `plain_text` | Inline plaintext (base64); local fixtures or development samples only, never a production evidence carrier. |

There is no `manifest` / `uri` / `ipfs` / `arweave` / `object_storage` / `onchain` fileType — and no DSL handle for storing resources directly on chain. Contracts, invoices, logistics documents, photos, reports, and vehicle-condition evidence should never go on chain in plaintext; when a verifiable reference is needed, express it via a handle plus a content hash, or keep only hashes and metadata URIs on chain.

## Relation to StageResourcePatch

Static `fileResources` come from the order stage and are the Plan's compile-time default resource description. If some order or stage needs to replace or supplement resources at runtime, use the resource overlay; the Plan stays a static version.

The target model of the resource overlay is:

```text
StageResourcePatch
  -> ResourceManifestV1
  -> manifestHash / manifestURI / policyHash
  -> public | protected | private visibility
  -> encrypted object storage or content-addressed blob
```

So resource updates and executor updates are two independent overlays. Resource handles may change, but business status is still decided by `UVPStateMachine` events and replayable projections.

## Store and Product Display Boundary

Store can organize resource handles into:

- stage protocol, evidence requirement, acceptance criteria;
- resource visibility, reader/writer/controller policy;
- manifest hash, metadata URI, content hash, ciphertext hash;
- whether resources are missing, expired, or need operator review.

Order App and executor-kit translate them into "what evidence to upload, what the hash is, where proof lives". Ordinary participant interfaces never show bucket secrets, storage credentials, presigned URLs, or internal object paths.

## Disallowed Uses

For contributor security rules see ../../meta/documentation-rules.md.

- Putting contract, invoice, logistics file, photo, or report plaintext on chain.
- Treating `fileResources` as meaning resource requirements are met; business completion follows signal/proof.
- Treating object-storage accessibility as more than an auxiliary condition; on-chain proof follows events and hashes.
- Confusing resource patch and executor patch: they are two separate authorized actions.

## Related Pages

- [Evidence, Proof, and File Resource](../services/evidence-proof.md)
- [Artifacts and Hashes](../artifacts-and-hashes.md)
- [Stage Overlay](../state-machine/stage-overlay.md)
