---
title: Canonical Hash
type: reference
audience: 工程贡献者
status: verified
---

# Canonical Hash

`uvp-eth` uses domain-separated canonical hashes, so identical JSON content never collides across different semantic spaces. The hash is `keccak256(domain + ":" + canonicalJSON(payload))` for JSON payloads, or `keccak256(abi.encode(...))` over ABI tuples; implementations live in `uvp-protocol/packages/compiler/src/onchain/` and `uvp-core/crates/uvp-ir`.

## Definition Identity (uid)

Definition identity is a content-derived uid:

```text
uid = zx-<32hex>
preimage = keccak256("uvp:definition-uid:v2:" + canonical(definition document with metadata.name / metadata.annotations / metadata.labels / spec.platform / spec.nucleation stripped))
```

`metadata.name`, `metadata.annotations`, and `metadata.labels` are display/search only, while `spec.platform` and `spec.nucleation` are track/nucleus declarations; none of them participates in the uid. The same logical content yields the same uid across environments and tracks; republishing is an idempotent no-op, while any content change is a new identity. The authoritative implementation is `uvp_ir::derive_definition_uid`; the chain-track TS compiler uses the same formula and pins it cross-language with `uvp-core/fixtures/commitments/golden-vectors.v1.json`.

## PlanId

`planId` binds one publisher to one on-chain artifact as a plan version:

```text
planId = keccak256(abi.encode(
  keccak256("uvp.plan.id.v1"), // domain
  publisher,                   // address
  runtimePlanHash              // on-chain runtime planHash (next section)
))
```

Implementations: `planIdFor()` in `UVPStateMachine.sol` and the chain-track compiler. Changing the publisher or the runtimePlanHash changes the `planId`.

## On-chain runtime planHash

The on-chain runtime `planHash` covers hooks, the capabilities root, the supplier-binding root, and the file-writer allowlist:

```text
planHash = keccak256(abi.encode(
  keccak256("uvp.plan.runtime.v8"),   // domain
  hooksHash,                          // keccak256(abi.encode(CompactHook[]))
  capabilitiesRoot,                   // single Merkle root over signal capability + selector binding
  supplierBindingsRoot,               // single Merkle root over the default/candidate (stageId, supplierId, kind) bindings
  fileWritersHash                     // keccak256(abi.encode(StageFileWriter[]))
))
```

The publisher signs the six-field PlanCommit (publisher, hooksHash, capabilitiesRoot, supplierBindingsRoot, fileWritersHash, deadline) via EIP-712, and `UVPStateMachine` checks this runtime `planHash` at commit/finalize. `hooksHash` covers the compact hooks' `(hookId, stageId, hookName, flags, instructions, dependencyKeys)`; supplier routeId/routeHash are off-chain routing metadata and enter neither `hooksHash` nor the runtime `planHash`.

## Artifact Identity

- The compiler-internal hook plan artifact (`uvp.hookPlan.v1`) hashes its payload under domain `uvp:hook-plan-artifact:v1`, including the definition snapshot, platform, compiled hooks, dependency index, supplier routes, and so on.
- The public on-chain artifact (`uvp.onchainHookPlan.v1`) hashes its payload minus the derived `triggers[]` read surface under domain `uvp:onchain-hook-plan-artifact:v1`. It serves as the registration args' `artifactHash` for source-artifact provenance and does not replace the on-chain runtime `planHash`; the artifact's `sourcePlanHash` anchors the internal hook plan.
- Neither side accepts handwritten JSON: artifacts must be reproducibly generated from the definition by script.

## capabilitiesRoot (two capability tables)

The signal capability and selector binding tables are not registered on-chain item by item. The compiler mixes them off-chain into a single domain-separated sorted-pairing Merkle tree (sorted and deduplicated, odd tail leaf promoted, `keccak256(min ‖ max)` per level); only the root lives on-chain, and membership is verified by the caller recomputing the leaf from its fields and carrying a proof. Leaf formulas:

```text
signalCapabilityLeaf = keccak256(abi.encode(
  keccak256("UVP_SIGNAL_CAPABILITY_V1"),  // leaf domain
  stageId, targetSourceId, signalId, relation))

selectorBindingLeaf = keccak256(abi.encode(
  keccak256("UVP_SELECTOR_BINDING_V1"),   // leaf domain
  selectorStageId, targetStageId))

supplierBindingLeaf = keccak256(abi.encodePacked(
  keccak256("UVP_SUPPLIER_BINDING_V1"),   // leaf domain
  stageId, supplierId, kind))
```

The first two leaves mix into `capabilitiesRoot`; `supplierBindingLeaf` forms the separate `supplierBindingsRoot` (signed in the PlanCommit). `fileWriters` does not produce a capability leaf; it enters the PlanCommit separately as the ABI-encoded hash of `StageFileWriter{targetStageId, writerStageId}[]`, `fileWritersHash`. An empty table yields the root `keccak256("")`. The authoritative implementations are `uvp-protocol/packages/compiler/src/onchain/capabilities-root.ts` and `supplier-bindings.ts`.

## Dock Identity, Binding, and Stage Supplier Patch

Dock is a separate `kind: Dock` document with content-derived identity:

```text
docHash = keccak256("uvp:dock-uid:v1:" + canonical(Dock document with metadata.name / metadata.annotations stripped))
dkid     = zd-<32hex>          // display form
on-chain dkid word = bytes32(bytes16(docHash))   // bytes32 used by registration calls
```

Any content change is a new dkid, and republishing is idempotent. Artifact and field validation live in `uvp-protocol/packages/compiler/src/dock-artifact.ts` (`uvp.dock.v1`).

The binding identity is 7 32-byte words, with no payload hash/generation:

```text
bindingId = keccak256(abi.encode(
  keccak256("uvp.dock.binding_id.v1"),  // domain
  dkid, toPlanId, toOrderId, toStageId, fromPlanId, fromOrderId))
```

The `dock_link` file entry's `contentHash` only authenticates the payload body at poke time; a mismatch reverts `DockBindingContentHashMismatch`, and it never enters the bindingId, events, views, or fact provenance. Current window values are evaluated live by read views; historical window times are not on chain.

The stage supplier patch EIP-712 primary type is:

```text
UVPStagePatchModuleStageSupplierPatch(
  bytes32 planId, bytes32 orderId, bytes32 selectorStageId, bytes32 targetStageId,
  bytes32 supplierId, bytes32 previousSupplierId, uint256 patchNonce,
  address selector, uint256 deadline)
```

The dock supplier selection primary type is:

```text
UVPStagePatchModuleStageDockSupplierSelection(
  bytes32 planId, bytes32 orderId, bytes32 selectorStageId, bytes32 targetStageId,
  bytes32 dockId, bytes32 supplierId, uint256 patchNonce,
  address selector, uint256 deadline)
```

## Stable IDs

Common stable IDs in the EVM artifact:

```text
hookId = keccak256(stageIdentifier#hookName)
stageId = keccak256(stageIdentifier)
hookName = keccak256(hookName)
sourceId = keccak256(source)
signalId = keccak256(signalName)
signalKey = keccak256(abi.encode(sourceId, signalId))
routeId = keccak256(stageIdentifier#supplierRoute)
selectorBindingHash = hashCanonical("uvp:onchain-stage-selector-binding:v1", ...)
```

For `bytes32,bytes32`, the compiler's byte concatenation matches Solidity `abi.encode(sourceId, signalId)` at the byte-content level.

## routeHash and Absent fileResources

A supplier route is off-chain routing metadata, and `fileResources` is optional input to the route hash formula. When a route/plan does **not** declare `fileResources`, the protocol requires ZERO_HASH (32 zero bytes, `0x0000…0000`) to enter the computation as `resourcesHash`:

```text
resourcesHash = fileResources undeclared ? ZERO_HASH : keccak256(canonicalJSON(fileResources))

routeHash = hashCanonical("uvp:onchain-hook-route:v1", {
  stageId, stageIdentifier, supplierHash, resourcesHash
})
```

`routeId`/`routeHash` are used only as routing identity inside the artifact and read surfaces; they do not enter the on-chain runtime `planHash`. This is a protocol constant, not an implementation default: any reimplementation must use the same ZERO_HASH constant for "undeclared" and must not substitute an empty-string hash, omit the field, or pick another placeholder — otherwise the same definition would produce different routeHash and artifact identities and break cross-implementation reproducibility.

## Canonical JSON Rules

Canonical hashing sorts object keys, rejects float number literals, and hashes the domain together with the canonical JSON. During development, do not hand-write ad hoc JSON to replace the compiler script, or you will very likely end up with unreproducible hashes.
