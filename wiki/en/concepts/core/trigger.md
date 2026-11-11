---
title: Ready and Order Entries
type: explanation
audience: 协议读者
preread: ../README.md
status: verified
---

# Ready and Order Entries

> Prerequisite reading: [Core Concepts](../README.md)

A stage-level `trigger` is the explicit birth entry: it declares a subset of the
stage's `sendSignals`, and each trigger signal synthesizes one order-trigger hook.
Every `receiveSignals` entry is still an in-order Hook; the compiler uses
`orderTriggerKind` and `emitReady` to describe a Hook's order-entry role, and the
compiled artifact enumerates every order-trigger hook in `triggers[]`.

## Three entry roles

| `orderTriggerKind` | Meaning |
| --- | --- |
| `none` | A normal in-order Hook; Ready updates state and may be consumed by a later flow. |
| `trigger` | Birth entry; bound to one trigger signal of the stage, it creates the order when submitted with an empty `orderId`. |
| `dock` | Docking entry; once Ready, an already committed dock route/interface can open or attach the linked order. |

The first transition to Ready for a Hook with `emitReady=true` emits one
`HookReady`. The event carries `(planId, orderId, hookId, stageId, hookName)`;
`planId` must be retained with the order and must never be inferred from a bare
`orderId`. An internal Hook with `emitReady=false` may still evaluate but emits
no `HookReady`.

## Normal and birth stages

A normal stage uses an in-order expression:

```yaml
- name: review
  source: buyer
  receiveSignals:
    READY: seller::submit.cmp
  sendSignals: [{name: str}, {name: cmp}, {name: err}]
```

A birth stage declares the signals that may create an order through `trigger`;
each entry must be a member of the stage's `sendSignals`:

```yaml
- name: intake
  source: customer
  trigger: [requested]
  sendSignals: [{name: requested}, {name: str}, {name: cmp}, {name: err}]
```

- `trigger` may be omitted or empty: the stage cannot create orders. Non-empty:
  each signal synthesizes one order-trigger hook. A stage may declare several
  trigger signals, a plan may have several trigger stages, and a trigger stage
  need not be the first stage.
- Submitting `(stage, signal, orderId?)`: with an `orderId` the signal is an
  ordinary in-order signal and trigger membership is irrelevant; with an empty
  `orderId` the signal must belong to that stage's `trigger` set, otherwise it is
  rejected with the named not-a-trigger error.
- On a trigger hit, the signal's `validWhen` is evaluated in the empty-order
  context first (no facts/files; negative conditions true; existence/delay
  conditions false); failure rejects with `SignalAdmissionRejected`. On success
  the order id is derived from the birth fact, the order is registered/created,
  and the signal is written as the first fact.
- Re-delivery of the same birth fact is idempotent (same order id, no second
  order); the submitting side keeps `birthKey`/`factKey` idempotency semantics.
- A trigger stage must use a static `individual`/`organization` executor (with a
  `supplierID`); it cannot be a `zhixu` executor or an executor-patch target.

## Dock entries

A `supplierType: zhixu` stage describes its dock through
`zhixuExecutorConfig`; it does not use `supplierID`, `triggerEntrance`, or
Hook-DSL-shaped `signalMap` values:

```yaml
executor:
  supplierType: zhixu
  zhixuExecutorConfig:
    target:
      zhixu: customs-clearance
    interface: clearance_service
    order:
      mode: new
    inputMap:
      READY: execute     # mode=new: exactly one input binding (the birth anchor)
    signalMap:
      str: started
      cmp: completed
      err: failed
```

`inputMap` keys must be local `receiveSignals` channels and values must be
input-port names of the target interface; `signalMap` keys must be local
`sendSignals` and values must be output-port names of the target interface. At
least one of the two maps must be non-empty. The target name (slug shape, same
rule as `metadata.name`), interface existence, port direction,
`order.mode ∈ the target interface's orderModes`, the interface root, the route
root, and the single input binding of `mode=new` are all validated at compile
time. `mode=existing` creates no child order; it attaches an existing target
order as a peer — carried by both tracks, on-chain via `attachDockedOrder`
(`UVPDockingModule` 4.8), sharing the same delivery surface as `new` after the
attach (see [Docked Zhixu Runtime](../state-machine/docking.md)).

## Forms the compiler explicitly rejects

The following forms are not valid DSL; the compiler explicitly rejects:

- fields outside the stage closed set, and executor `triggerEntrance`;
- `trigger` entries that are not members of the stage's `sendSignals`, duplicate
  entries, or a trigger stage whose executor is not a static plain executor;
- combining `supplierType: zhixu` with `supplierID`;
- putting `source::stage.signal` Hook DSL in a `signalMap` value;
- cross-order subscription wrappers — in-order conditions use only
  `source::condition` expressions.

In-order fact connections use `receiveSignals`; cross-order connections use
`spec.dockInterface` plus `executor.zhixuExecutorConfig`; `trigger` is the
explicit birth entry.

## Runtime and proof

```text
trigger signal submitted with empty orderId
  -> admission (validWhen) in the empty-order context
  -> OrderRegistered + first fact
  -> order-trigger HookReady

receive Hook evaluates
  -> HookStatusChanged
  -> (if emitReady) HookReady(planId, orderId, hookId, stageId, hookName)
  -> Product/Store projects a task or dock workflow
  -> authorized signal / dock event supplies the next fact
```

`HookReady` means that a task or docking entry can be processed; it does not
mean that business work is complete. Completion, failure, and cancellation
must be expressed through an authorized `SignalSubmitted` or a docking-module
proof event. Unknown or retrying states must not be rendered as success.
