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

The current compiler type defines it as a loose handle:

```ts
interface FileResourceLike {
  readonly fileType: string;
  readonly [key: string]: unknown;
}
```

This means `fileResources`' first responsibility is "a resolvable resource reference". The concrete storage backend can be object storage, an external URI, content-addressed storage, or a later manifest format.

## Resource Handles

A stage can use `fileResources` to point to off-chain protocol files, evidence templates, or resource manifests:

```yaml
fileResources:
  stage_protocol:
    fileType: manifest
    resourceRole: stage_protocol
    resourceType: document
    mediaType: application/json
    manifest:
      manifestURI: "urn:uvp:resource-manifest:payment-settlement:v1"
      manifestHash: "0x3002..."
      policyHash: "0x7120..."
      visibility: protected
      accessPolicy: buyer_supplier_executor
```

This YAML gives Store, Product API, executor-kit, or adapters one resource handle: they can display the protocol, compute hashes, surface evidence requirements, and check acceptance rules. Only hashes, URIs, or patch events are stored on chain.

## What fileType Means

`fileType` indicates the handle type. Common shapes include:

| fileType | Meaning |
| --- | --- |
| `manifest` | Points to a canonicalized resource manifest, suited to production resource bundles. |
| `uri` | Points to a resolvable metadata URI with hash verification. |
| `ipfs` / `arweave` | Content-addressed storage handles. |
| `object_storage` | Off-chain object storage handle; production must not expose plaintext bucket keys or credentials. |
| `onchain` | A few tiny public resources stored directly on chain or referenced as on-chain-readable data — costly but feasible. |

Users with budget or strong verifiability needs may store extremely small resources directly on chain; most contracts, invoices, logistics documents, photos, reports, and vehicle-condition evidence should never go on chain in plaintext — use content hashes, encrypted objects, metadata URIs, or resource manifests instead.

## Relation to StageResourcePatch

Static `fileResources` come from the order stage and are the Plan's compile-time default resource description. If some order or stage needs to replace or supplement resources at runtime, use the resource overlay; the Plan stays a static version.

The target model of PRD87 (docs/product/prd-87-native-resource-manifest-and-access.md) is:

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
