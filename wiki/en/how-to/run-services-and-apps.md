---
title: Run Services and Frontends
type: how-to
audience: 工程贡献者
status: verified
---

# Run Services and Frontends

## chain-services API

`@uvp-eth/chain-services` owns chain projection and generic chain reads: indexer rebuilds, the `/chain/*` read surface, identity-binding reads, and operations routes. Business write paths (Product BFF, Store Console, submission orchestration) are owned by the used-car application backend.

Postgres is the only storage engine: deployment, local runs, and tests use the same engine, and `CHAIN_SERVICES_DATABASE_URL` (which must be a `postgres://` DSN) is required in every environment — the service refuses to start when it is missing or not a Postgres DSN.

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

Record plan artifacts and Dock artifacts (with Postgres ready):

```bash
pnpm --filter @uvp-eth/chain-services plan-artifact:record -- \
  --file <plan-artifact.json> --chain-id <n> --plan-id <bytes32>
pnpm --filter @uvp-eth/chain-services dock-artifact:record -- \
  --file <uvp.dock.v1.json> --chain-id <n>
```

Broadcast and signing belong to the application backend's submission paths and uvp-client's direct submission path: the chain process only indexes chain events and serves chain reads; it holds no private keys and broadcasts no transactions. Every profile connects to a real chain and a real Postgres, and the profile you declare is exactly what runs (background in [Protocol Boundaries](../concepts/protocol-boundaries.md)).

## Store Workbench

The Store workbench and Store Console API are provided by the used-car application repository; the `zhixu-store/registry` package in this repository is the non-user-facing data-layer library (`ZhixuRecord` / `IdentityClaim` registration, library only). See the application repository README for startup and configuration.

## Order App

Order App is the browser-based direct-chain order console (demo B): it connects an injected wallet, loads a plan artifact, signs `commitPlan` + `finalizePlan` to register the plan, signs `triggerOrderFromOutsideFor` to birth an order, then reads on-chain facts and events and submits signals. It needs no backend, session token, drafts, or invites.

```bash
pnpm --filter @uvp-eth/order-app dev
```

Build-time environment variables:

- `VITE_UVP_STATE_MACHINE` (required): the `UVPStateMachine` contract address.
- `VITE_CHAIN_ID` (required): chain id; the wallet network must match.
- `VITE_RPC_URL` (required): read-only RPC (for facts/events and transaction prechecks).
- `VITE_UVP_FROM_BLOCK` (optional, defaults to 0): event scan start.

Readiness gate:

```bash
pnpm --filter @uvp-eth/order-app readiness
```

## UVP Client

CLI entry:

```bash
pnpm --filter @uvp-eth/uvp-client cli -- --help
```

Non-spending doctor:

```bash
pnpm --filter @uvp-eth/uvp-client cli -- doctor \
  --rpc-url http://127.0.0.1:8545 \
  --chain-id 31337 \
  --state-machine 0x0000000000000000000000000000000000000001
```

Chain watcher dry-run:

```bash
pnpm --filter @uvp-eth/uvp-client cli -- chain-once \
  --rpc-url http://127.0.0.1:8545 \
  --chain-id 31337 \
  --config uvp-client/package/fixtures/state-machine-executor.config.json \
  --dry-run
```

Host apps get the Product V3 client and EIP-1193 signing from `@uvp-eth/uvp-client/browser`; private keys are read only from environment variables explicitly named by `--private-key-env` (background in [Protocol Boundaries](../concepts/protocol-boundaries.md)).

If a service fails to start or behaves unexpectedly, start with [Troubleshooting](troubleshooting.md) (common symptoms include Product API returning empty results or `detail_unavailable`, Order App showing no tasks, and Relayer not broadcasting).
