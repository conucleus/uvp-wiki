---
title: 日常开发
type: how-to
audience: 工程贡献者
preread: quick-start.md
status: verified
---

# 日常开发

> 前置阅读：[快速开始](quick-start.md)
## Workspace 命令

从仓库根目录运行：

```bash
pnpm check
pnpm test
pnpm build
pnpm lint
```

协议 fixture：

```bash
pnpm verify:protocol-freeze
```

## Package 命令

| Package | 常用命令 |
| --- | --- |
| `@uvp-eth/hook-core` | `pnpm --filter @uvp-eth/hook-core test` |
| `@uvp-eth/compiler` | `pnpm --filter @uvp-eth/compiler test` |
| `@uvp-eth/statemachine` | `pnpm --filter @uvp-eth/statemachine test` |
| `@uvp-eth/protocol-bindings` | `pnpm --filter @uvp-eth/protocol-bindings test` |
| `@uvp-eth/product-dto` | `pnpm --filter @uvp-eth/product-dto test` |
| `@uvp-eth/chain-services` | `pnpm --filter @uvp-eth/chain-services check` |
| `@uvp-eth/executor-kit` | `pnpm --filter @uvp-eth/executor-kit test` |
| `@uvp-eth/zhixu-store-web` | `pnpm --filter @uvp-eth/zhixu-store-web build` |
| `@uvp-eth/order-app` | `pnpm --filter @uvp-eth/order-app readiness` |
| `@uvp-eth/deploy` | `pnpm --filter @uvp-eth/deploy test` |

## 合约开发

```bash
cd uvp-protocol/contracts/uvp-contracts
forge fmt
forge build
forge test
```

## 改变公共接口后的固定流程

改变 public interface（ABI、event topic、EIP-712 domain、canonical hash、DTO schema 等）后必须：

1. 按 [排障](troubleshooting.md) 中 "ABI Fixture Drift" 一节更新或重生成 fixture。
2. 跑 `pnpm verify:protocol-freeze`。
3. 检查 chain-services indexer、executor-kit、protocol-bindings、deploy scripts。
4. 在 release note 或 PRD trace 中说明 drift。

接口全景与各 owner 见[公共接口](../reference/public-interfaces.md)。

## 新功能放哪里

新功能属于哪个模块、各模块负责什么和不负责什么，见[模块地图](../reference/module-map.md)。判断口径：协议语义进 `uvp-protocol` 的 package 与 contracts，可重建服务进 `uvp-chain-services`，产品表面进 store / order-app，资金、担保、付款和 agent 适配进 `uvp-periphery`。

跨模块改动需同步各模块内已有的 AGENTS.md（并非所有模块都有），以及相关接口文档。
