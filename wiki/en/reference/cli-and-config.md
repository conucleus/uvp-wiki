---
title: CLI and Configuration
type: reference
audience: 工程贡献者
status: verified
---

# CLI and Configuration

## Root Scripts

```bash
pnpm check
pnpm test
pnpm build
pnpm lint
pnpm verify:protocol-freeze
```

## executor-kit CLI

See [Executor Kit](../execution/executor-kit.md) for full semantics. This page keeps a command quick reference.

Generate or inspect wallets:

```bash
pnpm --filter @uvp-eth/executor-kit cli -- wallet new --env-file .env.local
pnpm --filter @uvp-eth/executor-kit cli -- wallet address \
  --private-key-env UVP_ETH_DEPLOYER_PRIVATE_KEY
```

Product API doctor:

```bash
pnpm --filter @uvp-eth/executor-kit cli -- doctor \
  --chain-services-url http://127.0.0.1:8787 \
  --wallet-address 0x0000000000000000000000000000000000000002
```

Product API task submit:

```bash
pnpm --filter @uvp-eth/executor-kit cli -- product prepare task_123 \
  --chain-services-url http://127.0.0.1:8787 \
  --wallet-address 0x0000000000000000000000000000000000000002 \
  --evidence-id ev_123 \
  --intent confirm_stage \
  --prepared-file .uvp-prepared-submit.json

UVP_PARTICIPANT_PRIVATE_KEY=0x... \
pnpm --filter @uvp-eth/executor-kit cli -- product submit task_123 \
  --chain-services-url http://127.0.0.1:8787 \
  --prepared-file .uvp-prepared-submit.json \
  --private-key-env UVP_PARTICIPANT_PRIVATE_KEY
```

Chain watcher dry-run:

```bash
pnpm --filter @uvp-eth/executor-kit cli -- chain-once \
  --rpc-url http://127.0.0.1:8545 \
  --state-machine 0x0000000000000000000000000000000000000001 \
  --chain-id 31337 \
  --config uvp-executor-kit/package/fixtures/state-machine-executor.config.json \
  --wallet-address 0x0000000000000000000000000000000000000002 \
  --dry-run
```

## chain-services Storage

See [Chain Services](../components/chain-services.md) for full module boundaries. This section keeps a local configuration quick reference.

```text
CHAIN_SERVICES_DATABASE_DRIVER=memory|sqlite|postgres
CHAIN_SERVICES_DATABASE_URL=memory://projection-store
CHAIN_SERVICES_MIGRATIONS_AUTO_RUN=false
```

Local SQLite:

```bash
CHAIN_SERVICES_DATABASE_DRIVER=sqlite \
CHAIN_SERVICES_DATABASE_URL=sqlite://./chain-services.sqlite3 \
CHAIN_SERVICES_MIGRATIONS_AUTO_RUN=true \
pnpm --filter @uvp-eth/chain-services dev:api
```

## Frontend Config

Store:

```text
VITE_UVP_CHAIN_SERVICES_URL
VITE_UVP_STORE_ACCESS_LEVEL
```

Order App:

```text
VITE_UVP_CHAIN_SERVICES_URL
VITE_UVP_ORDER_APP_DEMO=1
VITE_UVP_ORDER_APP_WALLET_ADDRESS
```

Production/staging profiles must not enable demo, fixture, test controls, or permissive authorization.
