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
    schemaVersion: uvp.dock.v1
    target:
      zhixu: customs-clearance
      version: "1"
    order:
      idPolicy: derived-v1
    inputMap:
      READY: entrance
    signalMap:
      str: started
      cmp: completed
      err: failed
```

`inputMap` keys must be local `receiveSignals` Hook names and values must be
target input-port names; `signalMap` keys must be local `sendSignals` and values
must be target output-port names. The compiler validates target UID/version,
port direction, interface root, route root, and the single-entrance invariant.

## Retired fields

The compiler explicitly rejects:

- `stage.trigger` and `stage.externalSignals`;
- executor `triggerEntrance`;
- combining `supplierType: zhixu` with `supplierID`;
- putting `source::task.stage.signal` Hook DSL in a `signalMap` value;
- `::OUTSIDE@(...)`, `::MERGE@(...)`, and the old `::ANCHOR@(…)` wrappers.

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
