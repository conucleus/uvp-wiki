---
title: 快速开始
type: how-to
audience: 工程贡献者
status: verified
---

# 快速开始

前置条件：Node.js 20+、pnpm 9.15.0，Solidity 检查还需要 Foundry。以下命令从仓库根目录运行。

```bash
pnpm install
pnpm check
pnpm test
pnpm build
pnpm verify:protocol-freeze
```

这些命令覆盖 TypeScript package 的 typecheck/test/build，以及当前协议 ABI/hash
fixture 和 EIP-712 domain 的漂移检查。它们不花 gas，也不需要私钥；全部退出码为
0 即验证通过。

## 合约本地检查

前置条件：Foundry 已安装。命令在合约目录中运行：

```bash
cd uvp-protocol/contracts/uvp-contracts
forge build
forge test
```

验证标准：build 与 test 全部通过。如果合约 ABI、bytecode、event topic、selector
或 EIP-712 public boundary 发生变化，必须显式更新 fixture，并让相关 adapter、
indexer、executor 和部署脚本同步。

## 运行本地协议闭环

前置条件：Anvil 可用，并显式导出部署私钥（`UVP_ETH_DEPLOYER_PRIVATE_KEY`；一次性本地 key 即可，但已无内置 Anvil 默认私钥，`--private-key` 传参会被拒绝）。完整的本地闭环（部署合约、编译 Zhixu、
注册 plan/order、提交 signal、hook 事件与 replay 校验）见
[Local Anvil 协议闭环](../tutorials/local-anvil-loop.md)。

验证标准：该教程"成功标准"一节全部满足，replay mismatch 为 0。

## 常用根脚本

| 命令 | 作用 |
| --- | --- |
| `pnpm check` | 所有 package 的 typecheck。 |
| `pnpm test` | 所有 package 的 test。 |
| `pnpm build` | 所有 package 的 build。 |
| `pnpm lint` | 有 lint 脚本的 package 执行 lint。 |
| `pnpm verify:protocol-freeze` | 校验当前全部冻结 ABI/hash fixture 与 EIP-712 domain：v0.10 `UVPStateMachine`、v4.2 docking module、v0.5 plan-metadata、v0.3 lens、v0.3 stage-patch、v0.2 derived-signal/order-link/deployment-registry、v0.1 identity registry。 |
| `pnpm no-spend:safety` | 运行 deploy 包的 no-spend 检查和环境文件校验；不花 gas。 |

验证方式：对应命令退出码为 0。

## 读哪里看实现

前置条件：已完成 `pnpm install`。各模块的路径、职责与边界见[模块地图](../reference/module-map.md)。
