---
title: On-chain Registration Parameters
type: reference
audience: 工程贡献者
status: verified
---

# On-chain Registration Parameters

`OnchainHookPlanArtifact` (`uvp.onchainHookPlan.v1`) is not yet the final transaction parameter set. The compiler converts it into the compact structures required by `UVPStateMachine.commitPlan()`; the three capability tables (signal capability + selector binding + file writer) are folded off-chain into the single Merkle-tree `capabilitiesRoot`, committed together with `supplierBindingsRoot` by the publisher at commit time, and `finalizePlan(bytes32)` only finalizes. Table size is decoupled from registration gas cost, with no entry cap.

The on-chain runtime commitment is `planHash` (domain `uvp.plan.runtime.v7`), whose preimage is `(hooksHash, capabilitiesRoot, supplierBindingsRoot)`; `birthAuthorizer` only enters the PlanCommit digest and on-chain storage, not `planHash`. The artifact's derived `triggers[]` read surface enumerates every order-trigger hook's birth fact and does not enter the planHash preimage.

## PlanCommit and Registration Entries

The publisher signs a six-field PlanCommit via EIP-712:

```text
publisher, hooksHash, capabilitiesRoot, supplierBindingsRoot, birthAuthorizer, deadline
```

Any relayer calls `commitPlan` with the signature and full hooks, and any caller calls `finalizePlan(planId)` to finalize. `birthAuthorizer` is the plan-level birth-submitter commitment: outside birth submissions must come from it, and the zero address closes the plan's outside birth channel (order-link and fork channels are unaffected).

## CompactHook

The on-chain hook keeps only the information needed at runtime:

```solidity
struct CompactHook {
    bytes32 hookId;
    bytes32 stageId;
    bytes32 hookName;
    uint8 flags; // ORDER_TRIGGER_MINT=1, EMIT_READY=4, ADMISSION=8, DOCK_EXECUTOR=16
    Instruction[] instructions;
    bytes32[] dependencyKeys;
}
```

The full flag set is `1 = ORDER_TRIGGER_MINT` (frozen ABI name for birth hooks), `4 = EMIT_READY`, `8 = HOOK_FLAG_ADMISSION`, `16 = HOOK_FLAG_DOCK_EXECUTOR`. Human-readable labels, raw expressions, and AST debug information are not written to contract storage; they remain in the artifact and audit materials.

- Each `sendSignals[].trigger: true` birth signal synthesizes one order-trigger hook: a single `SIGNAL` instruction, flags 1 and 4, `orderTriggerKind=trigger`.
- `validWhen` compiles into standalone admission entries (kind `admission`, flag 8) committed through hooksHash.
- A dock stage's receive hooks carry flag 16; it does not change `orderTriggerKind` and does not carry birth.
- A plan may register several order-trigger hooks; birth selects one explicitly with `triggerHookId` + `triggerStageId`, and `birthAuthorizer` is plan-wide.

## Instructions and Dependency Index

The compact instruction opcodes are `SIGNAL` / `NOT` / `AND` / `OR` / `DELAY`; `DELAY` is re-evaluated on the explicit `pokeTimer` keeper action. The compiler organizes each hook's dependencies into:

```text
signalKey -> [hookId]
```

When the contract registers the plan, it writes this into `Plan.dependencyIndex`. When a signal is submitted, the contract evaluates only the hooks affected by that `signalKey`. The deduplicated dependency-key count is ≤1024 per plan (over-limit registration reverts `TooManyDependencies`).

## Selector Binding and File Writer

Selector binding describes whether one stage may patch a target stage:

```text
selectorStageIdentifier -> targetStageIdentifier
```

On chain, `selectorStageId = keccak256(selectorStageIdentifier)` and `targetStageId = keccak256(targetStageIdentifier)`. `stages[].fileWriters` similarly folds into `(targetStageId, writerStageId)` file-writer leaves. Neither kind is stored item by item: they enter the `capabilitiesRoot` Merkle tree, and executor patches and file patches verify membership at check time by recomputing the leaf from the fields and carrying a proof (`UVPPlanMetadataModule.verifySignalCapability` / `verifyStageSelectorBinding` / `verifyFileWriter`). Leaf formulas and tree rules live in [Canonical Hash](canonical-hashes.md).

## Executor Route

An executor route (a stage's static executor and fileResources) is off-chain routing metadata: the compiler keeps it in the artifact for Product API and uvp-client scheduling, and routeId/routeHash do not enter the on-chain runtime `planHash`. A dock stage has no plan-level route and no executor candidate; its executor is selected once at runtime.

## ABI Fixture

Public ABI and freeze checks are maintained in the contract package. The current frozen set is uniformly `0.1` (state-machine, plan-registration, stage-patch, dock-registry, file-resource, lens, plan-metadata, derived-signal, supplier-registry, deployment-registry, identity-registry); EIP-712 domain versions follow the compatibility matrix and are all `1` (productSubmit, derivedSignal, stageSupplierPatch). Verification command:

```bash
pnpm verify:protocol-freeze
```

Changes to ABI, bytecode, selectors, event topics, typed-data fields, canonical hashes, or artifact schemas should be captured in release notes and migration decisions. CompactHook, event, selector, and EIP-712 fields are pinned by the state-machine fixture, the module fixtures, and `pnpm verify:protocol-freeze`. A change must update bindings, indexers, executor, and bootstrap together; updating one fixture in isolation is not an accepted migration.

## Related Pages

- [Compiler Input](compiler-input.md)
- [Canonical Hash](canonical-hashes.md)
- [Contracts and Events](../../reference/contracts-and-events.md)
- [Release and Verification](../../how-to/release-checklist.md)
