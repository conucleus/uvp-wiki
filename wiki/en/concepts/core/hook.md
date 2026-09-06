---
title: Hook
type: explanation
audience: 协议读者
preread: ../README.md
status: verified
---

# Hook

> Prerequisite reading: [Core Concepts](../README.md)
A Hook is the smallest rule by which the state machine decides "whether a stage condition holds". It is not an HTTP webhook or an external-system callback; it is a state-machine condition over an Order's event set. Each entry of a Zhixu stage's `receiveSignals` compiles into one `kind=receive` hook; if the stage docks with another Zhixu, `inputMap`/`signalMap` are committed as dock route/interface data rather than extra pseudo-hooks.

A Hook is only a condition. When a hook with `emitReady=true` becomes Ready, the chain emits `HookReady`; `orderTriggerKind` further states whether that Ready opens a mint or dock entry. Product/Store should project only confirmed `HookReady` events as formally executable tasks.

## Who Uses It

Nuclei declare hook conditions in stage `receiveSignals`; the compiler normalizes them into the Plan; the state machine evaluates them over order events; Product/Store/executor-kit follow `HookReady` to create tasks and notifications. Cross-source facts enter the routing layer through `::ANCHOR(@source::task.stage.signal)`, while `mint: per-fact` determines whether each fact derives an order.

## What It Produces

Hook evaluation produces `HookStatusChanged` transitions; the first time a hook with `emitReady=true` becomes Ready it emits `HookReady`, which is the projection basis for Product tasks, Store intents, and adapter jobs. `orderTriggerKind` is `none`, `mint`, or `dock`.

## Where Authority Comes From

The authoritative form of hook conditions is on-chain `UVPStateMachine.StoredHook` (fixed by Plan registration); the expressions and AST descriptions on this page follow the hook-core parser and compiler implementation, and UI display is only a read model.

## Hook Expressions

Normal Hook expressions use the `source::condition` form. `parseHookExpression()` requires both a source and a condition; cross-source subscriptions use the empty-header `::ANCHOR(@source::task.stage.signal)` form:

```text
source::condition
```

For example:

```text
buyer::(task.pay.cmp +5s) & ~task.pay.refund
```

This means: after the `task.pay.cmp` signal from `buyer` appears, wait 5 seconds; within that judgment window, if `task.pay.refund` has not yet appeared, the condition holds.

`~A` in a Hook expression is absence judgment under existence logic. It means "the A signal has not yet appeared in the current order's event set". Once a signal is authorized and submitted into the order it becomes a replayable event that cannot disappear or revert to not-having-appeared in later judgments. So `~task.pay.refund` means "the refund signal has not been emitted"; if the refund signal has appeared, any branch depending on its absence gets cancelled.

## Supported AST Nodes

The parsed node types are exactly these:

| Node | Meaning |
| --- | --- |
| `signal` | Waits for some `task.stage.signal` to appear. |
| `subscription` | The `::ANCHOR(@source::task.stage.signal)` cross-source fact subscription, routed event by event by source class; `mint: per-fact` determines whether each fact derives an order. |
| `not` | Absence condition: some signal has not appeared; if it later appears, branches depending on the absence are cancelled. |
| `and` | All conditions satisfied. |
| `or` | Any branch satisfied. |
| `delay` | Wait for some duration after a positive anchor appears (positive integer durations, capped at 30 days). |

The parser rejects conditions without positive anchors and rejects `OR` branches without positive anchors. A pure-absence condition like `buyer::~task.cancel.cmp` cannot become a hook, because the state machine needs a positive event first to know from when to judge "not yet appeared".

## What Is Stored in the HookPlan

The compiler generates one `kind=receive` hook per `receiveSignals`; there are no stage-level `trigger` or `externalSignals` fields. For `supplierType=zhixu`, `inputMap`/`signalMap` describe target dock ports and cannot carry Hook DSL; they are committed as dock route/interface roots and do not generate pseudo-`signalMap` hooks.

A readable hook typically contains:

| Field | Meaning |
| --- | --- |
| `hookId` | Platform-neutral string shaped like `stageIdentifier#hookName`. |
| `kind` | Currently `receive`; dock input/output mappings are route/interface commitments. |
| `stageIdentifier` | Which stage this hook belongs to. |
| `hookName` | Hook name, often from a receive signal or signal map. |
| `orderTriggerKind` | `none`, `mint`, or `dock`; states whether Ready opens a mint or dock entry. |
| `emitReady` | Whether Ready emits `HookReady`. |
| `rawExpression` | Original expression. |
| `normalizedExpression` | Expression normalized by the compiler. |
| `ast` | The hook condition AST. |
| `dependencies` | Dependent source/signal/timer entries. |
| `route` | Executor or dispatch routing info. |

## Ready and Order Entry

Only hooks with `emitReady=true` emit `HookReady` the first time they become `Ready` in the contract. `orderTriggerKind` is `none`, `mint`, or `dock`. Product task creation, Store notifications, and executor-kit watchers all follow `HookReady`; UI drafts or temporary backend state serve display only.

For detailed semantics see [Trigger](trigger.md).

## Hooks and the On-chain Plan

A Hook is one condition; the on-chain plan artifact is the set of all hooks, dependency indexes, executor routes, and selector bindings compiled from one Zhixu.

```text
Zhixu stage.receiveSignals
  -> Hook
  -> OnchainHookPlanArtifact
  -> UVPStateMachine.StoredHook
```

Ordinary users never read the on-chain artifact directly. Product DTO translates it into "when tasks appear, who can submit, what evidence is needed, where proof lives".
