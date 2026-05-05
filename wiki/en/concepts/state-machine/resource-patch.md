# Resource Patch

Resource patch is another kind of Stage Overlay runtime change. It overrides or supplements the resource manifest for a target stage of one Order, so the order can bind new off-chain resource handles without modifying the Plan.

## What It Solves

`fileResources` in a Plan are static default requirements. In a real order, a stage may need to replace a protocol document, resource pack, acceptance template, or access policy. Resource patch records that change as an order-level overlay:

```text
selector stage
  -> stage_resource_patch typed data
  -> selector wallet signature
  -> applyStageResourcePatchFor
  -> StageResourcePatchApplied
  -> Product / Store reads active resource overlay
```

## Contract Checks

Resource patch is constrained by at least these checks:

- selector stage and target stage must have a `StageSelectorBinding`.
- the selector must have order-level internal patch authorization.
- the target stage business signal has not been submitted yet.
- `resourceKey`, `manifestHash`, `policyHash`, and `patchHash` must be nonzero.
- patch nonce must increase.

The chain stores only hashes, URIs, and events. It does not store contracts, invoices, logistics files, vehicle materials, or other business plaintext.

## Code Entry

| Code | Meaning |
| --- | --- |
| `UVPStagePatchModule.sol` | `applyStageResourcePatch`, `applyStageResourcePatchFor`, patch digest, and events. |
| `protocol-bindings/src/index.ts` | stage resource patch typed data, call builder, signer recovery. |
| `uvp-chain-services/service/src/stage-patches/` | Product API prepare/submit resource patch. |
| `uvp-protocol/packages/protocol-bindings/src/index.ts` | `ResourceManifestV1` hash and validation helpers. |

## Boundaries

- Resource patch and Executor patch are different actions; their fields and signed payloads cannot be mixed.
- Resource patch does not prove business completion; completion still comes from an authorized business signal.
- Resource patch does not put file plaintext on chain; file content is linked through object storage, manifest URI, hashes, and proof.
- Production profiles should reject legacy `http`, `txcloud`, and `plain_text` resource handles.

See [Stage Overlay: Executor Patch and Resource Patch](stage-overlay.md) for the overview, and [File Resources](../core/file-resources.md) for the static resource object.
