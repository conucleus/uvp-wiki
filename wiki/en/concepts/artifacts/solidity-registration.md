---
title: On-chain Registration Parameters
type: reference
audience: 工程贡献者
status: verified
---

# On-chain Registration Parameters

`OnchainHookPlanArtifact` is not yet the final transaction parameter set. The compiler further converts it into the compact structures required by `UVPStateMachine.commitPlan()` and `UVPStateMachine.finalizePlan()`.

## CompactHook

The on-chain hook keeps only the information needed at runtime:

```solidity
struct CompactHook {
    bytes32 hookId;
    bytes32 stageId;
    bytes32 hookName;
    bool trigger;
    Instruction[] instructions;
    bytes32[] dependencyKeys;
}
```

Human-readable labels, raw expressions, and AST debug information are not written to contract storage. They remain in the artifact and audit materials.

## Dependency Index

The compiler organizes each hook’s dependencies into:

```text
signalKey -> [hookId]
```

When the contract registers the plan, it writes this into `Plan.dependencyIndex`. When a signal is submitted, the contract evaluates only the hooks affected by that `signalKey`.

## Selector Binding

Selector binding is the wire / API field name for describing whether one stage may patch a target stage:

```text
selectorStageIdentifier -> targetStageIdentifier
```

On-chain, the form is:

```text
selectorStageId = keccak256(selectorStageIdentifier)
targetStageId = keccak256(targetStageIdentifier)
bindingKey = keccak256(abi.encode(selectorStageId, targetStageId))
```

Executor patches and resource patches both go through this binding check.

## ABI Fixture

Public ABI and freeze checks are maintained in the contract package. Verification command:

```bash
pnpm verify:protocol-freeze
```

Changes to ABI, bytecode, selectors, event topics, typed-data fields, canonical hashes, or artifact schemas should be captured in release notes and migration decisions.
