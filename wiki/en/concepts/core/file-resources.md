# File Resources

`fileResources` are stage resource handles. They describe which off-chain objects, protocol files, evidence templates, acceptance criteria, or resource manifests a stage needs to reference. On-chain facts come from authorized signals, hashes, metadata URIs, and events; file contents stay off chain.

The current compiler type defines it as a loose handle:

```ts
interface FileResourceLike {
  readonly fileType: string;
  readonly [key: string]: unknown;
}
```

This means the first responsibility of `fileResources` is to provide a resolvable resource reference. The actual storage backend can be object storage, an external URI, content-addressed storage, or a later manifest.

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

This YAML gives Store, Product API, executor-kit, or an adapter a resource handle: it can display the protocol, compute hashes, show evidence requirements, and check acceptance rules. On chain stores the hash, URI, or patch event.

## Meaning of `fileType`

`fileType` identifies the handle type. Common forms include:

| fileType | Meaning |
| --- | --- |
| `manifest` | Points to a normalized resource manifest, suited for production resource packages. |
| `uri` | Points to a resolvable metadata URI and pairs it with hash verification. |
| `ipfs` / `arweave` | Content-addressed storage handles. |
| `object_storage` | Off-chain object storage handle; production should not expose plaintext bucket keys or credentials. |
| `onchain` | A small, public resource stored directly on chain or referenced in a chain-readable form; expensive but possible. |

Users with sufficient budget or strong verification needs may choose to store very small resources directly on chain. Most contracts, invoices, shipping documents, photos, reports, or vehicle condition evidence should not be written on chain in plaintext; use content hashes, encrypted objects, metadata URIs, or resource manifests instead.

## Relationship to StageResourcePatch

Static `fileResources` come from a Zhixu stage and describe the default resources at Plan compile time. If a specific Order or stage needs to replace or supplement resources at runtime, use a resource overlay; the Plan itself remains static.

The target model in PRD87 is:

```text
StageResourcePatch
  -> ResourceManifestV1
  -> manifestHash / manifestURI / policyHash
  -> public | protected | private visibility
  -> encrypted object storage or content-addressed blob
```

This means resource updates and executor updates are two independent overlays. Resource handles may change, while business state is still determined by `UVPStateMachine` events and replayable projections.

## How Store and Product Should Display It

Store can organize the resource handles into:

- stage protocol, evidence requirement, acceptance criteria;
- resource visibility, reader/writer/controller policy;
- manifest hash, metadata URI, content hash, ciphertext hash;
- whether resources are missing, expired, or need operator review.

Order App and executor-kit translate this into “what evidence needs to be uploaded, what the hash is, and where the proof lives.” Ordinary participant interfaces do not show bucket secrets, storage credentials, presigned URLs, or internal object paths.

## Disallowed Uses

- Do not put contracts, invoices, shipping files, photos, or reports on chain in plaintext.
- `fileResources` expresses resource requirements; business completion is decided by signal/proof.
- Object storage accessibility is only an auxiliary condition; on-chain proof looks at events and hashes.
- Resource patch and executor patch are two different authorization actions.
- Do not write real storage credentials in the Wiki, fixtures, or logs.
