---
title: On-chain Registration Parameters
type: reference
audience: 工程贡献者
status: verified
---

# On-chain Registration Parameters

`OnchainHookPlanArtifact` (`uvp.onchainHookPlan.v1`) is not yet the final transaction parameter set. The compiler compacts it into structures such as `CompactHook` that form the `commitPlan()` payload; off-chain, signal capability and selector binding fold into the single Merkle-tree `capabilitiesRoot`, supplier default/candidate bindings fold into `supplierBindingsRoot`, and `StageFileWriter[]` folds into `fileWritersHash`. The publisher commits all three at commit time, and `finalizePlan(bytes32)` only finalizes. Table size is decoupled from registration gas cost, with no entry cap.

The on-chain runtime commitment is `planHash` (domain `uvp.plan.runtime.v8`), whose preimage is the four-tuple `(hooksHash, capabilitiesRoot, supplierBindingsRoot, fileWritersHash)`. The artifact's derived `triggers[]` read surface enumerates every order-trigger hook's birth fact and does not enter the planHash commitment.

## PlanCommit and Registration Entries

The publisher signs a six-field PlanCommit via EIP-712:

```text
publisher, hooksHash, capabilitiesRoot, supplierBindingsRoot, fileWritersHash, deadline
```

Any relayer calls `commitPlan` with the signature, the full hooks, the `StageSupplierBinding[]`, and the `StageFileWriter[]`; any caller calls `finalizePlan(planId)` to finalize. `commitPlan` recomputes `supplierBindingsRoot` and `fileWritersHash`, and validates the instruction plan, dynamic markers, and candidate/default bindings. Birth submission authority belongs to the birth stage's currently effective assigned supplier account.

## CompactHook

The on-chain hook keeps only the information needed at runtime:

```solidity
struct CompactHook {
    bytes32 hookId;
    bytes32 stageId;
    bytes32 hookName;
    uint8 flags; // ORDER_TRIGGER_MINT=1, EMIT_READY=4, ADMISSION=8, DOCK_EXECUTOR=16, DYNAMIC_EXECUTOR=32
    Instruction[] instructions;
    bytes32[] dependencyKeys;
}
```

The full flag set is `1 = ORDER_TRIGGER_MINT` (frozen ABI name for birth hooks), `4 = EMIT_READY`, `8 = HOOK_FLAG_ADMISSION`, `16 = HOOK_FLAG_DOCK_EXECUTOR`, `32 = HOOK_FLAG_DYNAMIC_EXECUTOR`. Human-readable labels, raw expressions, and AST debug information are not written to contract storage; they remain in the artifact and audit materials.

- Each `sendSignals[].trigger: true` birth signal synthesizes one order-trigger hook: a single `SIGNAL` instruction, flags 1 and 4, `orderTriggerKind=trigger`.
- `validWhen` compiles into standalone admission entries (kind `admission`, flag 8) committed through hooksHash.
- A dock stage's receive hook carries flag 16; a dynamic stage's receive hook carries flag 32. Neither changes `orderTriggerKind` or carries birth.
- A plan may register several order-trigger hooks; the submission side resolves the birth hook by `(planId, sourceId, signalId)`, and the read surface enumerates birth lines explicitly with `triggers[].hookId` + `triggerStageId`.

## Instructions and Dependency Index

The compact instruction opcodes are `SIGNAL` / `NOT` / `AND` / `OR` / `DELAY`; `DELAY` is re-evaluated on the state machine's explicit `pokeTimer` keeper action. The compiler organizes each hook's dependencies into:

```text
signalKey -> [hookId]
```

When the contract registers the plan, it writes this into `Plan.dependencyIndex`. When a signal is submitted, the contract evaluates only the hooks affected by that `signalKey`. The deduplicated dependency-key count is ≤1024 per plan (over-limit registration reverts `TooManyDependencies`), and a single dependency key may attach at most 16 hooks (`TooManyHooksPerDependencyKey`).

## Selector Binding and File Writer

Selector binding describes whether one stage may patch a target stage:

```text
selectorStageIdentifier -> targetStageIdentifier
```

On chain, `selectorStageId = keccak256(selectorStageIdentifier)` and `targetStageId = keccak256(targetStageIdentifier)`. Selector binding mixes into `capabilitiesRoot`, and stage supplier patches verify membership by recomputing the leaf from the fields and carrying a proof (`UVPPlanMetadataModule.verifyStageSelectorBinding`).

`stages[].fileWriters` **does not produce a capability leaf** and does not enter `capabilitiesRoot`: the compiler turns it into `StageFileWriter{targetStageId, writerStageId}[]`, separately signed and committed in the PlanCommit through `fileWritersHash = keccak256(abi.encode(StageFileWriter[]))`. File-write authority is resolved from the target/writer stages' assigned suppliers; there is no independent file-writer registration surface. Leaf formulas and tree rules live in [Canonical Hash](canonical-hashes.md).

## Supplier Route

A supplier route (a stage's static supplier and fileResources) is off-chain routing metadata: the compiler keeps it in the artifact for Product API and uvp-client scheduling, and routeId/routeHash do not enter the on-chain runtime `planHash`. A dock stage has no plan-level route and no executor candidates; its supplier is selected once at runtime. A dynamic stage likewise has no plan-level supplier route/binding; the selector assigns its supplierId before the first signal.

## ABI Fixture

Public ABI and freeze checks are maintained in the contract package. The current frozen set is uniformly `0.1` (state-machine, plan-registration, stage-patch, dock-registry, file-resource, lens, plan-metadata, derived-signal, identity-registry, deployment-registry); EIP-712 domain versions follow the compatibility matrix and are all `1` (productSubmit, derivedSignal, stageSupplierPatch). Verification command:

```bash
pnpm verify:protocol-freeze
```

Changes to ABI, bytecode, selectors, event topics, typed-data fields, canonical hashes, or artifact schemas should be captured in release notes and migration decisions. CompactHook, event, selector, and EIP-712 fields are pinned by the state-machine fixture, the module fixtures, and `pnpm verify:protocol-freeze`. A change must update bindings, indexers, executor, and bootstrap together; updating one fixture in isolation is not an accepted migration.

## Related Pages

- [Compiler Input](compiler-input.md)
- [Canonical Hash](canonical-hashes.md)
- [Contracts and Events](../../reference/contracts-and-events.md)
- [Release and Verification](../../how-to/release-checklist.md)
