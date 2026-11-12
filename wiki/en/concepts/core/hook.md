---
title: Hook
type: explanation
audience: 协议读者
preread: ../README.md
status: verified
---

# Hook

> Prerequisite reading: [Core Concepts](../README.md)
A Hook is the smallest rule by which the state machine decides "whether a stage condition holds". It is not an HTTP webhook or an external-system callback; it is a state-machine condition over an Order's fact set. Each entry of a Zhixu stage's `receiveSignals` compiles into one `kind=receive` hook; a birth signal (a `sendSignals` entry with `trigger: true`) also synthesizes one order-trigger hook (same `kind=receive`, `orderTriggerKind: trigger`). Dock stages produce no extra pseudo-hooks — their receive hooks carry the dock executor flag, and cross-order emission conditions are declared by a separate `kind: Dock` document.

A Hook is only a condition. When a hook with `emitReady=true` becomes Ready, the chain emits `HookReady`; `orderTriggerKind` states whether that Ready lands on a birth entry. Product/Store should project only confirmed `HookReady` events as formally executable tasks.

## Who Uses It

Nuclei declare in-order hook conditions in stage `receiveSignals` and birth signals / emission admissions on `sendSignals` entries; the compiler normalizes both into the Plan; the state machine evaluates them over order facts; Product/Store/uvp-client follow `HookReady` to create tasks and notifications. A birth signal is admitted in the empty-order context, then creates the order and is written as its first fact.

## What It Produces

Hook evaluation produces `HookStatusChanged` transitions; the first time a hook with `emitReady=true` becomes Ready it emits `HookReady`, which is the projection basis for Product tasks, Store intents, and adapter jobs. `orderTriggerKind` is the closed set `none` and `trigger`: ordinary receive hooks are `none`, birth hooks are `trigger`; dock stages are distinguished by the `dockExecutor` flag rather than a new kind. The compiled artifact's `triggers[]` enumerates every `trigger` order-trigger hook.

## Where Authority Comes From

The authoritative form of hook conditions is on-chain `UVPStateMachine.StoredHook` (fixed by Plan registration); the expressions and AST descriptions on this page follow the hook-core parser and compiler implementation, and UI display is only a read model.

## Hook Expressions

Normal Hook expressions use the `source::condition` form. The parser requires both a source and a condition; Hook conditions are evaluated only over the current order's fact set. Cross-order facts do not turn a Hook into a cross-order subscription: the B side declares emission conditions with a static Dock, and runtime binding/poke writes satisfied B outputs as in-order facts which the hook then consumes:

```text
source::condition
```

For example:

```text
buyer::(pay.cmp +5s) & ~pay.refund
```

This means: after the `pay.cmp` signal from `buyer` appears, wait 5 seconds; within that judgment window, if `pay.refund` has not yet appeared, the condition holds.

`~A` in a Hook expression is absence judgment under existence logic. It means "the A signal has not yet appeared in the current order's fact set". Once a signal is authorized and submitted into the order it becomes a replayable event that cannot disappear or revert to not-having-appeared in later judgments. So `~pay.refund` means "the refund signal has not been emitted"; if the refund signal has appeared, any branch depending on its absence gets cancelled.

## Supported AST Nodes

The parsed node types are exactly these:

| Node | Meaning |
| --- | --- |
| `signal` | Waits for some `stage.signal` to appear. |
| `not` | Absence condition: some signal has not appeared; if it later appears, branches depending on the absence are cancelled. |
| `and` | All conditions satisfied. |
| `or` | Any branch satisfied. |
| `delay` | Wait for some duration after a positive anchor appears (positive integer durations, capped at 30 days). |

The parser rejects conditions without positive anchors and rejects `OR` branches without positive anchors. A pure-absence condition like `buyer::~cancel.cmp` cannot become a hook, because the state machine needs a positive event first to know from when to judge "not yet appeared".

## What Is Stored in the HookPlan

The compiler generates one `kind=receive` hook per `receiveSignals`; each `sendSignals` entry with `trigger: true` synthesizes one order-trigger hook (single `SIGNAL` instruction, `emitReady=true`, `orderTriggerKind: trigger`); `validWhen` declarations compile into standalone admission entries (flag 8). A dock stage's receive hooks carry the `HOOK_FLAG_DOCK_EXECUTOR` (flag 16) marker; the executor is selected at runtime and no birth hook is generated.

A readable hook typically contains:

| Field | Meaning |
| --- | --- |
| `hookId` | Platform-neutral string shaped like `stageIdentifier#hookName`. |
| `kind` | `receive`; admission entries are `admission`. |
| `stageIdentifier` | Which stage this hook belongs to. |
| `hookName` | Hook name, from a `receiveSignals` key; a synthesized birth hook uses the signal name. |
| `orderTriggerKind` | `none` or `trigger`; states whether Ready lands on a birth entry. |
| `emitReady` | Whether Ready emits `HookReady`. |
| `dockExecutor` | Whether the hook belongs to a dock stage (flag 16). |
| `rawExpression` | Original expression. |
| `normalizedExpression` | Expression normalized by the compiler. |
| `ast` | The hook condition AST. |
| `dependencies` | Dependent source/signal/timer entries. |
| `route` | Off-chain routing metadata (executor route reference); not in the on-chain runtime planHash. |

## Ready and Order Entry

Only hooks with `emitReady=true` emit `HookReady` the first time they become `Ready` in the contract; `orderTriggerKind` is `none` or `trigger`. Product task creation, Store notifications, and uvp-client watchers all follow `HookReady`; UI drafts or temporary backend state serve display only.

For birth-entry semantics see [Trigger](trigger.md).

## Hooks and the On-chain Plan

A Hook is one condition; the on-chain plan artifact is the set of all hooks, admissions, dependency indexes, executor routes, and selector bindings compiled from one Zhixu, plus the derived `triggers[]` read surface enumerating every order-trigger hook's birth fact.

```text
Zhixu stage.receiveSignals
  -> Hook
  -> OnchainHookPlanArtifact
  -> UVPStateMachine.StoredHook
```

Ordinary users never read the on-chain artifact directly. Product DTO translates it into "when tasks appear, who can submit, what evidence is needed, where proof lives".
