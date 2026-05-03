# Storage, Migration, and Runtime Profile

Storage is the workflow and projection cache for the rebuildable service layer. Chain Services supports memory, SQLite, and PostgreSQL; different profiles change runtime reliability, not the source of truth.

## Storage Profile

```text
CHAIN_SERVICES_DATABASE_DRIVER=memory|sqlite|postgres
CHAIN_SERVICES_DATABASE_URL=memory://projection-store
CHAIN_SERVICES_MIGRATIONS_AUTO_RUN=false
```

| Profile | Purpose | Constraints |
| --- | --- | --- |
| memory | unit tests, temporary prototypes. | only supports test/prototype usage. |
| SQLite | local durable runs, developer self-test. | suitable for personal forks, not for public testnet services. |
| PostgreSQL | Base Sepolia staging, long-running services, production profile. | migrations are explicitly managed; runtime fails closed. |

## Code Entry Points

| File | Responsibility |
| --- | --- |
| `src/storage/factory.ts` | creates memory/SQLite/PostgreSQL stores from env. |
| `src/storage/projection-store.ts` | projection storage contract. |
| `src/storage/sqlite.ts`, `sqlite-projection-store.ts` | SQLite adapter. |
| `src/storage/postgres.ts`, `postgres-client.ts` | PostgreSQL adapter. |
| `src/storage/migrations.ts`, `postgres-migrations.ts` | migration runner. |
| `src/config/env.ts`, `preflight.ts` | runtime env parsing and fail-closed checks. |
| `src/security/redaction.ts`, `audit.ts` | redaction and audit support. |

## Migrations

| Migration | Contents |
| --- | --- |
| `0001_projection_storage` | chain event projection and base replay storage. |
| `0002_business_storage` | helper tables for business queries, not protocol facts. |
| `0003_product_order_start` | Product order draft/start workflow. |
| `0004_submission_attempt_operations` | submission attempt, retry, and operation tracking. |
| `0005_projection_sync_state` | indexer sync/finality/rebuild state. |
| `0006_store_metadata` | Store Zhixu, supplier, docking, and related metadata. |
| `0007_store_product_schema` | structures related to Store Product Schema / add-on manifest. |
| `0008_store_audit` | Store operator/admin audit trail. |

## Testnet Fail Closed

The Base Sepolia / testnet profile must reject:

- memory/SQLite storage.
- localhost RPC.
- demo fallback, E2E fixture controls, permissive authorization.
- Anvil default private keys.
- missing `UVPStateMachine` / `ZhixuTrustRegistry` address manifest.
- broadcast disabled while still claiming staging readiness.

Readiness can say whether a service instance is running with the correct configuration; on-chain plan/order/signal/trust facts still come from events.

## Boundary

- All projection data must be erasable and rebuildable.
- Store draft, supplier metadata, audit, and notification delivery are workflow state.
- PostgreSQL durability is runtime reliability, not canonical truth.
- Diagnostics and audit output must be redacted.
