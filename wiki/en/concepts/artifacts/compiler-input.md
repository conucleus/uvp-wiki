---
title: Compiler Input
type: reference
audience: 工程贡献者
status: verified
---

# Compiler Input

The compiler input is `ZhixuDefinition`. The compiler does more than move strings around; it first validates whether the definition can produce deterministic protocol artifacts.

## Fields That Enter the Artifacts

| Field | Purpose |
| --- | --- |
| `metadata.name` | Human-readable plan name and default identifier input. |
| `metadata.uid` | Stable Zhixu identifier. |
| `metadata.annotations.version` | Plan version. |
| `spec.platform` | Platform target, participates in hashing. |
| `taskPatterns[].name` | Part of the stage identifier. |
| `stages[].name` | Part of the stage identifier. |
| `stages[].source` | Input to hook source and `sourceId`. |
| `stages[].receiveSignals` | Generates receive hooks. |
| `stages[].trigger` | Determines which hooks emit `HookReady` when ready. |
| `stages[].executor` | Executor route and reachability. |
| `stages[].selectedStages` | Selector binding and executor closure. |
| `stages[].sendSignals` | Outbound signal description. |
| `stages[].fileResources` | Product resource requirements and resource patch input. |

## What the Compiler Rejects

Before hashing, the compiler rejects these shapes:

- Missing required `metadata`, `spec`, `taskPatterns`, or stages.
- Missing `executor.supplierID` on an executor route — `supplierID` is compile-time required.
- Missing or empty `metadata.annotations.version` — the plan version is compile-time required.
- `selectedStages` pointing to a stage that does not exist.
- Executor routes that cannot be reached by a static executor or selector.
- Invalid hook expression format.
- Signal references that are not in `task.stage.signal` form.
- Receive signals or signal maps that reference non-existent stages or signals.
- Stage selector bindings that cannot form a deterministic relation.

These errors must surface at compile time, not at contract registration or order execution time.

## Source Zhixu Also Participates in Hashing

`OnchainHookPlanArtifact`’s `planHash` includes the canonicalized source Zhixu. That means a source definition change that affects protocol semantics changes the plan hash. The compiled artifact should not be handwritten JSON; it must be reproducibly generated from the source definition by script.

## Related Pages

- [Compiler and Hook Core](../compiler-and-hooks.md)
- [Canonical Hash](canonical-hashes.md)
- [On-chain Registration Parameters](solidity-registration.md)
- [Version Matrix](../../reference/version-matrix.md)
