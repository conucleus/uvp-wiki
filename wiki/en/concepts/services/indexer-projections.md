---
title: Indexer and Projections
type: reference
audience: 工程贡献者
status: verified
---

# Indexer and Projections

The indexer is the replay entry point of the rebuildable service layer. It reads `UVPDeploymentRegistry`, `UVPStateMachine`, and `UVPIdentityRegistry` events from chain, normalizes logs into internal service events, and projects views that Product, Store, uvp-client, and ops can query.

It is responsible for replaying facts and building read models. The projection database lets the UI quickly query orders, tasks, proof, and trust; after the database is wiped it must be rebuildable from the configured deployment block.

## Code Entry Points

| File | Responsibility |
| --- | --- |
| `src/indexer/viem-event-source.ts` | Reads contract logs from EVM RPC and preserves chain id, contract address, block, tx, and log index. |
| `src/indexer/events.ts` | Normalizes raw contract logs into `ChainEvent`, including state-machine, Identity Registry, and deployment registry events. |
| `src/indexer/service.ts` | Indexer runtime entry point, supporting normal sync and `rebuild:indexer`. |
| `src/indexer/replay.ts` | Unified event ordering and replay orchestration; `rebuildOrderProjections` is the single projection-rebuild entry. |
| `src/indexer/projections/` | Per-object projection rebuild files: `order.ts`, `signal.ts`, `stage.ts`, `stage-files.ts`, `dock.ts`, `plan.ts`, `proof.ts`, `snapshot.ts`, `task.ts`. |
| `src/projection/plan-artifacts.ts`, `dock-artifacts.ts` | Postgres stores and index resolvers for the compiled-plan and Dock artifact tables; a missing artifact fails closed. |
| `src/cli/record-plan-artifact.ts`, `record-dock-artifact.ts` | Production write entries for `plan_artifacts` / `dock_artifacts` (artifact identity checked). |
| `src/indexer/identity-projections.ts` | Rebuilds subject/account identity projections from Identity Registry events. |
| `src/storage/projection-store.ts` | Projection store contract, implemented by the Postgres adapter (Postgres-only). |

## Input Events

The indexer must handle at least three sources:

| Source | Representative events | Projection purpose |
| --- | --- | --- |
| `UVPDeploymentRegistry` | Active deployment / cutover events. | Know the current state-machine address, deployment version, and release context. |
| `UVPStateMachine` | `OrderRegistered`, `SignalSubmitted`, `HookStatusChanged`, `HookReady`, `TimerPoked`, `StageSupplierPatchApplied`, `StageDockSupplierSelected`, `DockBindingPoked`, `DockOutputSubmitted`, `StageFileWritten`. | Rebuild orders, tasks, stage suppliers, dock bindings and windows, stage file maps, status, timelines, and proof rows. |
| `UVPIdentityRegistry` | `IdentityBindingRegistered`, `IdentityBindingRevoked` (subject namespace); `SupplierRegistered`, `SupplierStatusChanged` (supplier namespace). | Rebuild the subject/account identity directory and the supplier SID/account/status projection; never filters Plans or capability. |

## Output Projections

| Projection | Consumers | Notes |
| --- | --- | --- |
| Order projection | Product API, Store order search. | Must carry `chainId`, `stateMachineAddress`, and `deploymentId`. |
| Task projection | Order App, uvp-client, Product `/me/tasks`. | Derived from hook readiness and assigned-supplier authority, not manual backend assignment. |
| Timeline projection | Product proof, Store runtime proof. | Every row must trace back to a tx/block/event. |
| Proof projection | UI proof drawer, audits, release evidence. | Stores event proof, not plaintext evidence. |
| Identity projection | Store catalog, Product catalog, supplier directory. | Revoked stays displayed as revoked/blocked. |
| Dock projection | Chain read snapshot, Store dock read faces. | Static Docks (`uvp.dock.v1`) and bindings (`uvp.dockBinding.v1`): binding identity and output emission come from events; current A/B windows are a read-time live enrichment from the `dockOutputWindow` view and are never persisted. |
| Sync status | Readiness, diagnostics, reconcile. | Exposes finality/reorg/sync lag; syncing states stay pending. |

For DTO field definitions, see [Product DTO](../product/dto.md).

## Order ID Resolution

An `orderId` is only unique inside a single `(chainId, stateMachineAddress, planId)` context and can repeat across deployments or plans, so the projection key must include both contract and plan context. A service may accept a bare id when it is unique; if multiple candidates exist, the API should return ambiguous candidates.

Authoritative source: the composition of the projection key follows the implementation in `uvp-chain-services/service/src/indexer`.

```text
projection key = chainId + stateMachineAddress + planId + orderId
```

## Relation to Statemachine Replay

`uvp-protocol/packages/statemachine/` provides a reference reducer and replay tests (see [Event Replay](../state-machine/replay.md)) that prove state-machine semantics have not drifted. The Chain Services indexer builds product projections from real chain events. Both work after on-chain facts exist; the contract remains the source of runtime decisions.

## Boundaries

- Business completion comes from signal/proof, not from database state.
- Orders/tasks come from state-machine events, not from Store metadata.
- While reorg/finality is unconfirmed, states remain pending or syncing.
- Identity projections and Store review use separate fields.
- Preserve contract context; Product DTOs may simplify language, but proof fields must map back to chain events.
