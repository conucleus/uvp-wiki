---
title: Canonical Hash
type: reference
audience: 工程贡献者
status: verified
---

# Canonical Hash

`uvp-eth` uses canonical hashes with a domain. That keeps the same JSON content from colliding across different semantic spaces.

## PlanId

`planId` identifies a compiled plan version:

```text
hashCanonical("uvp:hook-plan-id:v1", {
  compiler,
  platform,
  version,
  zhixuId,
  zhixuName
})
```

Changing the platform, version, or Zhixu identifier changes `planId`.

## HookPlan planHash

The readable HookPlan artifact hash uses:

```text
hashCanonical("uvp:hook-plan-artifact:v1", payload)
```

The payload includes the canonicalized source Zhixu, compiler information, platform information, hooks, dependencies, and routes.

## On-chain planHash

The on-chain artifact uses a separate domain:

```text
uvp:onchain-hook-plan-artifact:v1
```

This hash covers compact hooks and metadata commitments. The publisher signs the commit and `UVPStateMachine` checks the EVM-facing `planHash`; Identity Registry is not involved.

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

For `bytes32,bytes32`, the compiler’s byte concatenation matches Solidity `abi.encode(sourceId, signalId)` at the byte-content level.

## Canonical JSON Rules

Canonical hashing sorts object keys, normalizes numbers, and hashes the domain together with the canonical JSON. During development, do not hand-write ad hoc JSON to replace the compiler script, or you will very likely end up with unreproducible hashes.
