---
title: File Resources
type: explanation
audience: 协议读者
preread: ../README.md
status: verified
---

# File Resources

> Prerequisite reading: [Core Concepts](../README.md)
`fileResources` are stage resource declarations. They describe which off-chain objects, protocol files, evidence templates, acceptance criteria, or resource manifests a stage needs to reference. On the DSL side they are static declarations; runtime writes to a stage's file map for one order are order-level facts carried by the file module. On-chain facts come from authorized signals, opaque payloads, and events; file plaintext stays off-chain.

## Who Uses It

Nuclei declare fileResources on stages; Store/Product API use them to present protocol and evidence requirements; Order App and uvp-client translate them into upload and validation flows; operators and assigned suppliers use the same opaque payload model during order-level file writes.

## What It Produces

Static declarations enter the compiled artifact's stage route metadata, so read surfaces such as Product API and uvp-client can present protocol and evidence requirements; runtime writes set the target stage's file map to `StageFile{string key; bytes payload}`, with the same key overwritten, and produce `StageFileWritten` events. Whether business is complete still follows authorized signals and proof, not the files themselves.

## Where Authority Comes From

Whether resources satisfy requirements is finally decided by authorized signals and proof, not by the files themselves; only opaque `{key, payload}` and write events are stored on chain, and plaintext always stays off-chain.

The current compiler's TS shell defines it as a loose handle:

```ts
interface FileResourceLike {
  readonly fileType: string;
  readonly [key: string]: unknown;
}
```

`fileType` only has to be a non-empty string, and its **value domain is open**: neither uvp-core nor the chain-track TS compiler dispatches on type or maintains a closed set, and the entry's remaining keys are application-defined opaque payload preserved verbatim. `fileResources`' first responsibility is "an application-interpretable resource reference"; the storage backend and file type are decided by the application layer.

## Resource Declarations

A stage can use `fileResources` to point to off-chain protocol files, evidence templates, or object-storage resources, with application-defined verification info attached:

```yaml
fileResources:
  stage_protocol:
    fileType: app_protocol_ref
    locator: "https://example.com/protocols/payment-settlement-v1.json"
  evidence_bucket:
    fileType: app_object_ref
    bucket: "evidence-bucket"
    region: "ap-guangzhou"
    objectKey: "protocols/payment-settlement-v1.json"
```

These keys are interpreted by the application: Store, Product API, uvp-client, or an adapter can display the protocol, compute hashes, surface evidence requirements, and check acceptance rules. The chain stores opaque payloads and stage file write events.

## What fileType Means

`fileType` is an application-defined handle type whose only protocol constraint is a non-empty string:

| Value | Meaning |
| --- | --- |
| Any non-empty string | Interpreted by the application layer; the core does not read it, does not validate type-specific fields, and does not dispatch on type. |

There is no protocol built-in `local` / `http` / `txcloud` / `plain_text` closed set; those are local conventions of some applications or cloud-side resolvers, not the DSL acceptance domain. Contracts, invoices, logistics documents, photos, reports, and vehicle-condition evidence should never go on chain in plaintext; when a verifiable reference is needed, express it as an opaque payload plus a content hash, or keep only hashes and metadata URIs on chain.

## Stage File Map

The runtime file map is an order-level fact owned by `UVPFileResourceModule` (the `UVPStateMachine` only routes through the `fileResourceModule()` directory, and the module trusts `msg.sender == stateMachine` as its only trust gate). Each stage's map is:

```text
key -> payload
```

- `StageFile` is `{string key; bytes payload}`; a key is ≤128 bytes, a payload is ≤4096 bytes, and one call carries ≤16 entries.
- The engine does not parse key/payload, stores no body, and never touches application storage.
- Re-writing the same key overwrites it; each key has exactly one current payload, with no per-key version history and no operation state machine.
- A write is atomic as a whole: if any file entry fails, the whole call rolls back.

Write authority comes from the stage-level `fileWriters` allowlist (the target stage declares which stages may write its files; the stage itself is implicitly writable and never self-referenced), and the write reuses the target/writer stages' currently assigned supplier accounts; see [Stage File Map](../state-machine/file-patch.md). File writes travel through direct `submitSignal`'s `files: StageFile[]`; a pure file write uses `signalId == 0`, is not a business signal, does not increment business signal counts, does not evaluate hooks, does not run admission, and is not subject to the stage supplier patch "target stage already has a signal" timing gate.

## Store and Product Display Boundary

Store can organize resource declarations into:

- stage protocol, evidence requirement, acceptance criteria;
- manifest hash, metadata URI, content hash;
- whether resources are missing, expired, or need operator review.

Order App and uvp-client translate them into "what evidence to upload, what the hash is, where proof lives". Ordinary participant interfaces never show bucket secrets, storage credentials, presigned URLs, or internal object paths.

## Disallowed Uses

For contributor security rules see ../../meta/documentation-rules.md.

- Putting contract, invoice, logistics file, photo, or report plaintext on chain.
- Treating `fileResources` as meaning resource requirements are met; business completion follows signal/proof.
- Treating object-storage accessibility as more than an auxiliary condition; on-chain proof follows events and hashes.
- Confusing stage file writes with stage supplier patches: they are two independent order-level actions, each with its own authorization face.

## Related Pages

- [Stage File Map](../state-machine/file-patch.md)
- [Evidence, Proof, and File Resource](../services/evidence-proof.md)
- [Artifacts and Hashes](../artifacts-and-hashes.md)
- [Stage Overlay](../state-machine/stage-overlay.md)
