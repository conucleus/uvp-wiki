---
title: 运行服务和前端
type: how-to
audience: 工程贡献者
status: verified
---

# 运行服务和前端

## chain-services API

Memory 模式适合测试和 prototype，但存储键全环境必填——不显式声明 driver 与 URL 时服务会拒绝启动：

```bash
CHAIN_SERVICES_DATABASE_DRIVER=memory \
CHAIN_SERVICES_DATABASE_URL=memory://projection-store \
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

Staging/testnet profile 不能使用 memory/SQLite，也不能使用 localhost RPC（背景见[协议边界](../concepts/protocol-boundaries.md)）。demo 与 E2E fixture 模式在服务层已不存在：你声明的是什么 profile，运行的就是什么 profile。

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
不能静默 mock（背景见[协议边界](../concepts/protocol-boundaries.md)）。

## Order App

Order App 始终对接真实 Product API：没有 demo 脚本，也没有 demo 数据源。本地运行即指向本地服务实例：

```bash
pnpm --filter @uvp-eth/order-app dev
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

私钥只通过显式 `--private-key-env` 命名的环境变量读取（背景见[协议边界](../concepts/protocol-boundaries.md)）。

服务起不来或行为与预期不符时，先查[排障](troubleshooting.md)（含 Product API 返回空结果或 `detail_unavailable`、Order App 看不到任务、Relayer 不广播等常见症状）。
