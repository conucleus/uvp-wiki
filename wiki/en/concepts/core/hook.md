# Hook

A Hook is the smallest rule used by the state machine to decide whether a stage condition has been satisfied. Each item in a Zhixu stage’s `receiveSignals` usually compiles into a `kind=receive` hook; if a stage docks with another Zhixu, `signalMap` also compiles into `kind=signalMap` hooks.

A Hook is only a condition. The chain emits `HookReady` only when a hook marked as a [Trigger](trigger.md) becomes ready, and Product/Store should then project it as a formally executable task.

## Hook Expressions

Hook expressions use the `source::condition` form. `parseHookExpression()` requires both a source and a condition:

```text
source::condition
```

For example:

```text
buyer::(task.pay.cmp +5s) & ~task.pay.refund
```

This means: wait 5 seconds after the `task.pay.cmp` signal appears from `buyer`; within that window, if `task.pay.refund` has not appeared yet, the condition is satisfied.

In a hook expression, `~A` is an absence check under monotonic existence logic. It means “A signal has not yet appeared in the current Order event set.” Once a signal is authorized and submitted into the Order, it becomes a replayable event and cannot later disappear or become not-yet-seen again. Therefore, `~task.pay.refund` means “the refund signal has not been emitted yet”; if the refund signal has already appeared, the branch depending on that absence is cancelled.

## Supported AST Nodes

After parsing, only these node types exist:

| Node | Meaning |
| --- | --- |
| `signal` | Wait for a specific `task.stage.signal` to appear. |
| `external` | A placeholder for an external condition that must be interpreted by an adapter or later implementation. |
| `not` | An absence condition, meaning a signal has not appeared yet; if it appears later, the branch depending on that absence is cancelled. |
| `and` | All conditions must be satisfied. |
| `or` | Any branch may be satisfied. |
| `delay` | Wait for a period of time after a positive anchor appears. |

The parser rejects conditions without a positive anchor and also rejects branches inside `OR` that lack a positive anchor. A pure absence condition such as `buyer::~task.cancel.cmp` cannot become a hook, because the state machine needs an initial positive event in order to know when to start checking for “not yet appeared.”

## What Is Stored in HookPlan

The compiler generates one hook for each `receiveSignals` entry; if the executor is `supplierType=zhixu`, it also generates extra hooks for `signalMap`. In the current implementation, `signalMap` hooks have `trigger=false`; they are used to interpret output relationships for docked Zhixu and do not directly become Product tasks.

Readable hook data usually includes:

| Field | Meaning |
| --- | --- |
| `hookId` | Platform-neutral string, such as `stageIdentifier#hookName`. |
| `kind` | `receive` or `signalMap`. |
| `stageIdentifier` | Which stage this hook belongs to. |
| `hookName` | Hook name, usually derived from the receive signal or signal map. |
| `trigger` | Whether `HookReady` is emitted when it becomes ready. |
| `rawExpression` | The original expression. |
| `normalizedExpression` | The expression normalized by the compiler. |
| `ast` | The hook condition AST. |
| `dependencies` | Dependent source/signal/timer items. |
| `route` | Executor or dispatch routing information. |

## What Trigger Means

Only hooks with `trigger=true` emit `HookReady` the first time they become `Ready` in the contract. Product task creation, Store notifications, and executor-kit watchers should all follow `HookReady`; UI drafts or temporary backend state are only for assistive display.

See [Trigger](trigger.md) for the detailed semantics.

## Relationship Between Hook and HookPlan

A Hook is one condition; a HookPlan is the full collection of hooks, dependency indexes, executor routes, and selector bindings after a Zhixu is compiled.

```text
Zhixu stage.receiveSignals
  -> Hook
  -> HookPlanArtifact
  -> OnchainHookPlanArtifact
  -> UVPStateMachine.StoredHook
```

Ordinary users should not read HookPlan directly. HookPlan is engineering and audit material; Product DTOs should translate it into “when tasks appear, who can submit, what evidence is required, and where the proof lives.”
