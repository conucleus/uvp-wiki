---
title: Plan
type: explanation
audience: 协议读者
preread: ../README.md
status: verified
---

# Plan

> Prerequisite reading: [Core Concepts](../README.md)
A Plan is the immutable runtime rulebook a Zhixu compiles into for one chain. It carries only the hooks, dependency keys, selector bindings, and signal capabilities the state machine must know; supplier capability, recommendation tags, fulfillment materials, and matching logic are not part of a Plan.

## Who Uses It

Publishers sign to publish Plans; registrars create Orders against finalized Plans; Store organizes Plan versions into material review and active-version display; the state machine executes strictly by the hooks and metadata inside the Plan.

## What It Produces

A successful publication produces `planHash`, `planId`, and permanently frozen on-chain hooks/metadata plus the dock-root commitments; every Order afterwards references this immutable identity, and rule changes can only be expressed by publishing a new Plan.

## Where Authority Comes From

A Plan's authority comes from the publisher's EIP-712 signature, the hash checks of two-step registration, and contract code after module freezing; compiler artifacts only serve provenance of source artifacts. For protocol layering and component relations see [Architecture](../architecture.md).

## Identity and Hashes (Quick Reference)

```text
hooksHash        = keccak256(abi.encode(hooks))
metadataHash     = keccak256(abi.encode(selectorBindings, signalCapabilities))
planHash         = keccak256(abi.encode(
                     keccak256("uvp.plan.runtime.v2"),  // domain
                     hooksHash,
                     metadataHash,
                     dockRoutesRoot,
                     dockInterfaceRoot))
planId           = keccak256(abi.encode(
                     keccak256("uvp.plan.id.v1"),       // domain
                     publisher,
                     planHash))
```

The `planHash` preimage is a four-tuple: hooks, metadata, and the two dock roots (routes and interface). When a Plan declares no docks, both roots enter the formula as the empty Merkle root; the formula itself does not change. The compiler's own artifact hashes remain for tracing source artifacts but no longer impersonate the on-chain `planHash`. Putting the publisher inside `planId` prevents different publishers from fighting over global names for identical content.

## Two-step Freezing

1. The publisher makes an EIP-712 signature over the PlanCommit (`publisher + hooksHash + metadataHash + dockRoutesRoot + dockInterfaceRoot + deadline`); any relayer calls `commitPlan`, submitting the full hooks at once.
2. Any caller submits selector bindings and signal capabilities; `finalizePlan` verifies `metadataHash` and the Metadata Module writes them in one shot, permanently frozen.

A pending Plan cannot create Orders. After finalize, neither hooks nor metadata can change; if rules change, publish a new Plan.

## Module Freezing

After the StateMachine is deployed and six modules configured, `freezeModules()` is called. Frozen module addresses cannot be replaced by the owner, so "the meaning of code" no longer depends on the deployer's future goodwill. New implementations can only enter through a new StateMachine deployment and an explicit cutover. For the division of labor among contracts and registries see [Contracts and Registries](../contracts-and-registries.md).

## What a Plan Does Not Carry

- A Plan does not declare which company is "capable" of fulfilling.
- A Plan does not do search, recommendation, or matching for Store.
- A Plan does not store file plaintext, contacts, or real-world names.
- Runtime executor/resource changes of an Order enter the Order overlay and never write back to the Plan.
