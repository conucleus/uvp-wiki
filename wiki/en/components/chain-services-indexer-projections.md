# Indexer and Projections

The indexer is the replay entry point of the rebuildable service layer. It reads events from `UVPDeploymentRegistry`, `UVPStateMachine`, and `UVPIdentityRegistry`, normalizes logs, and projects Product, Store, executor-kit, and ops views.

It is responsible for replaying facts and building read models. The projection database lets the UI query orders, tasks, proofs, and trust quickly; if the database is wiped, it must be possible to rebuild it from the configured deployment block.

## Code Entry Points

| File | Responsibility |
| --- | --- |
| `src/indexer/viem-event-source.ts` | reads contract logs from EVM RPC and preserves chain id, contract address, block, tx, and log index. |
| `src/indexer/events.ts` | normalizes raw contract logs into `ChainEvent`, including state-machine, Identity Registry, and deployment registry events. |
| `src/indexer/service.ts` | indexer runtime entry point, supporting normal sync and `rebuild:indexer`. |
| `src/indexer/projections.ts` | rebuilds order, task, timeline, and proof projections from state-machine events. |
| `src/indexer/identity-projections.ts` | rebuilds plan/supplier identity projections from Identity Registry events. |
| `src/storage/projection-store.ts` | projection store contract, implemented by memory/SQLite/PostgreSQL backends. |

## Input Events

The indexer must handle at least three sources:

| Source | Representative events | Projection purpose |
| --- | --- | --- |
| `UVPDeploymentRegistry` | active deployment / cutover events. | Know the current state-machine address, deployment version, and release context. |
| `UVPStateMachine` | `OrderRegistered`, `SignalSubmitted`, `HookStatusChanged`, `HookReady`, `TimerPoked`, stage/resource patch events. | Rebuild orders, tasks, status, timeline, and proof rows. |
| `UVPIdentityRegistry` | `IdentityBindingRegistered`, `IdentityBindingRevoked`. | Rebuild subject/account identity and revocation history; never filter Plans or capability. |

## Output Projections

| Projection | Consumers | Notes |
| --- | --- | --- |
| order projection | Product API, Store order search. | Must include `chainId`, `stateMachineAddress`, and `deploymentId`. |
| task projection | Order App, executor-kit, Product `/me/tasks`. | Comes from hook readiness and submitter authorization, not from manual backend assignment. |
| timeline projection | Product proof, Store runtime proof. | Every row must be traceable back to a tx/block/event. |
| proof projection | UI proof drawer, audit, release evidence. | Store event proof, not plaintext evidence. |
| identity projection | Store catalog, Product catalog, supplier directory. | Revoked entries remain shown as revoked/blocked. |
| sync status | readiness, diagnostics, reconcile. | Exposes finality/reorg/sync lag, and keeps syncing states pending. |

## Order ID Resolution

The same `orderId` can appear in different `UVPStateMachine` deployments. Therefore the projection key must include contract context. The service may accept a bare id when it is unique; if multiple candidates exist, the API should return ambiguous candidates.

```text
projection key = chainId + stateMachineAddress + orderId
```

## Relation to statemachine replay

`uvp-protocol/packages/statemachine/` provides the reference reducer and replay tests to prove that state-machine semantics have not drifted. The Chain Services indexer builds product projections from real chain events. Both work after chain facts have been established, while the contract remains the source of runtime decisions.

## Boundary

- Business completion comes from signal/proof, not from database state.
- Order/task come from state-machine events, not from Store metadata.
- When reorg/finality is not confirmed, the state must remain pending or syncing.
- identity projections and Store review use different fields.
- Preserve contract context; Product DTOs may simplify language, but proof fields must still map back to chain events.
