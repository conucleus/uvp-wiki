# Data Flow and Source of Truth

The key design of `uvp-eth` is that on-chain contracts and chain events are the source of truth, while every other layer is a rebuildable view or an operational aid.

## Main Data Flow

```text
compiler artifacts
  -> TrustRegistry attestation
  -> StateMachine plan registration
  -> StateMachine order registration and authorization
  -> participants submit signal
  -> contracts emit events
  -> indexer normalizes events
  -> projection rebuilds orders / tasks / proofs
  -> Product DTOs are consumed by frontend and executor-kit
```

## Must Come from Chain

| State | Source |
| --- | --- |
| Whether a plan is registered | `PlanRegistered`. |
| Whether an order is registered | `OrderRegistered`. |
| Whether a signal was accepted | `SignalSubmitted`. |
| Whether a hook is waiting, ready, or cancelled | `HookStatusChanged` and `HookReady`. |
| Whether a timer was poked | `TimerPoked`. |
| Whether a plan or supplier is trusted | attestation / revocation events from `ZhixuTrustRegistry`. |
| Whether a deployment version is active | cutover events from `UVPDeploymentRegistry`. |

## Can Be Cached, But Must Be Rebuildable

| Data | Rule |
| --- | --- |
| `StateMachineOrderProjection` | Rebuild from state-machine events. |
| `StateMachineTaskProjection` | Rebuild from `HookReady`, authorization, stage overlay, and signal events. |
| Product proof rows | Generate from event provenance. |
| Supplier trust projection | Rebuild from trust registry events. |
| Store catalog state | Metadata may be merged, but chain attestation must come from events. |

## Operational Aids Only

Relayer retry state, notification delivery state, Store drafts, browser E2E fixtures, and local demo fallbacks are only operational aids. They cannot change whether a plan is trusted, whether an order exists, whether a signal was accepted, or whether a hook is ready.

## Reorg Handling

Indexed events include a `removed` flag. `filterActiveChainEvents()` filters out logs removed by a reorg. The event primary key is:

```text
chainId:contractAddress:blockNumber:transactionHash:logIndex
```

This key also goes into Product proof, so users can see “which event on which chain this view came from”.
