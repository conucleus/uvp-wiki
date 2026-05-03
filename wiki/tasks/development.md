# 日常开发

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

改变 public interface 后必须：

1. 更新或重生成 ABI/hash fixture。
2. 跑 `pnpm verify:protocol-freeze`。
3. 检查 chain-services indexer、executor-kit、protocol-bindings、deploy scripts。
4. 在 release note 或 PRD trace 中说明 drift。

## 新功能放哪里

| 新功能 | 应放位置 |
| --- | --- |
| Hook DSL parse/eval | `uvp-protocol/packages/hook-core` |
| Zhixu compiler / artifact | `uvp-protocol/packages/compiler` |
| Solidity runtime rule | `uvp-protocol/contracts/uvp-contracts` |
| 链事件 replay oracle | `uvp-protocol/packages/statemachine` |
| Browser-safe typed data/calldata | `uvp-protocol/packages/protocol-bindings` |
| Product DTO contract | `uvp-protocol/packages/product-dto` |
| indexer / relayer / Product API | `uvp-chain-services/service` |
| Store UI | `zhixu-store/app` |
| Participant task UI | `uvp-order-app/app` |
| executor CLI/SDK/MCP | `uvp-executor-kit/package` |
| deployment / release gates | `uvp-deploy/deploy` |
| payment/guarantee/agent demo | `uvp-periphery` |

跨模块改动要同时更新相关 `AGENTS.md` 和接口文档。
