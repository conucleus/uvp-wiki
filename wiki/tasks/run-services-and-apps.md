# 运行服务和前端

## chain-services API

Memory 模式适合测试和 prototype：

```bash
pnpm --filter @uvp-eth/chain-services dev:api
```

本地 SQLite durable 模式：

```bash
CHAIN_SERVICES_DATABASE_DRIVER=sqlite \
CHAIN_SERVICES_DATABASE_URL=sqlite://./chain-services.sqlite3 \
CHAIN_SERVICES_MIGRATIONS_AUTO_RUN=true \
pnpm --filter @uvp-eth/chain-services dev:api
```

其他 service：

```bash
pnpm --filter @uvp-eth/chain-services dev:indexer
pnpm --filter @uvp-eth/chain-services rebuild:indexer
pnpm --filter @uvp-eth/chain-services dev:relayer
```

Staging/testnet profile 不能使用 memory/SQLite，也不能使用 localhost RPC 或 demo/E2E
fixture controls。

## Store Workbench

```bash
pnpm --filter @uvp-eth/zhixu-store-web dev
```

连接真实 Product API：

```bash
VITE_UVP_CHAIN_SERVICES_URL=http://127.0.0.1:8787 \
pnpm --filter @uvp-eth/zhixu-store-web dev
```

Store write API 在缺少 API base URL、`403`、`404`、`409`、`422` 时应显示错误，
不能静默 mock。

## Order App

```bash
pnpm --filter @uvp-eth/order-app dev
pnpm --filter @uvp-eth/order-app dev:demo
```

连接真实 Product API：

```bash
VITE_UVP_CHAIN_SERVICES_URL=http://127.0.0.1:8787 \
pnpm --filter @uvp-eth/order-app dev
```

指定参与者 wallet filter：

```bash
VITE_UVP_ORDER_APP_WALLET_ADDRESS=0x0000000000000000000000000000000000000002 \
VITE_UVP_CHAIN_SERVICES_URL=http://127.0.0.1:8787 \
pnpm --filter @uvp-eth/order-app dev
```

Readiness gate：

```bash
pnpm --filter @uvp-eth/order-app readiness
```

## Executor Kit

CLI 入口：

```bash
pnpm --filter @uvp-eth/executor-kit cli -- --help
```

Product API doctor：

```bash
pnpm --filter @uvp-eth/executor-kit cli -- doctor \
  --chain-services-url http://127.0.0.1:8787
```

列出参与者任务：

```bash
pnpm --filter @uvp-eth/executor-kit cli -- product tasks \
  --chain-services-url http://127.0.0.1:8787 \
  --wallet-address 0x0000000000000000000000000000000000000002
```

私钥只通过显式 `--private-key-env` 命名的环境变量读取。
