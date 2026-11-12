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

Authorized participants create orders through the birth channels (the DSL declaration surface is `sendSignals[].trigger: true`; runtime chain channels are listed below); participants, executors, and adapters submit authorized signals to it; Product/Store/uvp-client project it into task, notification, and proof views.

## What It Produces

Creation emits `OrderRegistered`, `OrderTriggered`, `OrderMaterialized`, `StageMaterialized`, and other events; running continuously produces signal records, hook runtime, executor patches, stage file patches, dock bindings, and proof rows, forming a replayable event stream. Governance fork additionally emits `OrderForked`.

## Where Authority Comes From

All Order facts come from `UVPStateMachine` events: whether a signal is valid, whether a hook is ready, and whether executor selection or file-map writes apply are all decided by on-chain events; Product DTOs are read models only.

## Order Creation

On the DSL declaration surface there is a single order-creation channel: a birth signal (a `sendSignals` entry with `trigger: true`) submitted with an empty order id. On the chain track this derives three runtime channels:

1. outside-trigger open submission: the plan-committed `birthAuthorizer` calls `triggerOrderFromOutsideFor` with an EIP-712 signature; when `birthAuthorizer` is a contract, it calls the unsigned direct entry `triggerOrderFromOutsideByAuthorizer`. Each birth signal has one birth hook, and the submitter explicitly selects the birth line with `triggerHookId` + `triggerStageId`.
2. order-link derived creation: `triggerOrderFromSignalFor` on `UVPOrderLinkModule` (inside the state machine only the module-callable `triggerOrderFromSignalFromModule`).
3. governance fork `forkOrder`: replays the parent order's history fact by fact and re-creates a new order with lineage; the order id is derived purely from parent information and the fork payload, and the same payload is idempotent.

Order ids are always derived purely by the contract from birth facts and never self-reported by callers. Dock carries emission through a binding on an existing order and does not create orders.

At creation the contract:

- Verifies the deadline, the submitter, and the plan status (only a finalized Plan can birth).
- Verifies the selected birth hook carries the `ORDER_TRIGGER_MINT` flag and belongs to that stage.
- Evaluates the birth signal's `validWhen` in the empty-order context; on failure it reverts `SignalAdmissionRejected`, no order exists, and zero fact rows are written.
- Verifies submitter authorization and (on vocabulary plans) the fact attribution proof.
- Derives the `orderId`, writes order-level signal authorizations, records the birth fact, and materializes the ready birth stage.
- Emits `OrderRegistered`, `OrderTriggered`, `OrderMaterialized`, `StageMaterialized`, and `SignalSubmitterAuthorized`.

## Dynamic Facts Inside an Order

| Fact | Source |
| --- | --- |
| Signal records | `SignalSubmitted`. |
| Hook runtime | `HookStatusChanged`, `HookReady`, `TimerPoked`. |
| Executor patch | `StageExecutorPatchApplied`, `StageExecutorActivated`. |
| Stage file patch | `StageFilePatchApplied`, `StageFileOpApplied`. |
| Dock executor selection and binding | `StageDockExecutorSelected`, `DockBindingPoked`, `DockOutputSubmitted`. |
| Task projection | Rebuilt by chain-services from `HookReady` and authorization events. |
| Proof rows | Event provenance. |

## Order and Product Order

The on-chain Order is the protocol fact container. The `ProductOrderDTO` is a product view whose Order status only expresses `registered`; whether a stage is ready, whether a task is pending, and whether some business goal is complete are expressed separately by hooks, tasks, and signals and must not be rolled up into an Order terminal state.

Product task IDs, Store Dock sandbox IDs, and adapter job IDs are workflow indexes. The identity of the on-chain Order is the composite key `(planId, orderId)`; concrete facts come from `UVPStateMachine` events.

## Orders Can Fork and Converge

One Order may contain multiple [source causal chains](source.md). In cross-border supply, supply, payment, logistics, field delivery, and buyer acceptance each advance and converge at specific hooks. An Order's dynamism does not come from a mutable overall status but from different authorized signals written into one replayable event stream under contract rules.

## No Close or Correction Entry Point

An Order does not need to be "closed" to stay consistent. A business party can stop writing further facts, or create a new Order from the same Zhixu. Signals use first-writer-wins; for deduplication and non-overwritable semantics see [Signal](signal.md). If the first-written business fact was wrong, the core protocol neither overwrites nor deletes old facts: instead a new Order is created to re-execute, and upper-layer products clearly present the business relationship between the two fact streams. Non-collaborative executor replacement takes the governance-fork lane: the parent order is kept for the record and a new order succeeds it (see `uvp-chain.md`).

If a stage is carried by another Zhixu, a dock binding forms on the B order: the target stage declares `supplierType: dock`, the order selects a dock executor once on the attach stage, and writes the A order id into the `dock_link` file entry to establish the binding; `pokeDockBinding` emits the B-side output signals as in-order facts when the A/B time windows intersect, per-output first-win. The binding applies only to an existing B order — B orders are created through B's own birth channel (see [Stage File Patch](../state-machine/file-patch.md) and [Zhixu as Executor](../apps/zhixu-as-executor.md)). Store/Product only keep sandbox, contact, review, and display state; runtime proof follows the order's on-chain events.
