# Trigger

A Trigger turns a ready condition into an executable task. More precisely, it is a special hook marker: once a receive hook becomes ready, the task for that stage can open, the chain should emit `HookReady`, and Product/Store/executor-kit can project it as an executable task, notification, or adapter job.

For first-pass readers, `HookReady` means "this task is ready to handle." It does not mean the business work is complete. Completion is proven later by an authorized `SignalSubmitted` event and its evidence fingerprint.

Trigger is a compile-time mark on Hook, coming from the `trigger` array in a Zhixu stage. The array is a pure OR wakeup set: any listed key may wake the stage. Each key points to one `receiveSignals` hook; that hook keeps the current stable Hook DSL semantics, including `~`, `&`, `|`, and explicit duration delays such as `+5s`, and is validated by the existing Hook DSL parser/compiler rules. Legacy `+T` is not part of the current stable semantics; it should only be enabled after Rust core, cloud PG trigger handling, and the on-chain runtime agree on one behavior.

```yaml
trigger:
  - START
receiveSignals:
  START: buyer::order.confirm.cmp
```

After compilation, the `START` receive hook carries `trigger=true`. If it becomes ready for the first time, `UVPStateMachine` emits:

```text
HookReady(orderId, hookId, stageId, hookName)
```

## Why Trigger Must Be Explicit

A stage may have multiple hooks: some wait for inputs, some belong to `signalMap`, some are for failure paths or internal conditions. Trigger’s job is to lift “the condition is satisfied” into “this task can now be opened or claimed.”

On the product side, Trigger can be understood as:

- A Product task can be created or marked ready.
- Store can create a contact or notification intent.
- An executor-kit chain watcher can claim or route a job.
- An adapter can assign an external execution number, work order number, or linked Zhixu start request.

Numbering boundary: on-chain `orderId` is created through a trigger-order entrypoint such as `triggerOrderFromOutsideFor` or `triggerOrderFromSignalFor`. Trigger may also open a Product task ID, Store docking session ID, external work order number, or linked-order creation flow; these are workflow numbers. The identity of the local Order and the proof of progress still come from the on-chain `orderId`, trigger link, and signal/docking events.

## Compiler and Contract Semantics

The current compiler requires every name in `stage.trigger` to reference an existing `receiveSignals` key in the same stage. In other words, Trigger must be attached to a receive hook.

```text
stage.receiveSignals.START
  -> compiled hook trigger=true
  -> StoredHook.trigger=true
  -> HookStatus Ready
  -> HookReady emitted once
```

The contract has a `readyEmitted` flag, so `HookReady` for the same hook is emitted only once. A `trigger=false` hook can still become ready, but it does not emit `HookReady` and should not directly create a Product task.

## Relation to Docked Zhixu

When a stage in a local Order is executed by another Zhixu, the Trigger on the local stage means “it is now possible to hand this stage to the peer Zhixu or adapter for execution.” The linked Zhixu’s `str`, `cmp`, and `err` are then mapped back into the local Order through `signalMap` and authorized submitters or docking events.

If Product, registrar, or operator workflow opens this docking stage from outside the Order, give the link stage an explicit entry:

```yaml
trigger:
  - LINK_READY
receiveSignals:
  LINK_READY: ::OUTSIDE
executor:
  supplierType: zhixu
  supplierID: "{{ .peer_zhixu_uid }}"
  zhixuExecutorConfig:
    signalMap:
      str: peer::task.start.str
      cmp: peer::task.close.cmp
      err: peer::task.close.err
```

Here `::OUTSIDE` is the external entrance signal on the empty source, used to open the local stage docking workflow. The business submitter must sign the trigger typed data; the registrar or relayer only broadcasts it. `signalMap` explains linked-order output and does not emit `HookReady` on its own.

```text
local stage trigger Ready
  -> Store/Product start docking workflow
  -> linked order executes
  -> linked order proof is validated
  -> submitDockedSignal or authorized submitter submits mapped signal to local order
```

Every cross-Zhixu advancement must still return to on-chain signal, proof, and replayable events.

## Boundary Checks

- Trigger is a hook mark compiled into HookPlan and the contract. Manual UI buttons call product actions that eventually submit signals or patches.
- On-chain `orderId` comes from a trigger-order entrypoint.
- Trigger becoming ready usually means execution has started or a task can be claimed; business completion is decided by later signal/proof.
- `signalMap` hooks do not currently emit `HookReady`; they are used for docked Zhixu output mapping.
