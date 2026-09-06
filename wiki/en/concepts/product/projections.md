---
title: Event Projections
type: reference
audience: 服务工程师
preread: ../services/indexer-projections.md
status: verified
---

# Event Projections

> Prerequisite reading: [Indexer and Projections](../services/indexer-projections.md)
Event projections turn on-chain events into product-readable state. They are rebuildable views; if the indexer database is deleted, the same projection should in principle be reconstructable from chain events.

## ChainEvent

Every indexed event carries provenance:

```text
chainId
contractAddress
blockNumber
transactionHash
logIndex
eventName
args
removed
```

Event key:

```text
chainId:contractAddress:blockNumber:transactionHash:logIndex
```

This key enters Product proof rows, helping users confirm "which event, on which chain, this state came from".

## Order projection

`StateMachineOrderProjection` includes:

| Field | Meaning |
| --- | --- |
| `orderId` | Order ID. |
| `chainId` | Chain ID. |
| `contractAddress` | State-machine contract address. |
| `deploymentId` | Deployment identifier. |
| `planId` / `planHash` | The plan bound to the order. |
| `status` | Order registration status; no lifecycle is derived from hooks/tasks. |
| `authorizations` | Order-level signal authorization view. |
| `signals` | Accepted signals. |
| `hooks` | Hook status and dueAt. |
| `tasks` | Tasks generated from `HookReady` and similar events. |
| `timeline` | Human-readable timeline. |
| `proof` | Verifiable event rows. |

## Event effects

| Event | Projection effect |
| --- | --- |
| `PlanRegistered` | Create or update plan proof and attach it to matching orders. |
| `OrderRegistered` | Create the order projection with initial status registered. |
| `SignalSubmitterAuthorized` | Save the authorization and mark matching tasks assignable. |
| `SignalSubmitted` | Save the signal and mark matching tasks submitted. |
| `StageExecutorPatchApplied` | Save the executor overlay and update the target stage task's assignee. |
| `StageResourcePatchApplied` | Save the resource overlay. |
| `StageExecutorActivated` | Add executor activation proof. |
| `HookStatusChanged` | Update hook status and `dueAt`; cancel tasks when cancelled. |
| `HookReady` | Create or open a task; the Order stays registered. |
| `TimerPoked` | Record timer proof and timeline. |

Task creation is driven by `HookReady`; backend drafts or UI state are auxiliary workflow only.

## Related pages

- [Indexer and projections](../services/indexer-projections.md): how the indexer builds these projections from chain events.
- [Data flow and source of truth](../data-flow-and-truth.md): where projections sit in the overall data flow and their truth boundaries.
