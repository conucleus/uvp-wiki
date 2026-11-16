---
title: Compiler Input
type: reference
audience: 工程贡献者
status: verified
---

# Compiler Input

The compiler input is `ZhixuDefinition`; cross-order collaboration has a separate `kind: Dock` document — the two objects are published side by side and compiled separately. The compiler does more than move strings around; it first validates whether the definition can produce deterministic protocol artifacts.

## Fields That Enter the Artifacts

| Field | Purpose |
| --- | --- |
| `metadata.name` | Required slug (`^[a-z][a-z0-9_-]{0,99}$`); display-only, not part of definition identity derivation. |
| `metadata.uid` | Not a DSL field: an occurrence in the source definition is loudly rejected as an unknown field; identity is the content-derived uid `zx-<32hex>`. |
| `metadata.labels` | Part of the definition content, participating in content-derived identity. |
| `metadata.annotations` | Free-form annotations; never part of identity or hash derivation (no native version semantics). |
| `spec.platform` | Track declaration, participates in hashing. |
| `stages[].name` | The stage identifier (`stageIdentifier`) itself, unique within the Zhixu. |
| `stages[].source` | Input to hook source and `sourceId`. |
| `stages[].sendSignals` | Outbound signal declarations (entries are objects `{name, validWhen?}`, with `trigger: true` marking birth signals: capability list + birth set + emission-admission artifacts). |
| `stages[].receiveSignals` | Generates receive hooks. |
| `stages[].executor` | Executor route, reachability, and dock-executor marking. |
| `stages[].selectedStages` | Selector binding and executor closure. |
| `stages[].fileResources` | Static resource handles and stage route metadata. |
| `stages[].fileWriters` | Cross-stage file-write allowlist, compiled into file-writer capability leaves. |

The `Dock` document (`spec.from{zhixu,source}` / `spec.to{zhixu,stage}` / `spec.signalMap`) is compiled separately by `uvp-core analyzeDock` into `uvp.dock.v1`: `from.zhixu`/`to.zhixu` must be content-derived uids of published definitions, `to.stage` must be carried with `executor.supplierType: dock`, and `signalMap` atoms must land on `sendSignals` of stages under `from.source`.

## Compiler Request Surface

The default target is `hook_plan` (`evm` is its alias); `cloud`/`cloud_db` (cloud-track artifacts) and `analyze` (shared validation + hook IR + birth signal set + hook parse results) are also available. Dock documents go through an `analyzeDock` request (`{dock, published}`).

The uvp-core analyze wire schema is `uvp.zhixuAnalysis.v4`: it emits shared definition validation results (including the chain track's birth-set validation and stage materialization gate), normalized per-stage birth signal names, parsed hook ASTs, signal capabilities, folded admissions, and each stage's executor config. The chain-track compiler only consumes the analyze result for lowering/decoration/shell assembly and does not re-implement validation.

## What the Compiler Rejects

Definition-level and chain-track acceptance domains reject these shapes before hashing (shared validation belongs to uvp-core analyze):

- Missing required `metadata`, `spec`, `stages`, or stage fields.
- Duplicate stage names within a Zhixu.
- `selectedStages` pointing to a stage that does not exist; executor closure not reachable from a static executor or selector anchor.
- `sendSignals[].trigger` entries that do not belong to the stage's `sendSignals`, duplicates within the stage, or a birth stage whose executor is not a static plain executor (`individual`/`organization` + `supplierID`, not dock).
- Birth signals declaring conflicting admission shapes (invalid expressions, non-existent references, inconsistent `validWhen` list header sources, nested delays, no-anchor delays, and so on).
- A dock stage without a `receiveSignals` binding face, or plan-level executor routes/candidates pointing at a dock stage.
- The stage materialization gate: a stage with neither birth signals nor `receiveSignals` compiles to zero hooks and is rejected overall on the chain target.
- Deduplicated dependency keys over the limit (>1024), or per-key hook fan-out over the limit (one signalKey with more than 16 hooks).
- `fileWriters` referencing non-existent stages or being self-inconsistent (duplicates, self-reference).
- Dock documents: from/to unpublished, `to.stage` not a dock stage, output not in `sendSignals`, `signalMap` expressions with out-of-scope atoms or an empty set, and so on.

These errors must surface at compile time, not at contract registration or order execution time.

## How the Source Definition Enters Hashing

The on-chain runtime `planHash` covers exactly three values: `hooksHash`, `capabilitiesRoot`, and `supplierBindingsRoot` (see [Canonical Hash](canonical-hashes.md)) — the canonicalized source Zhixu is not among them. A source-definition change that affects protocol semantics changes the hooks, capability tables, or supplier bindings, and therefore changes the `planHash`. The whole `OnchainHookPlanArtifact` additionally has a canonical payload hash (pinning the source definition snapshot via `sourcePlanHash`) used only for artifact provenance and fixture pinning; it does not act as the on-chain `planHash`. The compiled artifact should not be handwritten JSON; it must be reproducibly generated from the source definition by script.

The field list follows `uvp-protocol/packages/compiler/src/types` and the language-layer manual `uvp-core/docs/zhixu-dsl-grammar.md`.

## Related Pages

- [Compiler and Hook Core](../compiler-and-hooks.md)
- [Canonical Hash](canonical-hashes.md)
- [On-chain Registration Parameters](solidity-registration.md)
- [Version Matrix](../../reference/version-matrix.md)
