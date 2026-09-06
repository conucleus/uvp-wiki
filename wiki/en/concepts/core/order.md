---
title: Order
type: explanation
audience: 协议读者
preread: ../README.md
status: verified
---

# Order

> Prerequisite reading: [Core Concepts](../README.md)
An Order is a run. In the protocol, it is an independent fact stream forked from a registered [Plan](plan.md). Once an Order is opened and has an `orderId`, the protocol only promises that it is registered and can keep accepting well-formed facts; the core protocol does not define Order lifecycle states like `running`, `completed`, or `cancelled`.

## Who Uses It

A registrar creates orders through the trigger order entry; participants, executors, and adapters submit authorized signals to it; Product/Store/executor-kit project it into task, notification, and proof views.

## What It Produces

Creation emits `OrderRegistered`, `OrderTriggered`, `OrderMaterialized`, `StageMaterialized`, and other events; running continuously produces signal records, hook runtime, executor/resource overlays, and proof rows, forming a replayable event stream.

## Where Authority Comes From

All Order facts come from `UVPStateMachine` events: whether a signal is valid, whether a hook is ready, and whether an executor overlay applies are all decided by on-chain events; Product DTOs are read models only.

## Order Creation

An order binds to a registered Plan through the trigger order entry:

```text
triggerOrderFromOutsideFor(trigger, authorizations, signature)
triggerOrderFromSignalFor(trigger, authorizations, signature)
```

At creation the contract:

- Checks that the registrar transaction sender is allowed.
- Verifies the trigger typed-data signature and recovers the business submitter.
- Checks that the plan exists and is still endorsed by the official domain.
- Writes order-level signal authorizations.
- Records the trigger fact or trigger-origin link.
- Materializes ready trigger stages.
- Emits `OrderRegistered`, `OrderTriggered`, `OrderMaterialized`, `StageMaterialized`, and `SignalSubmitterAuthorized`.

## Dynamic Facts Inside an Order

| Fact | Source |
| --- | --- |
| Signal records | `SignalSubmitted`. |
| Hook runtime | `HookStatusChanged`, `HookReady`, `TimerPoked`. |
| Executor overlay | `StageExecutorPatchApplied`, `StageExecutorActivated`. |
| Resource overlay | `StageResourcePatchApplied`. |
| Task projection | Rebuilt by chain-services from `HookReady` and authorization events. |
| Proof rows | Event provenance. |
| Docking relation | `DockOpened`, `DockInputSubmitted`, `DockOutputSubmitted`, `DockTerminal`, plus each side's own signal/proof. |

## Order and Product Order

The on-chain Order is the protocol fact container. The `ProductOrderDTO` is a product view whose Order status only expresses `registered`; whether a stage is ready, whether a task is pending, and whether some business goal is complete are expressed separately by hooks, tasks, and signals and must not be rolled up into an Order terminal state.

Product task IDs, Store docking session IDs, and adapter job IDs are workflow indexes. The identity of the on-chain Order remains `orderId`; concrete facts come from `UVPStateMachine` events.

## Orders Can Fork and Converge

One Order may contain multiple [source causal chains](source.md). In cross-border supply, supply, payment, logistics, field delivery, and buyer acceptance each advance and converge at specific hooks. An Order's dynamism does not come from a mutable overall status but from different authorized signals written into one replayable event stream under contract rules.

## No Close or Correction Entry Point

An Order does not need to be "closed" to stay consistent. A business party can stop writing further facts, or create a new Order from the same Zhixu. Signals use first-writer-wins; for deduplication and non-overwritable semantics see [Signal](signal.md). If the first-written business fact was wrong, the core protocol neither overwrites nor deletes old facts: instead a new Order is created to re-execute, and upper-layer products clearly present the business relationship between the two fact streams.

If a stage is carried by another Zhixu, a signal binding between the local order and the linked order usually forms: after route/interface proofs pass, the docking module's `openDockedOrder` atomically records the relation and linked order, then `submitDockedInput` / `submitDockedSignal` deliver inputs and outputs. For the full runtime path see [Zhixu as Executor](../apps/zhixu-as-executor.md); Store/Product only keep sandbox, contact, review, and display state — runtime proof follows on-chain events of both orders.
