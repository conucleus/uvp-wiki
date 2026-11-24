---
title: Birth Signals and Order Entries
type: explanation
audience: 协议读者
preread: ../README.md
status: verified
---

# Birth Signals and Order Entries

> Prerequisite reading: [Core Concepts](../README.md)

This page answers two questions: where orders come from, and how stages materialize. Birth is expressed by `trigger: true` on a `sendSignals` entry: the compiler synthesizes an order-trigger hook for each birth signal, while every `receiveSignals` entry remains an in-order Hook.

## Birth Declaration

```yaml
- name: intake
  source: customer
  sendSignals:
    - name: requested
      trigger: true
    - name: str
    - name: cmp
    - name: err
  executor: { supplierType: organization, supplierID: 7c1d3f52-9a4b-4e68-8f20-3b5d7a9c1e40 }
```

- A birth entry belongs to the stage's `sendSignals`, is unique within the stage, is fixed at compile time, and enters the plan commitment surface.
- A stage may declare several birth signals, and a plan may have several birth stages; a birth stage need not be the first stage.
- The birth stage's executor is a static plain executor (`individual`/`organization` with a non-empty `supplierID`); birth authority never follows a dock binding or a runtime patch.
- The compiled artifact enumerates birth entries in `triggers[]`; `orderTriggerKind` is the closed set `none | trigger`, and `emitReady` marks whether the hook's first Ready emits `HookReady`.

## Submission and Birth Decision

- The chain track has exactly one entry: `UVPStateMachine.submitSignal(submission, signature)`. Birth happens when `orderId == bytes32(0)` and `(sourceId, signalId)` hits a trigger hook carrying `ORDER_TRIGGER_MINT`.
- The submitter must be the birth stage's currently effective assigned supplier account (the SID must be `active`).
- The contract first evaluates `validWhen` in the empty-order context (no facts/files; negative conditions hold, existence and delay-maturity conditions do not); a failure reverts `SignalAdmissionRejected`. On success it checks that `(submitter, idempotencyKey)` is unused, has `_newOrderId` generate the order id at runtime, registers/creates the order, and writes that signal as the first fact.
- Empty `orderId` + a non-birth signal → a named rejection (a `NotTriggerSignal`-class entry error).
- A birth signal carrying an `orderId` is handled as an ordinary in-order signal; birth identity applies only to empty-`orderId` submission.
- Retrying the same birth fact is idempotent: the same `(submitter, idempotencyKey)` reverts `DuplicateTriggerKey` with the `existingOrderId`; the payload does not participate in order-id derivation.
- The birth fact itself is the order's first fact, settled first-win.

## Single Birth Entry

| Entry | Summary |
| --- | --- |
| `submitSignal(orderId=0)` | The birth stage's assigned supplier account signs and submits the birth signal; the signature may be direct (`msg.sender == submitter`) or relayed. The contract resolves the trigger hook by `(planId, sourceId, signalId)` and checks birth admission plus `usedTriggerKeys`. |

A Dock establishes a binding on an existing order and emits B output signals; orders are always created through the birth entry above.

## Materialization Gate

A chain stage can only materialize through its own order-trigger hook or an EMIT_READY hook, and every stage needs at least one materialization path:

- Birth stage: each birth signal synthesizes one order-trigger hook; it materializes even without `receiveSignals`.
- Other stages: a receive hook of a stage with a static executor (plain or dock) compiles to EMIT_READY; a dynamic stage without an `executor` block materializes through its own receive hook's EMIT_READY and carries `HOOK_FLAG_DYNAMIC_EXECUTOR` (flags bit 32), with the selector assigning its supplierId at runtime before the first signal.
- A stage with neither birth signals nor `receiveSignals` compiles to zero hooks and can never materialize; `uvp-core analyze` rejects it wholesale at compile time.
- Dock stage: its receive hooks carry the `HOOK_FLAG_DOCK_EXECUTOR` flag (flags bit 16), and its supplier is written by a one-time order-level selection; a dock stage has no order-trigger hook.

The full hook flag set: `1 = ORDER_TRIGGER_MINT`, `4 = EMIT_READY`, `8 = ADMISSION`, `16 = DOCK_EXECUTOR`, `32 = DYNAMIC_EXECUTOR`.

## Runtime and Proof

```text
birth signal submitted with an empty orderId
  -> admission (validWhen evaluated in the empty-order context)
  -> _newOrderId + OrderTriggered + first fact
  -> order-trigger HookReady

receive hook evaluates
  -> HookStatusChanged
  -> (if emitReady) HookReady(planId, orderId, hookId, stageId, hookName)
  -> later facts arrive from assigned-supplier signals or Dock emission
```

`HookReady` means only that a task or entry can be processed, not that business work is complete. Completion, failure, and cancellation are expressed by authorized `SignalSubmitted` or Dock emission events; unknown or retrying states are rendered as explicit states.

## Acceptance Surface

- The stage field closed set: `name`, `source`, `executor`, `selectedStages`, `sendSignals`, `receiveSignals`, `fileResources`, `fileWriters`.
- Birth entries lie within the stage's `sendSignals` and are unique; a birth stage uses a static plain executor.
- In-order fact connections use only `receiveSignals` `source::condition` expressions; cross-order collaboration uses an independent `kind: Dock` document plus the target stage's `executor.supplierType: dock`, as described in [Dock and Binding](../state-machine/docking.md) and [Dock Collaboration](../apps/zhixu-as-executor.md).
- Definition shape, field-level validation, and per-track acceptance follow the `uvp-core` language manual and `uvp-chain.md` Appendix B in the `uvp-eth` repo.
