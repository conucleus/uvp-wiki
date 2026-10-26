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

## uvp-client CLI

完整语义见 [UVP Client](../concepts/apps/uvp-client.md)。CLI 只覆盖执行者命令：wallet、faucet、doctor、chain-once、chain-watch、chain-signal。

```bash
pnpm --filter @uvp-eth/uvp-client cli -- --help
```

生成或查看钱包：

```bash
pnpm --filter @uvp-eth/uvp-client cli -- wallet new --env-file .env.local
pnpm --filter @uvp-eth/uvp-client cli -- wallet address \
  --private-key-env UVP_ETH_DEPLOYER_PRIVATE_KEY
```

非花费 doctor（config、RPC chain id/head、合约代码、signer；失败退出码 1）：

```bash
pnpm --filter @uvp-eth/uvp-client cli -- doctor \
  --config uvp-client/package/fixtures/state-machine-executor.config.json \
  --rpc-url http://127.0.0.1:8545 \
  --chain-id 31337 \
  --state-machine 0x0000000000000000000000000000000000000001
```

Chain watcher dry-run（`--dry-run` 只演练扫描与准备，不提交交易）。示例 config 的 `stateMachines[]` 已声明被扫描的 state machine，因此不传 `--state-machine`——两者并存会被直接拒绝，扫描集合必须只在一处声明：

```bash
pnpm --filter @uvp-eth/uvp-client cli -- chain-once \
  --rpc-url http://127.0.0.1:8545 \
  --chain-id 31337 \
  --config uvp-client/package/fixtures/state-machine-executor.config.json \
  --wallet-address 0x0000000000000000000000000000000000000002 \
  --dry-run
```

单笔 signal：

```bash
pnpm --filter @uvp-eth/uvp-client cli -- chain-signal \
  --rpc-url http://127.0.0.1:8545 \
  --state-machine 0x0000000000000000000000000000000000000001 \
  --chain-id 31337 \
  --plan-id 0x2222222222222222222222222222222222222222222222222222222222222222 \
  --order-id 0x1111111111111111111111111111111111111111111111111111111111111111 \
  --source slot-a \
  --stage exec.main \
  --signal-name cmp \
  --payload-hash 0x3333333333333333333333333333333333333333333333333333333333333333 \
  --wallet-address 0x0000000000000000000000000000000000000002 \
  --dry-run
```

退出码：`chain-once`/`chain-watch` 在扫描结果含非 benign error，或存在 failed/dead_letter job 时以 1 结束。jobs 的 retry/dead/live 运维由 SDK（`retryStateMachineJob`、`deadLetterStateMachineJob`、`reviveStateMachineJob`）承担，不再是 CLI 子命令。

## uvp-client 入口

```ts
import { ... } from '@uvp-eth/uvp-client/core';
import { ... } from '@uvp-eth/uvp-client/browser';
import { ... } from '@uvp-eth/uvp-client/headless';
```

- `core`：transport/auth、chain target、signal build/decode/submit、validation、evidence。
- `browser`：Product V3 客户端、EIP-1193 签名、session/deadline/format、typed-data 校验；宿主注入 provider 与会话。
- `headless`：私钥钱包、watcher/job store、doctor。
- `cli`：`buildProgram`/`main`（bin `uvp-client`）。

## chain-services Storage

完整模块边界见 [Chain Services](../concepts/services/chain-services.md)。这里保留本地配置速查。

```text
CHAIN_SERVICES_DATABASE_URL=postgres://uvp:uvp@127.0.0.1:5432/uvp_chain_services
```

`CHAIN_SERVICES_DATABASE_URL` 全环境必填，本地与测试也不例外；缺失时启动即失败并报出键名。值必须是 `postgres://`（或 `postgresql://`）DSN：driver 开关 `CHAIN_SERVICES_DATABASE_DRIVER` 已删除，SQLite 与内存引擎已移除，没有隐式默认值。
