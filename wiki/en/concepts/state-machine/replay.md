---
title: Event Replay
type: explanation
audience: 工程贡献者
status: verified
---

# Event Replay

`uvp-protocol/packages/statemachine` provides a platform-neutral reference reducer. It replays order state from chain events and verifies whether contract events and local semantics agree.

## Input Events

Chain events are mapped into inputs the reducer understands:

| Chain event | Reducer event |
| --- | --- |
| `PlanRegistered` | `PlanRegistered` |
| `OrderRegistered` | `OrderRegistered` |
| `SignalSubmitted` | `SignalReceived` |
| `TimerPoked` | `TimerDue` |

`HookStatusChanged` and `HookReady` are not written into the reducer directly as state sources. They are treated as observed contract outputs, compared against what the reference reducer derives.

## Reducer State

The hook states used by the reference runtime (aligned with the on-chain oracle):

| State | Meaning |
| --- | --- |
| `init` | Initial. |
| `wait` | Waiting for dependencies or a timer. |
| `ready` | The hook is ready. |
| `cxl` | Cancelled. |

## Why Replay Is Needed

Replay solves three problems:

- After a contract upgrade or compiler change, confirm that the same event sequence still produces the expected state.
- When the indexer database is corrupted or migrated, projections can be rebuilt from chain events.
- Product proof can trace the order state a user sees back to the exact events.

## First Writer Wins

The reference reducer also applies first-writer-wins by signal key. A duplicate signal should not change state. That keeps it aligned with the contract semantics of `_signals[orderId][signalKey]`.

## Projection and Authority

The Chain Services projection rebuilds signal truth and hook truth from the same event stream; the indexer database can be dropped and rebuilt at any time. The chain replay oracle validates event semantics only — the ETH runtime authority is the deployed contract. Whenever the local model, reducer, or projection disagrees with actual contract behavior, the contract wins and the model is corrected.

For the stable event list, see [Contracts and Events](../../reference/contracts-and-events.md).
