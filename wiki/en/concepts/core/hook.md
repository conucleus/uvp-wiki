---
title: Hook
type: explanation
audience: 协议读者
preread: README.md
status: verified
---

# Hook

A Hook is the smallest rule by which the state machine decides "whether a stage condition holds". It is not an HTTP webhook or an external-system callback; it is a state-machine condition over an Order's event set. Each entry of a Zhixu stage's `receiveSignals` usually compiles into one `kind=receive` hook; if the stage docks with another Zhixu, `signalMap` also compiles into `kind=signalMap` hooks.

A Hook is only a condition. Only when a hook marked as a [Trigger](trigger.md) becomes Ready does chain emit `HookReady`, and only then should Product/Store project it as a formally executable task.

## Who Uses It

Nuclei declare hook conditions in stage `receiveSignals`; the compiler normalizes them into the Plan; the state machine evaluates them over order events; Product/Store/executor-kit follow `HookReady` to create tasks and notifications.

## What It Produces

Hook evaluation produces `HookStatusChanged` transitions; the first time a hook with `isTrigger=true` becomes Ready it emits `HookReady`, which is the projection basis for Product tasks, Store intents, and adapter jobs.

## Where Authority Comes From

The authoritative form of hook conditions is on-chain `UVPStateMachine.StoredHook` (fixed by Plan registration); the expressions and AST descriptions on this page follow the hook-core parser and compiler implementation, and UI display is only a read model.

## Hook Expressions

Hook expressions use the `source::condition` form. `parseHookExpression()` requires both a source and a condition; the only exceptions are cross-source entry wrappers, which must use an empty header (`::OUTSIDE@(...)`, `::MERGE@(...)`, `::ANCHOR@(task.stage.signal)`):

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
| `external` | The `::OUTSIDE@(...)` fork entry: driven by target-source signal events, the runtime derives independent orders for it. |
| `merge` | The `::MERGE@(source::a.cmp, ...)` multi-source observation entry: events are delivered lane by lane and aggregation is adjudicated by the state machine; core evaluation always returns `needs_more`. Rejected at on-chain HookPlan compile time (`MERGE@`/`ANCHOR@` delivery exists only in cloud runtime); see [Hook Evaluation](../state-machine/evaluation.md). |
| `anchor` | The `::ANCHOR@(task.stage.signal)` anchored convergence entry: child-order backflow is delivered event by event along lineage, and the target must be a bare three-segment signal. Rejected at on-chain HookPlan compile time (`MERGE@`/`ANCHOR@` delivery exists only in cloud runtime); see [Hook Evaluation](../state-machine/evaluation.md). |
| `not` | Absence condition: some signal has not appeared; if it later appears, branches depending on the absence are cancelled. |
| `and` | All conditions satisfied. |
| `or` | Any branch satisfied. |
| `delay` | Wait for some duration after a positive anchor appears (positive integer durations, capped at 30 days). |

The parser rejects conditions without positive anchors and rejects `OR` branches without positive anchors. A pure-absence condition like `buyer::~task.cancel.cmp` cannot become a hook, because the state machine needs a positive event first to know from when to judge "not yet appeared".

## What Is Stored in the HookPlan

The compiler generates one hook per `receiveSignals`; a stage's `externalSignals` remain backend/executor input contracts and produce no hooks. If the executor is `supplierType=zhixu`, extra hooks are generated for `signalMap`. In the current implementation, `signalMap` hooks have `trigger=false`: they explain the output relation of docked Zhixu and do not directly become Product tasks.

A readable hook typically contains:

| Field | Meaning |
| --- | --- |
| `hookId` | Platform-neutral string shaped like `stageIdentifier#hookName`. |
| `kind` | `receive` or `signalMap`. |
| `stageIdentifier` | Which stage this hook belongs to. |
| `hookName` | Hook name, often from a receive signal or signal map. |
| `isTrigger` | Whether Ready emits `HookReady`. |
| `rawExpression` | Original expression. |
| `normalizedExpression` | Expression normalized by the compiler. |
| `ast` | The hook condition AST. |
| `dependencies` | Dependent source/signal/timer entries. |
| `route` | Executor or dispatch routing info. |

## What Trigger Means

Only hooks with `isTrigger=true` emit `HookReady` the first time they become `Ready` in the contract. Product task creation, Store notifications, and executor-kit watchers all follow `HookReady`; UI drafts or temporary backend state serve display only.

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
