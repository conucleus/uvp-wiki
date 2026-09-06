---
title: CLI 与配置
type: reference
audience: 工程贡献者
status: verified
---

# CLI 与配置

## Root Scripts

```bash
pnpm check
pnpm test
pnpm build
pnpm lint
pnpm verify:protocol-freeze
```

## executor-kit CLI

完整语义见 [Executor Kit](../concepts/apps/executor-kit.md)。这里保留命令速查。

生成或查看钱包：

```bash
pnpm --filter @uvp-eth/executor-kit cli -- wallet new --env-file .env.local
pnpm --filter @uvp-eth/executor-kit cli -- wallet address \
  --private-key-env UVP_ETH_DEPLOYER_PRIVATE_KEY
```

Product API doctor：

```bash
pnpm --filter @uvp-eth/executor-kit cli -- doctor \
  --chain-services-url http://127.0.0.1:8787 \
  --wallet-address 0x0000000000000000000000000000000000000002
```

Product API task submit：

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

Chain watcher dry-run（`--dry-run` 仍是显式测试辅助：只演练扫描与准备，不提交任何交易）：

```bash
pnpm --filter @uvp-eth/executor-kit cli -- chain-once \
  --rpc-url http://127.0.0.1:8545 \
  --state-machine 0x0000000000000000000000000000000000000001 \
  --chain-id 31337 \
  --config uvp-executor-kit/package/fixtures/state-machine-executor.config.json \
  --wallet-address 0x0000000000000000000000000000000000000002 \
  --dry-run
```

`chain-once` 与 `jobs retry` 的退出码语义：扫描结果包含 error，或存在 failed/dead_letter job 时，进程以退出码 1 结束。调度器和 CI 应把非零退出视为本轮失败，而不是静默继续。

## chain-services Storage

完整模块边界见 [Chain Services](../concepts/services/chain-services.md)。这里保留本地配置速查。

```text
CHAIN_SERVICES_DATABASE_DRIVER=memory|sqlite|postgres
CHAIN_SERVICES_DATABASE_URL=<按 driver 显式配置>
```

`CHAIN_SERVICES_DATABASE_DRIVER` 与 `CHAIN_SERVICES_DATABASE_URL` 全环境必填，本地与测试也不例外；任一缺失时启动即失败并报出键名。`memory|sqlite|postgres` 都是显式声明，没有隐式默认值。

本地 SQLite 示例（驱动与 URL 同样必须显式给出）：

```bash
CHAIN_SERVICES_DATABASE_DRIVER=sqlite \
CHAIN_SERVICES_DATABASE_URL=sqlite://./chain-services.sqlite3 \
CHAIN_SERVICES_MIGRATIONS_AUTO_RUN=true \
pnpm --filter @uvp-eth/chain-services dev:api
```

## Frontend Config

Store：

```text
VITE_UVP_CHAIN_SERVICES_URL
VITE_UVP_STORE_ACCESS_LEVEL
```

Store 访问级别只来自这些环境变量与登录会话；不存在 `?storeAccess` query 参数，也没有 localStorage 覆盖链。

Order App：

```text
VITE_UVP_CHAIN_SERVICES_URL
VITE_UVP_ORDER_APP_WALLET_ADDRESS
```

不存在 `VITE_UVP_DEMO_MODE`、`VITE_UVP_DEMO_SELECTED`、`VITE_UVP_ORDER_APP_DEMO` 变量，没有 demo profile，也没有 `?fallback=demo` query 参数。

Production/staging profile 只需拒绝 permissive authorization 等宽松配置——仓库不含任何 demo/fixture/mock 路径，不存在可以打开的 demo 或 test-control 开关。
