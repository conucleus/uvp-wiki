---
title: Run Services and Frontends
type: how-to
audience: 工程贡献者
status: verified
---

# Run Services and Frontends

## chain-services API

The storage engine is PostgreSQL only: deployment, local runs, and tests use the same engine, and `CHAIN_SERVICES_DATABASE_URL` (which must be a `postgres://` DSN) is required in every environment — the service refuses to start when it is missing or not a Postgres DSN. The driver switch and the SQLite/in-memory engines have been removed.

Local run (a disposable docker postgres on a random port; the DSN is injected into `CHAIN_SERVICES_DATABASE_URL` and the container is destroyed on exit):

```bash
cd uvp-chain-services/service
CHAIN_SERVICES_MIGRATIONS_AUTO_RUN=true \
./scripts/with-postgres.sh CHAIN_SERVICES_DATABASE_URL -- pnpm dev:api
```

Unit tests: `pnpm test` provisions the docker database automatically through `scripts/with-postgres.sh` before running vitest; when invoking `vitest` directly, export `CHAIN_SERVICES_POSTGRES_TEST_URL` pointing at a reachable Postgres first.

Other services:

```bash
pnpm --filter @uvp-eth/chain-services dev:indexer
pnpm --filter @uvp-eth/chain-services rebuild:indexer
```

There is no standalone relayer process: broadcast capability is embedded in the API service's submission paths (submissions/stage-patches broadcast adapters and the product BFF; see [Relayer](../concepts/services/relayer.md)).

Postgres is the only storage engine (memory/SQLite have been removed); staging/testnet profiles must not use localhost RPC either (background in [Protocol Boundaries](../concepts/protocol-boundaries.md)). There are no demo or E2E fixture modes anywhere in the service layer — whatever profile you declare is exactly what runs.

## Store Workbench

```bash
pnpm --filter @uvp-eth/zhixu-store-web dev
```

Connect to the real Product API:

```bash
VITE_UVP_CHAIN_SERVICES_URL=http://127.0.0.1:8787 \
pnpm --filter @uvp-eth/zhixu-store-web dev
```

The Store write API should show errors on missing API base URL, `403`, `404`, `409`, or `422`; it must not silently mock (background in [Protocol Boundaries](../concepts/protocol-boundaries.md)).

## Order App

```bash
pnpm --filter @uvp-eth/order-app dev
```

The Order App always talks to a real Product API; there is no demo script and no demo data source. Point it at your local instance:

```bash
VITE_UVP_CHAIN_SERVICES_URL=http://127.0.0.1:8787 \
pnpm --filter @uvp-eth/order-app dev
```

Specify the participant wallet filter:

```bash
VITE_UVP_ORDER_APP_WALLET_ADDRESS=0x0000000000000000000000000000000000000002 \
VITE_UVP_CHAIN_SERVICES_URL=http://127.0.0.1:8787 \
pnpm --filter @uvp-eth/order-app dev
```

Readiness gate:

```bash
pnpm --filter @uvp-eth/order-app readiness
```

## Executor Kit

CLI entry:

```bash
pnpm --filter @uvp-eth/executor-kit cli -- --help
```

Product API doctor:

```bash
pnpm --filter @uvp-eth/executor-kit cli -- doctor \
  --chain-services-url http://127.0.0.1:8787
```

List participant tasks:

```bash
pnpm --filter @uvp-eth/executor-kit cli -- product tasks \
  --chain-services-url http://127.0.0.1:8787 \
  --wallet-address 0x0000000000000000000000000000000000000002
```

Private keys are read only from environment variables explicitly named by `--private-key-env` (background in [Protocol Boundaries](../concepts/protocol-boundaries.md)).

If a service fails to start or behaves unexpectedly, start with [Troubleshooting](troubleshooting.md) (common symptoms include Product API returning empty results or `detail_unavailable`, Order App showing no tasks, and Relayer not broadcasting).
