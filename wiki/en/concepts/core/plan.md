---
title: Plan
type: explanation
audience: 协议读者
preread: ../README.md
status: verified
---

# Plan

> Prerequisite reading: [Core Concepts](../README.md)
A Plan is the immutable runtime rulebook a Zhixu compiles into for one chain. It carries only the hooks, dependency keys, selector bindings, signal capabilities, file-writer capability leaves, and executor candidate set the state machine must know; supplier capability, recommendation tags, fulfillment materials, and matching logic are not part of a Plan.

## Who Uses It

Publishers sign to publish Plans; registrars create Orders against finalized Plans; Store organizes Plan versions into material review and active-version display; the state machine executes strictly by the hooks and metadata inside the Plan.

## What It Produces

A successful publication produces `planHash`, `planId`, and permanently frozen on-chain commitments to the hooks, `capabilitiesRoot`, and `executorCandidatesRoot`; every Order afterwards references this immutable identity, and rule changes can only be expressed by publishing a new Plan.

## Where Authority Comes From

A Plan's authority comes from the publisher's EIP-712 signature, the hash checks of two-step registration, and contract code after module freezing; compiler artifacts only serve provenance of source artifacts. For protocol layering and component relations see [Architecture](../architecture.md).

## Identity and Hashes (Quick Reference)

```text
hooksHash              = keccak256(abi.encode(hooks))
capabilitiesRoot       = single Merkle root over three capability tables (signal capability + selector binding + file writer)
executorCandidatesRoot = single Merkle root over the (stageId, executor) candidate set
planHash               = keccak256(abi.encode(
                           keccak256("uvp.plan.runtime.v5"),  // domain
                           hooksHash,
                           capabilitiesRoot,
                           executorCandidatesRoot))
planId                 = keccak256(abi.encode(
                           keccak256("uvp.plan.id.v1"),       // domain
                           publisher,
                           planHash))
```

The `planHash` preimage is a triple: hooks, the capability-tree root, and the executor candidate-tree root. When the capability tables are empty, `capabilitiesRoot` is `keccak256("")`; when the candidate set is empty, `executorCandidatesRoot` enters the formula as the empty Merkle root and the formula itself does not change. Executor routes and resources hashes are off-chain routing metadata (they enter the artifact body but not the on-chain runtime `planHash`); leaf formulas and tree rules are in [Canonical Hash](../artifacts/canonical-hashes.md). The compiler's own artifact hashes remain for tracing source artifacts but do not impersonate the on-chain `planHash`. Putting the publisher inside `planId` prevents different publishers from fighting over global names for identical content.

## Two-step Freezing

1. The publisher makes an EIP-712 signature over the six-field PlanCommit (`publisher + hooksHash + capabilitiesRoot + executorCandidatesRoot + birthAuthorizer + deadline`); any relayer calls `commitPlan`, submitting the full hooks and committing the capability tables through `capabilitiesRoot`. `birthAuthorizer` only enters the commit digest and on-chain storage, not the runtime `planHash`; it commits the outside-birth submitter, and the zero address closes the plan's outside birth channel.
2. Any caller calls `finalizePlan(planId)` to finalize (permissionless); this step only finalizes the plan and submits no table data.

A pending Plan cannot create Orders. After finalize, hooks, `capabilitiesRoot`, and `executorCandidatesRoot` cannot change; if rules change, publish a new Plan.

## Module Freezing

After the StateMachine is deployed and seven modules are configured (stage patch, derived signal, dock registry, plan metadata, order link, lens, file resource), `freezeModules()` is called. Frozen module addresses cannot be replaced by the owner, so "the meaning of code" does not depend on the deployer's future goodwill. New implementations can only enter through a new StateMachine deployment and an explicit cutover. For the division of labor among contracts and registries see [Contracts and Registries](../contracts-and-registries.md).

## What a Plan Does Not Carry

- A Plan does not declare which company is "capable" of fulfilling.
- A Plan does not do search, recommendation, or matching for Store.
- A Plan does not store file plaintext, contacts, or real-world names.
- Order-level executor/file-map changes enter order-level records and never write back to the Plan.
