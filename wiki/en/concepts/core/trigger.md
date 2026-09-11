---
title: Ready and Order Entries
type: explanation
audience: 协议读者
preread: ../README.md
status: verified
---

# Ready and Order Entries

> Prerequisite reading: [Core Concepts](../README.md)

The current DSL has no stage-level `trigger` or `externalSignals` fields. Every
`receiveSignals` entry is a Hook; the compiler uses `orderTriggerKind` and
`emitReady` to describe that Hook's order-entry role.

## Three entry roles

| `orderTriggerKind` | Meaning |
| --- | --- |
| `none` | A normal in-order Hook; Ready updates state and may be consumed by a later flow. |
| `mint` | Birth-stage entry; `mint: per-fact` deterministically mints one order from each `ANCHOR(@...)` subscription fact. |
| `dock` | Docking-stage entry; once Ready, an already committed dock route/interface can open the linked order. |

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
    READY: seller::purchase.submit.cmp
  sendSignals: [str, cmp, err]
```

A birth stage explicitly declares `mint: per-fact` and may use only a
cross-source subscription as its entry:

```yaml
- name: intake
  source: customer
  mint: per-fact
  receiveSignals:
    REQUESTED: "::ANCHOR(@customer::request.submit.requested)"
  sendSignals: [str, cmp, err]
```

`per-fact` is currently the only `mint` value. A birth stage must use a static
`individual` or `organization` executor; the compiler rejects self-loops and
unbounded cross-source re-mint cycles. Re-delivery of one fact resolves to the
same derived order and cannot create a second one.

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
time. `mode=existing` creates no child order; it only attaches an existing
target order (a cloud-track semantic; rejected explicitly at on-chain compile
time).

## Retired fields

The compiler explicitly rejects:

- `stage.trigger` and `stage.externalSignals`;
- executor `triggerEntrance`;
- combining `supplierType: zhixu` with `supplierID`;
- putting `source::task.stage.signal` Hook DSL in a `signalMap` value;
- wrapper forms other than the subscription (e.g. `::OUTSIDE@(...)` or the old `::ANCHOR@(…)`).

For a cross-source fact, use `::ANCHOR(@source::task.stage.signal)`; to mint an
order from that fact, additionally declare `mint: per-fact` on the stage.

## Runtime and proof

```text
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
