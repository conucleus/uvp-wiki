---
title: Storage, Migration, and Runtime Profile
type: reference
audience: 工程贡献者
status: verified
---

# Storage, Migration, and Runtime Profile

Storage is the workflow and projection cache of the rebuildable service layer. Chain Services supports memory, SQLite, and PostgreSQL; different profiles change runtime reliability only, never the source of truth.

## Storage Profile

```text
CHAIN_SERVICES_DATABASE_DRIVER=memory|sqlite|postgres
CHAIN_SERVICES_DATABASE_URL=memory://projection-store
CHAIN_SERVICES_MIGRATIONS_AUTO_RUN=false
```

| Profile | Purpose | Constraints |
| --- | --- | --- |
| memory | Unit tests, temporary prototypes. | Supports test/prototype usage only. |
| SQLite | Local durable runs, developer self-testing. | Suitable for personal forks, not for public testnet services. |
| PostgreSQL | Base Sepolia staging, long-running services, production profile. | Migrations explicitly managed; runtime fails closed. |

## Code Entry Points

| File | Responsibility |
| --- | --- |
| `src/storage/factory.ts` | Creates memory/SQLite/PostgreSQL stores from env. |
| `src/storage/projection-store.ts` | Projection storage contract. |
| `src/storage/sqlite.ts`, `sqlite-projection-store.ts` | SQLite adapter. |
| `src/storage/postgres.ts`, `postgres-client.ts` | PostgreSQL adapter. |
| `src/storage/migrations.ts`, `postgres-migrations.ts` | Migration runner. |
| `src/config/env.ts`, `preflight.ts` | Runtime env parsing and fail-closed checks. |
| `src/security/redaction.ts`, `audit.ts` | Redaction and audit support. |

## Migrations

The list below is current as of this writing; the authoritative source is the `src/storage/migrations` directory (including `0009`/`0010`).

| Migration | Contents |
| --- | --- |
| `0001_projection_storage` | Chain event projection and base replay storage. |
| `0002_business_storage` | Helper tables for business queries; not protocol facts. |
| `0003_product_order_start` | Product order draft/start workflow. |
| `0004_submission_attempt_operations` | Submission attempt, retry, and operation tracking. |
| `0005_projection_sync_state` | Indexer sync/finality/rebuild state. |
| `0006_store_metadata` | Store Zhixu, supplier, docking, and related metadata. |
| `0007_store_product_schema` | Structures related to Store Product Schema / add-on manifest. |
| `0008_store_audit` | Store operator/admin audit trail. |
| `0009_product_trigger_prepare` | Product trigger prepare/submit columns on the order trigger workflow (typed data, signature, idempotency). |
| `0010_store_supplier_capability_audit` | Before/after supplier capability snapshots in the store supplier audit trail. |

## Testnet Fail Closed

This section is the single authoritative source for the testnet fail-closed policy checklist. Other pages link here when referencing the policy instead of restating the full list.

The Base Sepolia / testnet profile must reject:

- memory/SQLite storage.
- localhost RPC.
- Demo fallback, E2E fixture controls, permissive authorization.
- Anvil default private keys.
- A missing `UVPStateMachine` / `UVPIdentityRegistry` address manifest.
- Broadcast disabled while still claiming staging readiness.

Readiness can say whether a service instance runs with the correct configuration; on-chain plan/order/signal/trust facts still come from events.

## Boundaries

- All projection data must be erasable and rebuildable.
- Store drafts, supplier metadata, audit, and notification delivery are workflow state.
- PostgreSQL durability is runtime reliability, not canonical truth.
- Diagnostics and audit output must be redacted.
