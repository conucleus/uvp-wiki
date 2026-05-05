# 快速开始

以下命令从仓库根目录运行。

```bash
pnpm install
pnpm check
pnpm test
pnpm build
pnpm verify:protocol-freeze
```

这些命令覆盖 TypeScript package 的 typecheck/test/build，以及当前协议 ABI/hash
fixture 和 EIP-712 domain 的漂移检查。它们不花 gas，也不需要私钥。

## 合约本地检查

Foundry 命令在合约目录中运行：

```bash
cd uvp-protocol/contracts/uvp-contracts
forge build
forge test
```

如果合约 ABI、bytecode、event topic、selector 或 EIP-712 public boundary
发生变化，必须显式更新 fixture，并让相关 adapter、indexer、executor 和部署脚本同步。

## 运行本地协议闭环

```bash
uvp-deploy/deploy/scripts/bootstrap-local-anvil.sh --self-update
uvp-deploy/deploy/scripts/bootstrap-local-anvil.sh --failure
```

这个脚本会部署合约、编译 Zhixu、注册 plan/order、提交 signal、触发 hook 事件，
并用 `statemachine` chain oracle 对链事件做重放校验。

## 常用根脚本

| 命令 | 作用 |
| --- | --- |
| `pnpm check` | 所有 package 的 typecheck。 |
| `pnpm test` | 所有 package 的 test。 |
| `pnpm build` | 所有 package 的 build。 |
| `pnpm lint` | 有 lint 脚本的 package 执行 lint。 |
| `pnpm verify:protocol-freeze` | 校验 v0.4 `UVPStateMachine`、`ZhixuTrustRegistry`、`UVPDeploymentRegistry` 和 EIP-712 domain fixture。 |
| `pnpm release:baseline:dry-run` | 本地 release baseline 预演。 |
| `pnpm staging:preflight` | Base Sepolia staging 非花费 preflight。 |

## 读哪里看实现

- 协议编译：`uvp-protocol/packages/compiler/`
- 语义核心：`uvp-protocol/packages/hook-core/`
- 链事件重放：`uvp-protocol/packages/statemachine/`
- 合约：`uvp-protocol/contracts/uvp-contracts/`
- API/indexer/relayer：`uvp-chain-services/service/`
- Store workbench：`zhixu-store/app/`
- Order App：`uvp-order-app/app/`
- executor CLI/SDK：`uvp-executor-kit/package/`
- 部署和 release evidence：`uvp-deploy/deploy/`
