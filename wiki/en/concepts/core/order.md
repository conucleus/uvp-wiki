---
title: Order
type: explanation
audience: 协议读者
preread: ../README.md
status: verified
---

# Order

> Prerequisite reading: [Core Concepts](../README.md)
An Order is a run. In the protocol, it is an independent fact stream split from a registered [Plan](plan.md). Once an Order is opened and has an `orderId`, the protocol only promises that it is registered and can keep accepting well-formed facts; the core protocol does not define Order lifecycle states like `running`, `completed`, or `cancelled`.

## Who Uses It

Authorized participants create orders through the single birth entry (the DSL declaration surface is `sendSignals[].trigger: true`; on the chain track it is `submitSignal(orderId=0)`); participants, assigned suppliers, and adapters submit authorized signals to it; Product/Store/uvp-client project it into task, notification, and proof views.

## What It Produces

Creation emits `OrderTriggered`, `OrderRegistered`, `OrderMaterialized`, `StageMaterialized`, and other events; running continuously produces signal records, hook runtime, stage supplier patches, stage file writes, dock bindings, and proof rows, forming a replayable event stream.

## Where Authority Comes From

All Order facts come from `UVPStateMachine` events: whether a signal is valid, whether a hook is ready, and whether supplier selection or file-map writes take effect are all decided by on-chain events; Product DTOs are read models only.

## Order Creation

Order creation has exactly one channel on the DSL declaration surface: a birth signal (`sendSignals` entry marked `trigger: true`) submitted with an empty order id. The chain track likewise has exactly one entry, `submitSignal(orderId=0)`:

1. The birth stage's currently effective assigned supplier account signs the EIP-712 `UVPStateMachineSignalSubmission`; the signature may be direct or relayed by any relayer.
2. The contract resolves the trigger hook by `(planId, sourceId, signalId)`, and checks the deadline, plan finalized, SID active, birth admission, and `(submitter, idempotencyKey)` deduplication.
3. `_newOrderId` generates the order id at runtime; the caller never self-reports it. The birth fact is written as the first fact, the trigger hook must be Ready, and the initial stage is materialized.

At creation the contract:

- Verifies the deadline, the submitter, and the plan status (only a finalized Plan can birth).
- Verifies the selected birth hook carries the `ORDER_TRIGGER_MINT` flag and belongs to that stage.
- Evaluates the birth signal's `validWhen` in the empty-order context; on failure it reverts `SignalAdmissionRejected`, no order exists, and zero fact rows are written.
- Verifies the submitter is the birth stage's effective supplier account, and (on vocabulary plans) the fact attribution proof.
- Generates the `orderId`, records the birth fact, and materializes the ready birth stage.
- Emits `OrderTriggered`, `OrderRegistered`, `OrderMaterialized`, and `StageMaterialized`; `SignalSubmitted` records the submitter and relayer.

## Dynamic Facts Inside an Order

| Fact | Source |
| --- | --- |
| Signal records | `SignalSubmitted`. |
| Hook runtime | `HookStatusChanged`, `HookReady`, `TimerPoked`. |
| Stage supplier patch | `StageSupplierPatchApplied`, `StageSupplierAssigned`. |
| Stage file writes | `StageFileWritten`. |
| Dock supplier selection and binding | `StageDockSupplierSelected`, `DockBindingPoked`, `DockOutputSubmitted`. |
| Task projection | Rebuilt by chain-services from `HookReady` and fact events. |
| Proof rows | Event provenance. |

## Order and Product Order

The on-chain Order is the protocol fact container. The `ProductOrderDTO` is a product view whose Order status only expresses `registered`; whether a stage is ready, whether a task is pending, and whether some business goal is complete are expressed separately by hooks, tasks, and signals and must not be rolled up into an Order terminal state.

Product task IDs, Store Dock sandbox IDs, and adapter job IDs are workflow indexes. The identity of the on-chain Order is the composite key `(planId, orderId)`; concrete facts come from `UVPStateMachine` events.

## Orders Can Converge

One Order may contain multiple [source causal chains](source.md). In cross-border supply, supply, payment, logistics, field delivery, and buyer acceptance each advance and converge at specific hooks. An Order's dynamism does not come from a mutable overall status but from different authorized signals written into one replayable event stream under contract rules.

## No Close or Correction Entry Point

An Order does not need to be "closed" to stay consistent. A business party can stop writing further facts, or create a new Order from the same Zhixu. Signals use first-writer-wins; for deduplication and non-overwritable semantics see [Signal](signal.md). If the first-written business fact was wrong, the core protocol neither overwrites nor deletes old facts: instead a new Order is created to re-execute, and upper-layer products clearly present the business relationship between the two fact streams. Non-collaborative supplier replacement has no in-protocol patch path that bypasses the original supplier's signature; when a new order is needed, create it through the birth entry (see `uvp-chain.md`).

If a stage is carried by another Zhixu, a dock binding forms on the B order: the target stage declares `supplierType: dock`, the order selects a dock supplier once on the attach stage, and writes the A order id into the `dock_link` file entry to establish the binding; `pokeDockBinding` emits the B-side output signals as in-order facts when the A/B time windows intersect, per-output first-win. The binding applies only to an existing B order — B orders are created through B's own birth entry (see [Stage File Writes](../state-machine/file-patch.md) and [Zhixu as Executor](../apps/zhixu-as-executor.md)). Store/Product only keep sandbox, contact, review, and display state; runtime proof follows the order's on-chain events.
