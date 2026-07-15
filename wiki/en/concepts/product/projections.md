# Event Projection

Event projection turns chain events into product-readable state. It is a rebuildable view; if the indexer database is deleted, in principle the same projection should be reconstructable from chain events.

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

This key is included in Product proof rows, helping users confirm “which event on which chain this state came from”.

## Order Projection

`StateMachineOrderProjection` includes:

| Field | Meaning |
| --- | --- |
| `orderId` | Order ID. |
| `chainId` | Chain ID. |
| `contractAddress` | State-machine contract address. |
| `deploymentId` | Deployment identifier. |
| `planId` / `planHash` | The plan bound to the order. |
| `status` | Order registration status; it is not derived as a lifecycle from hooks or tasks. |
| `authorizations` | Order-level signal authorization view. |
| `signals` | Accepted signals. |
| `hooks` | Hook status and dueAt. |
| `tasks` | Tasks generated from `HookReady` and related events. |
| `timeline` | Human-readable timeline. |
| `proof` | Verifiable event rows. |

## Event Effects

| Event | Projection effect |
| --- | --- |
| `PlanRegistered` | Create or update the plan proof and attach it to matching orders. |
| `OrderRegistered` | Create the order projection with initial status `registered`. |
| `SignalSubmitterAuthorized` | Save the authorization and mark matching tasks as assignable. |
| `SignalSubmitted` | Save the signal and mark matching tasks as submitted. |
| `StageExecutorPatchApplied` | Save the executor overlay and update the assignee of the target stage task. |
| `StageResourcePatchApplied` | Save the resource overlay. |
| `StageExecutorActivated` | Add executor activation proof. |
| `HookStatusChanged` | Update hook status and `dueAt`; cancel tasks when cancelled. |
| `HookReady` | Create or open a task; the Order remains `registered`. |
| `TimerPoked` | Record timer proof and timeline. |

Task creation is driven by `HookReady`; backend drafts or UI state are only auxiliary workflow.
