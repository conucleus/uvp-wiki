---
title: Storage, Migration, and Runtime Profile
type: reference
audience: 工程贡献者
status: verified
---

# Storage, Migration, and Runtime Profile

Storage is the workflow and projection cache of the rebuildable service layer. The storage engine is PostgreSQL only: deployment, local runs, and tests all use the same engine; profiles change runtime reliability only, never the source of truth.

## Storage Profile

```text
CHAIN_SERVICES_DATABASE_URL=postgres://user:password@host:5432/database
CHAIN_SERVICES_MIGRATIONS_AUTO_RUN=false
```

`CHAIN_SERVICES_DATABASE_URL` is required in every environment — including local runs and unit-test setups. When it is missing, startup fails with a configuration error that names the key and how to provision a database. The value must be a `postgres://` (or `postgresql://`) DSN: the `CHAIN_SERVICES_DATABASE_DRIVER` switch has been removed, the SQLite and in-memory engines are gone, and there is no implicit default or any mode that starts without Postgres.

| Storage rule | Requirement |
| --- | --- |
| Single storage env: `CHAIN_SERVICES_DATABASE_URL` | Must be a Postgres DSN; non-Postgres DSNs fail at config parsing. |
| `CHAIN_SERVICES_MIGRATIONS_AUTO_RUN` | Defaults to `false`; setting it to `true` under production/staging/testnet requires the matching explicit ack key. |

### Local Runs and Tests

- To start a local database, use `uvp-chain-services/service/scripts/with-postgres.sh` (a thin wrapper over `uvp-deploy/deploy/scripts/lib/with-postgres.sh`): when the target env is unset it starts a disposable docker postgres (random port, container destroyed when the command exits), injects the DSN into that env, and runs the command; if the env is already set it passes through. Example: `./scripts/with-postgres.sh CHAIN_SERVICES_DATABASE_URL -- pnpm dev:api`.
- Unit tests: `pnpm test` runs `./scripts/with-postgres.sh --env CHAIN_SERVICES_POSTGRES_TEST_URL -- vitest run`, provisioning the docker database automatically; when invoking `vitest` directly (bypassing the script), export `CHAIN_SERVICES_POSTGRES_TEST_URL` pointing at a reachable Postgres first (the test provisioner clones a per-case database from a template).

## Code Entry Points

| File | Responsibility |
| --- | --- |
| `src/storage/factory.ts` | Creates the Postgres store set from env (Postgres-only). |
| `src/storage/projection-store.ts` | Projection storage contract. |
| `src/storage/postgres.ts`, `postgres-client.ts`, `postgres-rows.ts` | PostgreSQL adapter. |
| `src/storage/postgres-migrations.ts` | Migration runner: `NNNN_name.sql` loading, checksum ledger, retired-migration checks. |
| `src/config/env.ts`, `preflight.ts` | Runtime env parsing and fail-closed checks. |
| `src/security/redaction.ts`, `audit.ts` | Redaction and audit support. |

## Migrations

The historical numbered migrations have been collapsed into a single net schema; the authoritative source is the `service/migrations/postgres/` directory. Migration bytes follow the dev live line — no cross-version upgrade path is promised; numbered migration files are never edited, and structural changes open a new numbered migration.

| Migration | Contents |
| --- | --- |
| `0001_schema` | A single pg_dump net schema: chain event projections, business helper tables, and workflow-state structures. |
| `0002_plan_artifacts` | `plan_artifacts` compiled-plan table (row-immutable; the only plan-vocabulary source for index enrichment and submission proofs) plus supplier tag-column cleanup. |

- The runner records each migration's version and sha256 checksum in the `chain_services_migrations` ledger; a checksum mismatch against an applied migration refuses startup, and the database must be reconciled against the ledger and recreated.
- An applied version whose file no longer exists in the directory also refuses startup (retired-migration check), so migration history cannot be silently rewritten.
- Projection data must be erasable and rebuildable: drop the projection database and the indexer replays it from chain events.

## Testnet Fail Closed

This section is the single authoritative source for the testnet fail-closed policy checklist. Other pages link here when referencing the policy instead of restating the full list.

The Base Sepolia / testnet profile must reject:

- Non-Postgres storage (Postgres is the only engine; `CHAIN_SERVICES_DATABASE_URL` must be a `postgres://` DSN).
- localhost RPC.
- Permissive authorization.
- Anvil default private keys.
- A missing `UVPStateMachine` / `UVPIdentityRegistry` address manifest.
- Broadcast disabled while still claiming staging readiness (non-local environments require an explicitly configured broadcast adapter; otherwise startup fails with a configuration error).

Note that there is no demo fallback to reject: the Product API has no demo data source — an empty projection returns an empty array or `detail_unavailable` — and no `?fallback=demo` parameter or `UVP_PRODUCT_DEMO_MODE` key exists. The same holds for E2E fixture controls: the e2e-controls module and `UVP_PRODUCT_E2E_FIXTURES` have been removed, so fail-closed enforcement is about required explicit configuration, not about switching demo modes off.

Readiness can say whether a service instance runs with the correct configuration; on-chain plan/order/signal/trust facts still come from events.

## Boundaries

- All projection data must be erasable and rebuildable.
- Store drafts, supplier metadata, audit, and notification delivery are workflow state.
- PostgreSQL durability is runtime reliability, not canonical truth.
- Diagnostics and audit output must be redacted.

## Related Pages

- [Chain Services](chain-services.md)
- [Indexer and Projections](indexer-projections.md)
- [Data Flow and Source of Truth](../data-flow-and-truth.md)
- [Run Services and Frontends](../../how-to/run-services-and-apps.md)
