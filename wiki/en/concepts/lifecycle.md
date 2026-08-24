---
title: Plan and Order Lifecycle
type: explanation
audience: 应用开发者
status: verified
---

# Plan and Order Lifecycle

An order passes through seven steps from static Zhixu to on-chain fact. The six-stage table below shows the key component and source of authority for each step:

| Stage | Key components | Source of authority |
| --- | --- | --- |
| Design | Nucleus, Store, Compiler | Zhixu source, Store materials, and deterministic compilation results. |
| Publication | Publisher, Protocol Bindings, StateMachine | EIP-712 publisher signature and Plan events. |
| Identity resolution | Store, Identity Registry | Store offline records and subject/account binding. |
| Order creation | Product BFF, Order participants | Creator signature, participant acceptance records, and order authorization. |
| Order progression | Order App, executor-kit, StateMachine | Submitter signatures, Signal and Hook events. |
| Display and verification | Chain Services, Product DTO | Replayable chain events, hashes, and projections. |

## 1. Author and Compile

Store or developers write the Zhixu; the Compiler generates hooks, selector bindings, signal capabilities, `hooksHash`, `metadataHash`, and the runtime `planHash`. Compilation only validates rule structure; it does not certify real-world supplier capability.

## 2. Configure and Freeze the StateMachine

Deploy the StateMachine and six modules, then call `freezeModules()` once addresses are set. After freezing, the owner cannot replace a module; upgrades require deploying a new StateMachine and switching explicitly through the Deployment Registry.

## 3. Sign and Commit the Plan

The publisher signs `publisher + hooksHash + metadataHash + deadline`. Any relayer calls `commitPlan`; the contract verifies the hash of the full hooks and the publisher signature, and derives `planId = hash(publisher, planHash)`.

## 4. Freeze Metadata Once

Any caller submits selector bindings and signal capabilities. `finalizePlan` verifies `metadataHash` and writes to the Metadata Module in one shot. Only finalized Plans can create Orders.

## 5. Identity Directory (Optional)

After verifying subjects offline, Store may register `subjectId -> account` in its own `UVPIdentityRegistry`. This step only improves name display, contacts, and compliance audit; it is not an on-chain admission step for Plans or Orders. The Identity Registry appears only in the identity-resolution stage: supplier capability, search, recommendation, and matching are maintained by each Store independently; Plan publication is done by the publisher with the StateMachine.

## 6. Trigger Creates the Order

The creator/submitter signs trigger typed data; any relayer broadcasts it. The contract binds the finalized `planId`, writes order-level signal authorizations, records the trigger fact, and materializes the initial stage. There is no registrar allowlist.

## 7. Business Execution and Projection

Authorized wallets submit Signals directly or through relayers. The contract evaluates hooks and emits replayable events. Chain Services rebuild order, task, identity, and proof views from events only; Store names, tags, recommendations, notifications, and draft workflows are off-chain state.
