---
title: 运行服务和前端
type: how-to
audience: 工程贡献者
status: verified
---

# 运行服务和前端

## chain-services API

存储引擎只有 Postgres：部署、本地与测试跑同一个引擎，`CHAIN_SERVICES_DATABASE_URL`（必须是 `postgres://` DSN）全环境必填——缺失或不是 Postgres DSN 时服务拒绝启动。driver 开关与 SQLite/内存引擎已移除。

本地运行（一次性 docker postgres，随机端口，DSN 注入 `CHAIN_SERVICES_DATABASE_URL` 后运行命令，退出即销毁容器）：

```bash
cd uvp-chain-services/service
CHAIN_SERVICES_MIGRATIONS_AUTO_RUN=true \
./scripts/with-postgres.sh CHAIN_SERVICES_DATABASE_URL -- pnpm dev:api
```

单元测试：`pnpm test` 自动经 `scripts/with-postgres.sh` 起 docker 库再跑 vitest；直接运行 `vitest` 时必须自带 `CHAIN_SERVICES_POSTGRES_TEST_URL` 指向可达的 Postgres。

其他 service：

```bash
pnpm --filter @uvp-eth/chain-services dev:indexer
pnpm --filter @uvp-eth/chain-services rebuild:indexer
```

没有独立的 relayer 进程：广播能力内嵌在 API 服务的提交链路里（submissions/stage-patches 广播装配件与 product BFF，见 [Relayer](../concepts/services/relayer.md)）。

存储只有 Postgres 一种引擎（memory/SQLite 已移除）；staging/testnet profile 也不能使用 localhost RPC（背景见[协议边界](../concepts/protocol-boundaries.md)）。demo 与 E2E fixture 模式在服务层已不存在：你声明的是什么 profile，运行的就是什么 profile。

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

## UVP Client

CLI 入口：

```bash
pnpm --filter @uvp-eth/uvp-client cli -- --help
```

非花费 doctor：

```bash
pnpm --filter @uvp-eth/uvp-client cli -- doctor \
  --rpc-url http://127.0.0.1:8545 \
  --chain-id 31337 \
  --state-machine 0x0000000000000000000000000000000000000001
```

链 watcher dry-run：

```bash
pnpm --filter @uvp-eth/uvp-client cli -- chain-once \
  --rpc-url http://127.0.0.1:8545 \
  --chain-id 31337 \
  --config uvp-client/package/fixtures/state-machine-executor.config.json \
  --dry-run
```

宿主应用（Order App / used-car host）从 `@uvp-eth/uvp-client/browser` 取 Product V3 客户端与 EIP-1193 签名；私钥只通过显式 `--private-key-env` 命名的环境变量读取（背景见[协议边界](../concepts/protocol-boundaries.md)）。

服务起不来或行为与预期不符时，先查[排障](troubleshooting.md)（含 Product API 返回空结果或 `detail_unavailable`、Order App 看不到任务、Relayer 不广播等常见症状）。
