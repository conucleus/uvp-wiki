---
title: Data Flow and Source of Truth
type: explanation
audience: 工程贡献者
status: verified
---

# Data Flow and Source of Truth

The key design of `uvp-eth` is that on-chain contracts and chain events are the source of truth; every other layer is a rebuildable view or an operational aid.

## Main Data Flow

The main data flow advances along "compiled artifacts -> Plan registration -> order registration and authorization -> participants submit signals -> contract events -> indexer normalization -> projection rebuild -> Product DTO". For the full flow diagram, see [Architecture](architecture.md).

## Must Come from Chain

| State | Source |
| --- | --- |
| Whether a plan is registered | `PlanRegistered`. |
| Whether an order is registered | `OrderRegistered`. |
| Whether a signal was accepted | `SignalSubmitted`. |
| Whether a hook is waiting, ready, or cancelled | `HookStatusChanged` and `HookReady`. |
| Whether a timer was poked | `TimerPoked`. |
| Whether a Plan is usable | The publisher signature plus `PlanCommitted` / `PlanFinalized`. |
| Which real-world subject a wallet maps to | `UVPIdentityRegistry` binding/revocation events; capability judgment remains with Store. |
| Whether a deployment version is active | `UVPDeploymentRegistry` cutover events. |
| Whether the stage executor overlay was applied | Stage Patch Module's `StageExecutorPatchApplied` and the StateMachine's `StageExecutorActivated`. |
| Whether the stage resource manifest was updated | `StageResourcePatchApplied`. |
| Whether a linked Zhixu relationship exists | Docking Module's `DockedOrderLinked`. |
| Whether docked signals were mapped and submitted | `DockedSignalMapped` / `DockedSignalSubmitted`. |

## Cacheable but Must Be Rebuildable

| Data | Rule |
| --- | --- |
| `StateMachineOrderProjection` | Rebuilt from state-machine events. |
| `StateMachineTaskProjection` | Rebuilt from `HookReady`, authorizations, stage overlays, and signal events. |
| Product proof rows | Generated from event provenance. |
| Supplier identity projection | Rebuilt from Identity Registry events. |
| Stage patch and docking projections | Rebuilt from the `StageExecutorPatchApplied`, `StageResourcePatchApplied`, `DockedOrderLinked`, `DockedSignalMapped`, and `DockedSignalSubmitted` event families. |
| Store catalog state | May merge metadata; Plan publication and identity-binding status must come from chain events. |

## Operational Aids Only

Relayer retry status, notification delivery status, Store drafts, browser E2E fixtures, and local demo data are operational aids only. They cannot change Plan publication state, whether an Order exists, whether a Signal was accepted, or whether a Hook is ready.

## Reorg Handling

Indexer events carry a `removed` flag. `filterActiveChainEvents()` filters out logs removed by a reorg. Event primary keys use:

```text
chainId:contractAddress:blockNumber:transactionHash:logIndex
```

This key also enters Product proofs, telling users "which event on which chain this view came from".
