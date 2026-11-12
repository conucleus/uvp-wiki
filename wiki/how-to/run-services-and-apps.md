---
title: 运行服务和前端
type: how-to
audience: 工程贡献者
status: verified
---

# 运行服务和前端

## chain-services API

`@uvp-eth/chain-services` 负责链投影与通用链读：索引重建、`/chain/*` 读面、身份绑定读面与运维路由。业务写路径（Product BFF、Store Console、submission 编排）由 used-car 应用仓 backend 拥有。

存储引擎只有 Postgres：部署、本地与测试跑同一个引擎，`CHAIN_SERVICES_DATABASE_URL`（必须是 `postgres://` DSN）全环境必填——缺失或不是 Postgres DSN 时服务拒绝启动。

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

记录计划产物与 Dock 产物（Postgres 就绪后）：

```bash
pnpm --filter @uvp-eth/chain-services plan-artifact:record -- \
  --file <plan-artifact.json> --chain-id <n> --plan-id <bytes32>
pnpm --filter @uvp-eth/chain-services dock-artifact:record -- \
  --file <uvp.dock.v1.json> --chain-id <n>
```

广播与签名归应用仓 backend 的提交链路和 uvp-client 的 direct 提交路径：chain 进程只索引链事件、对外提供链读，不持私钥、不广播交易。所有 profile 都连接真实链与真实 Postgres，声明哪个 profile 就运行哪个 profile（背景见[协议边界](../concepts/protocol-boundaries.md)）。

## Store 工作台

Store 工作台与 Store Console API 由 used-car 应用仓提供；本仓 `zhixu-store/registry` 是非面向用户的数据层库（`ZhixuRecord` / `IdentityClaim` 登记，library only）。启动方式与配置见应用仓 README。

## Order App

Order App 是浏览器内的链上直连订单控制台（demo B）：连接注入式钱包，载入 plan artifact，签 `commitPlan` + `finalizePlan` 注册计划，再签 `triggerOrderFromOutsideFor` 出生订单，随后读链上事实与事件、提交 signal。它不依赖 backend、会话 token、草稿或邀请。

```bash
pnpm --filter @uvp-eth/order-app dev
```

构建期环境变量：

- `VITE_UVP_STATE_MACHINE`（必填）：`UVPStateMachine` 合约地址。
- `VITE_CHAIN_ID`（必填）：链 ID；钱包网络必须与之一致。
- `VITE_RPC_URL`（必填）：只读 RPC（读事实/事件与交易预检）。
- `VITE_UVP_FROM_BLOCK`（可选，缺省 0）：事件扫描起点。

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

宿主应用从 `@uvp-eth/uvp-client/browser` 取 Product V3 客户端与 EIP-1193 签名；私钥只通过显式 `--private-key-env` 命名的环境变量读取（背景见[协议边界](../concepts/protocol-boundaries.md)）。

服务起不来或行为与预期不符时，先查[排障](troubleshooting.md)（含 Product API 返回空结果或 `detail_unavailable`、Order App 看不到任务、Relayer 不广播等常见症状）。
