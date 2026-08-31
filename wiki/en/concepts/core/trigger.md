---
title: Trigger
type: explanation
audience: 协议读者
preread: ../README.md
status: verified
---

# Trigger

> Prerequisite reading: [Core Concepts](../README.md)
A Trigger turns a ready condition into an actionable task. It is a special hook marker: after some receive hook becomes Ready, that stage's task can open, chain should emit `HookReady`, and only then can Product/Store/executor-kit project it into a task, notification, or adapter job.

On a first pass, read `HookReady` as "this task can be handled now". It does not mean the business is complete; completion must be proven by subsequent authorized `SignalSubmitted` events and evidence fingerprints.

Trigger is the stage entry declaration, coming from the order stage's `trigger` array. Each key must reference `externalSignals` or `receiveSignals`: the former are direct inputs for backend/executor and generate no `HookReady`; the latter compile into hooks and produce `HookReady` when conditions hold. Projections use `hookId` as task/proof identity, so multiple receive trigger keys can form multiple independently auditable tasks. Each Hook uses `~`, `&`, `|`, and explicit duration delays (e.g. `+5s`), validated by the Hook DSL parser/compiler.

`externalSignals` only describe raw external fact names. The backend/executor is responsible for signature verification, deduplication, persistence, and normalization; declaring an `externalSignals` entry does not automatically send a signal to UVP or fire a callback.

```yaml
trigger:
  - START
receiveSignals:
  START: buyer::order.confirm.cmp
```

After compilation, the `START` receive hook carries `isTrigger=true`. If it becomes Ready for the first time, `UVPStateMachine` emits:

```text
HookReady(orderId, hookId, stageId, hookName)
```

## Who Uses It

Nuclei declare triggers on stages; the compiler binds them to hooks and writes them into Plans; Product task creation, Store notification intents, and executor-kit chain watchers all work by following `HookReady`.

## What It Produces

A receive trigger emits one `HookReady` the first time it becomes Ready in the contract (`readyEmitted` guarantees one-shot), which produces claimable task numbers and workflow entries; external triggers only open backend/executor direct input contracts and emit no on-chain events.

## Where Authority Comes From

The trigger binding comes from compiled artifacts and on-chain `StoredHook.isTrigger`; `orderId` comes from the trigger order entry; whether a task truly completes is decided by subsequent signal/proof events.

## Why Trigger Must Be Specified

A stage may have several hooks: some wait for input, some serve signalMap, some cover failure paths or internal conditions. Trigger's job is to promote "condition holds" into "this hook's corresponding task may open or be claimed".

In product terms a Trigger means:

- A Product task can be created or become ready.
- Store can generate contact or notification intents.
- The executor-kit chain watcher can claim or route jobs.
- Adapters can assign external execution numbers, ticket numbers, or linked-Zhixu launch requests.

Numbering boundary: the on-chain `orderId` is created by trigger order entries such as `triggerOrderFromOutsideFor` or `triggerOrderFromSignalFor`. Triggers may also cause Product task IDs, Store docking session IDs, external ticket numbers, or linked-order creation flows; these are workflow numbers — the local order's identity and progression proof still follow the on-chain `orderId`, trigger links, and signal/docking events.

## Compilation and Contract Semantics

The compiler currently requires every name in `stage.trigger` to reference an existing `externalSignals` or `receiveSignals` key of the same stage. Only receive keys bind to Hooks; external keys are direct input entries.

```text
stage.externalSignals.START
  -> backend/executor direct input
  -> no compiled hook / no HookReady

stage.receiveSignals.START
  -> compiled hook isTrigger=true
  -> StoredHook.isTrigger=true
  -> HookStatus Ready
  -> HookReady emitted once
```

The contract keeps a `readyEmitted` marker so a hook's `HookReady` is emitted exactly once. Hooks with `trigger=false` may still become Ready but emit no `HookReady` and should not directly create Product tasks.

## Relation to Docked Zhixu

When a local order's stage is executed by another order, the local stage's Trigger means "this stage can now be handed to the peer order or adapter". The linked order's `str`, `cmp`, `err` are then mapped back into the local order via `signalMap` and an authorized submitter or docking events; docking event semantics are described in [Docked Zhixu Runtime](../state-machine/docking.md).

If Product, registrar, or operator workflows open this docking stage from outside the order, the direct entry should be declared as `externalSignals`. Here `LINK_READY` is the backend/executor's external input contract to open the local stage's docking workflow; it generates no `HookReady` itself:

```yaml
trigger: [LINK_READY]
externalSignals: [LINK_READY]
executor: { supplierType: zhixu, supplierID: "{{ .peer_zhixu_uid }}" }
```

For the full `zhixuExecutorConfig` syntax see [Zhixu as Executor](../apps/zhixu-as-executor.md). To await another order's canonical signal, use empty-header wrappers instead: `::OUTSIDE@(source::task.stage.signal)` (fork an external order), `::MERGE@(source::a.cmp, source::b.cmp)` (multi-source convergence), or `::ANCHOR@(task.stage.signal)` (anchored convergence backflow). Of the three, only `::OUTSIDE@` can create orders on the on-chain track (`UVPStateMachine.triggerOrderFromOutsideFor`); `::MERGE@`/`::ANCHOR@` are cloud-runtime only and rejected at on-chain compile time. `signalMap` interprets linked-order output and does not emit `HookReady` by itself.

```text
local stage trigger Ready
  -> Store/Product starts the docking workflow
  -> linked order executes
  -> linked order proof validated
  -> submitDockedSignal or authorized submitter submits mapped signal into the local order
```

Every cross-order advancement returns to on-chain signals, proof, and replayable events.

## Boundary Checklist

- Trigger is a hook marker compiled into the HookPlan and contracts, not a manual UI button.
- On-chain orderId comes from trigger order entries.
- Trigger Ready usually means a task is claimable or handleable; business completion follows later signal/proof.
- `signalMap` hooks currently do not fire `HookReady`; they map docked Zhixu outputs.
