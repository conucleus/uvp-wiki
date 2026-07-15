# Run Services and Frontends

## chain-services API

Memory mode is suitable for tests and prototypes:

```bash
pnpm --filter @uvp-eth/chain-services dev:api
```

Local SQLite durable mode:

```bash
CHAIN_SERVICES_DATABASE_DRIVER=sqlite \
CHAIN_SERVICES_DATABASE_URL=sqlite://./chain-services.sqlite3 \
CHAIN_SERVICES_MIGRATIONS_AUTO_RUN=true \
pnpm --filter @uvp-eth/chain-services dev:api
```

Other services:

```bash
pnpm --filter @uvp-eth/chain-services dev:indexer
pnpm --filter @uvp-eth/chain-services rebuild:indexer
pnpm --filter @uvp-eth/chain-services dev:relayer
```

Staging/testnet profiles must not use memory/SQLite, localhost RPC, or demo/E2E fixture controls.

## Store Workbench

```bash
pnpm --filter @uvp-eth/zhixu-store-web dev
```

Connect to the real Product API:

```bash
VITE_UVP_CHAIN_SERVICES_URL=http://127.0.0.1:8787 \
pnpm --filter @uvp-eth/zhixu-store-web dev
```

The Store write API should show errors when the API base URL is missing or when it encounters `403`, `404`, `409`, or `422`; it must not silently mock.

## Order App

```bash
pnpm --filter @uvp-eth/order-app dev
pnpm --filter @uvp-eth/order-app dev:demo
```

Connect to the real Product API:

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

Private keys must be read only from environment variables explicitly named by `--private-key-env`.
