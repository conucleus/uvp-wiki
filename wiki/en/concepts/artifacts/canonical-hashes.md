---
title: Canonical Hash
type: reference
audience: 工程贡献者
status: verified
---

# Canonical Hash

`uvp-eth` uses canonical hashes with a domain, so identical JSON content never collides across different semantic spaces.

## PlanId

`planId` binds one publisher to one on-chain artifact as a plan version:

```text
planId = keccak256(abi.encode(
  keccak256("uvp.plan.id.v1"), // domain
  publisher,                   // address
  planHash                     // the EVM-facing planHash from the OnchainHookPlanArtifact
))
```

Implementations: `planIdForPublisher()` in `uvp-protocol/packages/compiler/src/onchain-hook-plan.ts` and `planIdFor()` in `UVPStateMachine.sol`. Changing the publisher or the planHash changes the `planId`; for the same publisher and the same artifact the `planId` is deterministic.

## HookPlan planHash

```text
hashCanonical("uvp:hook-plan-artifact:v1", payload)
```

This is the domain of the historical public artifact. HookPlan is now only an internal compiler IR and no longer a public Store/import/deploy flow; see [Compiler Input](compiler-input.md). The payload used to include the canonicalized source Zhixu, compiler information, platform information, hooks, dependencies, and routes.

## On-chain planHash

The on-chain runtime `planHash` covers four domains and uses its own hash domain:

```text
planHash = keccak256(abi.encode(
  keccak256("uvp.plan.runtime.v2"),   // domain
  hooksHash,                           // keccak256(abi.encode(hooks))
  metadataHash,                        // keccak256(abi.encode(selectorBindings, signalCapabilities))
  dockRoutesRoot,                      // empty Merkle root when no dock is declared
  dockInterfaceRoot                    // empty Merkle root when no dock is declared
))
```

The publisher signs the PlanCommit (publisher, hooksHash, metadataHash, the two dock roots, deadline) via EIP-712, and `UVPStateMachine` checks this runtime `planHash` at commit/finalize; the Identity Registry is not involved. The whole `OnchainHookPlanArtifact` additionally has a canonical payload hash (domain `uvp:onchain-hook-plan-artifact:v1`) used only for artifact provenance and fixture pinning; it does not replace the runtime `planHash`.

## Stable IDs

Common stable IDs in the EVM artifact:

```text
hookId = keccak256(stageIdentifier#hookName)
stageId = keccak256(stageIdentifier)
hookName = keccak256(hookName)
sourceId = keccak256(source)
signalId = keccak256(task.stage.signal)
signalKey = keccak256(abi.encode(sourceId, signalId))
routeId = keccak256(stageIdentifier#executorRoute)
selectorBindingHash = hashCanonical("uvp:onchain-stage-selector-binding:v1", ...)
```

For `bytes32,bytes32`, the compiler's byte concatenation matches Solidity `abi.encode(sourceId, signalId)` at the byte-content level.

## Absent fileResources and ZERO_HASH

In the route and plan hash formulas, `fileResources` is optional input. When a plan/route does **not** declare `fileResources`, the protocol requires ZERO_HASH (32 zero bytes, `0x0000…0000`) to enter the computation as `resourcesHash`:

```text
resourcesHash = fileResources undeclared ? ZERO_HASH : keccak256(canonicalJSON(fileResources))

routeHash = hashCanonical("uvp:onchain-hook-route:v1", {
  stageId, stageIdentifier, executorHash, resourcesHash
})
```

`routeHash` then enters the on-chain runtime `planHash` commitment through the dock-route Merkle root. This is a protocol constant, not an implementation default: any reimplementation (TypeScript `compileExecutorRoute()` / `onchainRouteHash()`, Rust and other compiler backends) must use the same ZERO_HASH constant for "undeclared" and must not substitute an empty-string hash, omit the field, or pick another placeholder — otherwise the same definition would produce different routeHash/planHash values and break cross-implementation reproducibility.

## Canonical JSON Rules

Canonical hashing sorts object keys, normalizes numbers, and hashes the domain together with the canonical JSON. During development, do not hand-write ad hoc JSON to replace the compiler script, or you will very likely end up with unreproducible hashes.

## Related Pages

- [Compiler Input](compiler-input.md)
- [On-chain Registration Parameters](solidity-registration.md)
- [Artifacts and Hashes](../artifacts-and-hashes.md)
- [Version Matrix](../../reference/version-matrix.md)
