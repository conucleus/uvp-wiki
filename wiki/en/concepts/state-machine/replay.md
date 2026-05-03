# Event Replay

`uvp-protocol/packages/statemachine` provides a platform-neutral reference reducer. Its goal is not to replace the contract, but to replay order state from chain events and verify whether the contract output matches the local semantics.

## Input Events

Chain events are mapped into reducer events that the reducer understands:

| Chain event | Reducer event |
| --- | --- |
| `PlanRegistered` | `PlanRegistered` |
| `OrderRegistered` | `OrderRegistered` |
| `SignalSubmitted` | `SignalReceived` |
| `TimerPoked` | `TimerDue` |

`HookStatusChanged` and `HookReady` are not written into the reducer directly as state sources. They are treated as contract output observations and are compared against the state derived by the reference reducer.

## Reducer State

The states used by the reference runtime are:

| State | Meaning |
| --- | --- |
| `init` | Initial. |
| `wait` | Waiting for dependencies or a timer. |
| `reg` | The hook is ready. |
| `dispatched` | Execution has been dispatched. |
| `fail` | Execution failed. |
| `cxl` | Cancelled. |

## Why Replay Is Needed

Replay solves three problems:

- After a contract upgrade or compiler change, confirm that the same event sequence still produces the expected state.
- When the indexer database is corrupted or migrated, rebuild projections from chain events.
- Product proof can trace the order state a user sees back to the exact events.

## First Writer Wins

The reference reducer also applies first-writer-wins by signal key. A duplicate signal should not change state. That keeps it aligned with the contract semantics of `_signals[orderId][signalKey]`.
