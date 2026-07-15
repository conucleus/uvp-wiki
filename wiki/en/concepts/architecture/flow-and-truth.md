# Data Flow and Source of Truth

The key design of `uvp-eth` is that on-chain contracts and chain events are the source of truth, while every other layer is a rebuildable view or an operational aid.

## Main Data Flow

```text
compiler artifacts
  -> StateMachine Plan commit and publication
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
| Whether a Plan is usable | publisher signature plus `PlanCommitted` / `PlanFinalized`. |
| Which real-world subject an account represents | Identity Registry binding/revocation; capability remains a Store judgment. |
| Whether a deployment version is active | cutover events from `UVPDeploymentRegistry`. |

## Can Be Cached, But Must Be Rebuildable

| Data | Rule |
| --- | --- |
| `StateMachineOrderProjection` | Rebuild from state-machine events. |
| `StateMachineTaskProjection` | Rebuild from `HookReady`, authorization, stage overlay, and signal events. |
| Product proof rows | Generate from event provenance. |
| supplier identity projection | Rebuild from Identity Registry events. |
| Store catalog state | Metadata may be merged; Plan publication and identity binding status must come from chain events. |

## Operational Aids Only

Relayer retry state, notification delivery state, Store drafts, browser E2E fixtures, and local demo data are operational aids. They cannot change Plan publication state, Order existence, Signal acceptance, or Hook readiness.

## Reorg Handling

Indexed events include a `removed` flag. `filterActiveChainEvents()` filters out logs removed by a reorg. The event primary key is:

```text
chainId:contractAddress:blockNumber:transactionHash:logIndex
```

This key also goes into Product proof, so users can see “which event on which chain this view came from”.
