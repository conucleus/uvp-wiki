# 模块地图

## 公开仓库

| 仓库 | 对应模块 | 负责什么 |
| --- | --- | --- |
| [uvp-protocol](https://github.com/conucleus/uvp-protocol) | `uvp-protocol/` | compiler、HookPlan、state-machine reference、contracts、ABI/EIP-712、Product DTO。 |
| [uvp-chain-services](https://github.com/conucleus/uvp-chain-services) | `uvp-chain-services/` | indexer、relayer、proof verifier、Product/Store API、projection、workflow runtime。 |
| [zhixu-store](https://github.com/conucleus/zhixu-store) | `zhixu-store/` | Store/workbench frontend、catalog、supplier registry、trust/proof views。 |
| [uvp-order-app](https://github.com/conucleus/uvp-order-app) | `uvp-order-app/` | participant Order App、task inbox、evidence/proof display、readiness checks。 |
| [uvp-executor-kit](https://github.com/conucleus/uvp-executor-kit) | `uvp-executor-kit/` | executor CLI/SDK/MCP、chain watcher、Product API signal producer、adapter integration。 |

## Workspace 模块

| 路径 | Package | 负责什么 | 不负责什么 |
| --- | --- | --- | --- |
| `uvp-protocol/packages/hook-core` | `@uvp-eth/hook-core` | Hook DSL parser/evaluator、dependency extraction | DB、Solidity、escrow、runtime service |
| `uvp-protocol/packages/compiler` | `@uvp-eth/compiler` | Zhixu compiler、HookPlan、OnchainHookPlan、registerPlan args | hook runtime execution |
| `uvp-protocol/packages/statemachine` | `@uvp-eth/statemachine` | reference reducer、chain event replay oracle | contract authorization、HTTP dispatch |
| `uvp-protocol/packages/protocol-bindings` | `@uvp-eth/protocol-bindings` | ABI、EIP-712、calldata、hash helpers | private keys、env、watcher、tx submit |
| `uvp-protocol/contracts/uvp-contracts` | Foundry project | Solidity contracts、ABI fixture、contract tests | backend service code |
| `uvp-protocol/tools/runtime-host` | `@uvp-eth/runtime-host` | off-chain reference harness | ETH runtime source of truth |
| `uvp-protocol/packages/product-dto` | `@uvp-eth/product-dto` | product-facing DTO contracts | React、wallet、storage、chain client |
| `uvp-chain-services/service` | `@uvp-eth/chain-services` | indexer、relayer、proof verifier、Product/Store APIs；详见 [Chain Services](../components/chain-services.md) | 协议事实源 |
| `zhixu-store/app` | `@uvp-eth/zhixu-store-web` | Store/workbench frontend | old Go-coupled Store BFF |
| `uvp-order-app/app` | `@uvp-eth/order-app` | participant task/signal console | Store Console、escrow demo |
| `uvp-executor-kit/package` | `@uvp-eth/executor-kit` | executor CLI/SDK/MCP、chain watcher、Product API signal producer | privileged backend truth |
| `uvp-deploy/deploy` | `@uvp-eth/deploy` | deploy scripts、manifests、release records | sibling `/Users/uyhendu/project/uvp-deploy` |
| `uvp-deploy/apps/ops-console-web` | `@uvp-eth/ops-console-web` | operator console prototype | protocol runtime |
| `uvp-periphery` | mixed | funding/payment/guarantee/agent adapters and demos | core protocol truth |

## Workspace Packages

`pnpm-workspace.yaml` includes：

```text
uvp-protocol/packages/*
uvp-protocol/tools/*
uvp-chain-services/service
uvp-executor-kit/package
uvp-order-app/app
zhixu-store/app
uvp-deploy/deploy
uvp-deploy/apps/*
uvp-periphery/executors/*
```

## 重要文档源

- `README.md`：仓库主状态和当前 MVP。
- `AGENTS.md`：边界和工程规则。
- `docs/product/README.md`：PRD truth index。
- `docs/IMPLEMENTATION_TRACE.md`：实现追踪。
- `uvp-deploy/deploy/releases/`：release records。
- 各模块 `README.md`：局部运行命令和边界。
