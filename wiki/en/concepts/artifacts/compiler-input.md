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
| `metadata.name` | Required slug (`^[a-z][a-z0-9_-]{0,99}$`); enters canonical content and planId derivation, and is the key for referencing target definitions across tracks. |
| `metadata.uid` | Not a DSL field: an occurrence in the source definition is loudly rejected as an unknown field; definition identity is track-split — chain track derived from content (`zx-<32hex>`, chain-track internal), cloud track unique name + database primary key. |
| `metadata.labels` | Part of the definition content; the chain track's identity derivation includes labels (chain-track internal), the cloud track stores them as content only. |
| `metadata.annotations` | Free-form annotations; never part of identity or hash derivation (no native version semantics). |
| `spec.platform` | Platform target, participates in hashing. |
| `taskPatterns[].name` | Part of the stage identifier. |
| `stages[].name` | Part of the stage identifier. |
| `stages[].source` | Input to hook source and `sourceId`. |
| `stages[].receiveSignals` | Generates receive hooks. |
| `stages[].mint` | Birth-stage declaration (the materialization seat for per-fact minting and dock birth anchors). |
| `stages[].executor` | Executor route and reachability. |
| `stages[].selectedStages` | Selector binding and executor closure. |
| `stages[].sendSignals` | Outbound signal description. |
| `stages[].fileResources` | Product resource requirements and resource patch input. |
| `spec.dockInterface` | Named interface map, compiled into the dock interface commitment (interface roots). |

## What the Compiler Rejects

Before hashing, the compiler rejects these shapes:

- Missing required `metadata`, `spec`, `taskPatterns`, or stages.
- `selectedStages` pointing to a stage that does not exist.
- Executor routes that cannot be reached by a static executor or selector.
- Invalid hook expression format.
- Signal references that are not in `task.stage.signal` form.
- Receive signals or signal maps that reference non-existent stages or signals.
- Stage selector bindings that cannot form a deterministic relation.

These errors must surface at compile time, not at contract registration or order execution time.

## How the Source Definition Enters Hashing

The on-chain runtime `planHash` covers exactly four values: `hooksHash`, `metadataHash`, `dockRoutesRoot`, and `dockInterfaceRoot` (see [Canonical Hash](canonical-hashes.md)) — the canonicalized source Zhixu is not among them. A source-definition change that affects protocol semantics changes the hooks, selector bindings/signal capabilities, and dock roots, and therefore changes the `planHash`. The whole `OnchainHookPlanArtifact` additionally has a canonical payload hash (pinning the source definition snapshot via `sourcePlanHash`) used only for artifact provenance and fixture pinning; it does not act as the on-chain `planHash`. The compiled artifact should not be handwritten JSON; it must be reproducibly generated from the source definition by script.

## Related Pages

- [Compiler and Hook Core](../compiler-and-hooks.md)
- [Canonical Hash](canonical-hashes.md)
- [On-chain Registration Parameters](solidity-registration.md)
- [Version Matrix](../../reference/version-matrix.md)
