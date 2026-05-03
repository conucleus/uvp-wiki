# State Machine

The on-chain implementation of the state machine is `UVPStateMachine.sol`. It receives signal submissions from authorized wallets, looks up the affected hooks through the plan’s dependency index, evaluates them with a stack machine, and then emits `HookStatusChanged`, `HookReady`, or timer-related events.

```text
SignalSubmitted(orderId, sourceId, signalId)
  -> signalKey(orderId, sourceId, signalId)
  -> plan.dependencyIndex[signalKey]
  -> evaluate affected hooks
  -> HookStatusChanged / HookReady
```

## Subpages

| Subpage | Description |
| --- | --- |
| [Hook Evaluation](state-machine/evaluation.md) | How `SIGNAL`, `NOT`, `AND`, `OR`, and `DELAY` are evaluated in the contract. |
| [Timers and Status](state-machine/timers-and-status.md) | Hook status, `dueAt`, `pokeTimer()`, and one-time `HookReady`. |
| [Stage Overlay](state-machine/stage-overlay.md) | How executor / resource patches overlay a plan at order level. |
| [Event Replay](state-machine/replay.md) | How the reference reducer recomputes state from chain events and checks the contract output. |

## What the Contract Stores

| Data | Meaning |
| --- | --- |
| `Plan` | The `planHash`, hooks, dependency index, and selector bindings of a registered plan. |
| `Order` | The order instance for a specific plan, including the creator and hook runtime. |
| `SignalRecord` | The first submission record for a given `signalKey` inside a specific order. |
| `StoredSignalAuthorization` | Which address may submit which source / signal for an order. |
| `HookRuntime` | The hook’s current status, waiting deadline, and whether `HookReady` has already been emitted. |
| stage overlay | Order-level executor / resource patches that do not modify the plan itself. |

## State Machine Boundary

The state machine only validates on-chain boundaries for plan, order, signal, hook, patch, and authorization. The following are handled by Store, Product API, executor-kit, or periphery adapters:

- whether a supplier has been operationally reviewed in Store;
- whether supplier capability tags match a certain industry;
- plaintext evidence storage;
- payment, custody, guarantee, or settlement;
- UI task copy;
- relayer retry databases;
- executor internal workflows.

These can connect to the state machine through signals, metadata hashes, resource handles, adapter proofs, or Product DTOs.
