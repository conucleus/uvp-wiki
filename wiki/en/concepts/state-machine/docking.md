---
title: Docked Zhixu Runtime
type: explanation
audience: 工程贡献者
status: verified
---

# Docked Zhixu Runtime

Docked Zhixu is the order-to-order docking capability inside the state-machine
runtime. It lets a local order hand one stage to another linked Zhixu / linked
order, then map a signal that already happened in the linked order back into the
local order.

This is not a Store sandbox draft and not a normal backend integration. The
formal runtime path must land in the v2.0 `UVPDockingModule` events and proof;
the contract accepts only routes/interfaces covered by their committed
`dockRoutesRoot`, `dockInterfaceRoot`, and Merkle proofs.

## State-Machine Objects

| Object | Meaning |
| --- | --- |
| local order | The current order, identified by `(localPlanId, localOrderId)`, waiting for a peer Zhixu's output to move a local stage forward. |
| linked order | Another Zhixu order docked into this one, identified by `(targetPlanId, linkedOrderId)`, with its own plan, authorization, signals, and proof. |
| dock instance | One concrete docking relation containing local stage, route, target plan/order, source seam, input/output roots, and depth. |
| input binding | A binding from a local Hook to a target entrance/signal port, deduplicated by `inputBindingHash`. |
| output binding | A mapping from a target output port to a local source/signal, deduplicated by `outputBindingHash`. |

## Chain Events

| Event | Meaning |
| --- | --- |
| `DockOpened` | Atomically records the dock instance, local/target plan/order, route, depth, and opener. |
| `DockInputSubmitted` | Records an entrance or signal input delivered to the linked order under a binding. |
| `DockOutputSubmitted` | Records a linked output mapped back to the local order under a binding. |
| `DockTerminal` | Records that the dock reached a success/failure/cancelled terminal state. |

`UVPStateMachineLens.getActiveDock`, `dockInputDelivered`,
`dockOutputDelivered`, `dockByLocalRoute`, and `dockByTargetOrder` are the
authoritative views for the active relation. The old
`getActiveDockedOrderLink` and `getActiveDockedSignalBinding` views were removed.

## Runtime Path

```text
local stage HookReady(planId, orderId, hookId, ...)
  -> Store/Product or adapter selects a published target Zhixu/version
  -> openDockedOrder validates route/interface roots, permit, identity, and depth
  -> one transaction creates the linked order and submits the entrance input
  -> the linked order runs under its own Plan, authorization, and executor
  -> submitDockedInput delivers later local signal inputs as needed
  -> linked SignalSubmitted appears
  -> submitDockedSignal submits the output binding
  -> local order receives mapped SignalSubmitted and DockOutputSubmitted proof
  -> local hooks continue evaluation; terminal output emits DockTerminal
```

Every cross-plan reference must retain `planId`. An `orderId` is not a global key
and cannot be used alone to look up or merge docks, signals, or proofs.
`dockInstanceId` also includes the local plan namespace in its preimage;
`linkedOrderId` is derived from the dock instance and target definition identity,
preventing cross-plan preemption.

## Subscriptions and Entries

The local stage entry is produced by a `receiveSignals` Hook. A cross-source
fact uses `::ANCHOR(@source::task.stage.signal)`; a birth stage additionally
declares `mint: per-fact`. The old `stage.trigger`, `externalSignals`,
`triggerEntrance`, `::OUTSIDE@(...)`, `::MERGE@(...)`, and old
`::ANCHOR@(…)` wrappers are not part of the current DSL and are rejected by the
compiler.

The `supplierType: zhixu` configuration must express `inputMap` and `signalMap`
as target port names. The `uvp.dock.resolution.v1` manifest resolves target
UID/version and artifact/interface roots. `signalMap` no longer carries Hook DSL
and does not complete local business work merely by being configured.

## Depth and Idempotency

The parent's real dock depth is authoritative. A new instance has
`parentDepth + 1` and cannot exceed frozen `MAX_DOCK_DEPTH=8`. Open, entrance
input, linked-order registration, and `DockOpened` complete in one EVM
transaction; any failure rolls everything back. After dock identity, route,
endpoint, and permit checks pass, a repeated open returns `false` without
consuming the permit nonce. Repeated input/output returns an idempotent result
or an explicit conflict.

## Boundaries

- The local and linked orders are independent on-chain orders, each with `(planId, orderId)`, authorization, events, and lifecycle.
- The linked Zhixu has its own plan publication, order registration, signal authorization, and proof.
- A Store docking session is only trial composition and review material; formal proof comes from `DockOpened`, `DockInputSubmitted`, `DockOutputSubmitted`, `DockTerminal`, and events on both orders.
- `submitDockedSignal` maps a signal that already exists in the linked order and satisfies the binding; it does not create business facts for the linked order.
- Unknown, pending, reverted, and retryable states must remain distinct in adapters/Store and must not be rendered as success or silently dropped.

For the canonical narrative from the executor's perspective, see [Docked Zhixu / Zhixu as Executor](../apps/zhixu-as-executor.md).
