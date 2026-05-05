# Base Sepolia Staging

Base Sepolia 是当前 public test target。它用于 staging/rehearsal 证据，不等于生产
发布。

## Secret 环境

本地 secret 文件：

```bash
set -a
source ~/.test_envs
set +a
```

规则：

- `~/.test_envs` 必须留在仓库外。
- 文件权限应为 `0600`。
- 不要把私钥值贴进日志、文档、issue、PR 或聊天。
- `BASE_SEPOLIA_RPC_URL`、`UVP_STAGING_RPC_URL`、`UVP_RPC_URL` 默认使用
  `https://sepolia.base.org`，除非已验证更快 RPC。
- Base Sepolia chain id 是 `84532`，不是 Ethereum Sepolia 的 `11155111`。
- Staging 当前头部应使用 `UVPStateMachine` EIP-712 domain version `0.4`；历史 `0.2` 记录只作为 audit evidence。

## 非花费 Preflight

先运行：

```bash
pnpm staging:preflight
```

Preflight 应检查：

- RPC 和 chain id；
- address manifest；
- active deployment；
- chain-services runtime profile；
- PostgreSQL；
- evidence storage；
- relayer/gas-payer config；
- Store auth；
- 禁止 demo/E2E/permissive fallback；
- role wallets 和权限输入。

## Broadcast Rehearsal

只有 preflight 通过并确认 funded role wallets 与 on-chain permissions 后，才运行：

```bash
pnpm staging:rehearsal -- --allow-broadcast
```

这会发交易，必须明确知道当前使用的 deployer、owner、publisher、registrar、relayer
gas payer、participant、governance domain owner 和 governance reviewer。

## chain-services Testnet Profile

testnet profile 要求 fail-closed：

```text
CHAIN_SERVICES_RUNTIME_ENV
CHAIN_SERVICES_DATABASE_DRIVER=postgres
CHAIN_SERVICES_DATABASE_URL
CHAIN_SERVICES_MIGRATIONS_AUTO_RUN
SECURITY_PREFLIGHT_STRICT
UVP_CHAIN_ID=84532
UVP_RPC_URL
UVP_ADDRESS_MANIFEST
UVP_PRODUCT_BFF_REGISTRATION_ADAPTER
UVP_PRODUCT_BFF_REGISTRAR_PRIVATE_KEY_ENV
UVP_STATE_MACHINE_RELAYER_BROADCAST_ENABLED
UVP_STATE_MACHINE_RELAYER_PRIVATE_KEY_ENV
UVP_EVIDENCE_STORAGE_ADAPTER
UVP_EVIDENCE_OBJECT_NAMESPACE
RECONCILE_WORKER_ENABLED
```

Testnet profile 会拒绝 memory/SQLite、implicit database URLs、localhost RPC、Anvil
default private keys、demo mode、E2E fixture controls、permissive Product
submission authorization 和 broadcast-disabled relayer。

## 证据输出

Release/rehearsal 输出应包含：

- run id；
- commit；
- chain id；
- state-machine 和 trust-registry address；
- plan/order/task/submission ids；
- tx hashes；
- proof rows；
- indexer status；
- storage/evidence readiness；
- browser E2E summary；
- redacted role table；
- failed stage 或 skipped reason。

只提交经过筛选的 release record，不提交 secret、原始日志或临时本地 manifest。
