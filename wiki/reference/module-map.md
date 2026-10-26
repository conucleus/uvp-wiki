---
title: 模块地图
type: reference
audience: 工程贡献者
status: verified
---

# 模块地图

## 公开仓库

| 仓库 | 对应模块 | 负责什么 |
| --- | --- | --- |
| [uvp-core](https://github.com/conucleus/uvp-core) | `uvp-core/` | Rust 规范语义核心、golden corpus、CLI/FFI/N-API adapters。 |
| [uvp-protocol](https://github.com/conucleus/uvp-protocol) | `uvp-protocol/` | compiler、HookPlan、state-machine reference、contracts、ABI/EIP-712、Product DTO。 |
| [uvp-chain-services](https://github.com/conucleus/uvp-chain-services) | `uvp-chain-services/` | chain indexer、projection、generic read API、可选 relay、proof verifier、chain health。 |
| [zhixu-store](https://github.com/conucleus/zhixu-store) | `zhixu-store/` | 托管 `@uvp-eth/zhixu-registry`：permissionless 的 ZhixuRecord / IdentityClaim 登记数据层（无 UI、无审核）。 |
| [uvp-order-app](https://github.com/conucleus/uvp-order-app) | `uvp-order-app/` | 单一参与者流程：钱包会话、订单草稿/邀请/finalize、订单房间。 |
| [uvp-client](https://github.com/conucleus/uvp-client) | `uvp-client/` | 公共客户端四入口（core/browser/headless/cli）：transport、Product V3 客户端、EIP-1193 钱包、watcher、执行者 CLI。 |

## Workspace 模块

| 路径 | Package | 负责什么 | 不负责什么 |
| --- | --- | --- | --- |
| `uvp-core/crates/uvp-node` | `@conucleus/uvp-core-node` | Rust semantic core 的版本化 Node native artifact | Product API、DB、RPC |
| `uvp-protocol/packages/hook-core` | `@uvp-eth/hook-core` | 唯一 TS core adapter、版本断言和产品侧 Hook API | 独立语义实现、DB、Solidity |
| `uvp-protocol/packages/compiler` | `@uvp-eth/compiler` | Zhixu compiler、OnchainHookPlan、commitPlan/finalizePlan 两步注册参数 | hook runtime execution |
| `uvp-protocol/packages/statemachine` | `@uvp-eth/statemachine` | offline chain event replay oracle | contract authorization、HTTP dispatch |
| `uvp-protocol/packages/protocol-bindings` | `@uvp-eth/protocol-bindings` | ABI、EIP-712、calldata、hash helpers | private keys、env、watcher、tx submit |
| `uvp-protocol/contracts/uvp-contracts` | Foundry project | Solidity contracts、ABI fixture、contract tests | backend service code |
| `uvp-protocol/packages/product-dto` | `@uvp-eth/product-dto` | product-facing DTO contracts | React、wallet、storage、chain client |
| `uvp-chain-services/service` | `@uvp-eth/chain-services` | chain indexer、projection、generic read API、可选 relay、proof verifier；详见 [Chain Services](../concepts/services/chain-services.md) | 协议事实源、订单/Store 业务权威 |
| `zhixu-store/registry` | `@uvp-eth/zhixu-registry` | ZhixuRecord / IdentityClaim 登记数据层（permissionless、无审核） | 商店/UI、订单授权、KYC |
| `uvp-order-app/app` | `@uvp-eth/order-app` | 单一参与者流程（开单/邀请/接受/房间） | 订单状态所有权、托管资金 |
| `uvp-client/package` | `@uvp-eth/uvp-client` | core/browser/headless SDK 入口 + executor CLI（watch/signal/doctor/wallet） | privileged backend truth、server |
| `uvp-deploy/deploy` | `@uvp-eth/deploy` | release lane：deploy scripts、manifests、compatibility matrix、release records | external deploy repo（see `uvp-deploy` workspace） |
| `uvp-deploy/qa` | `@uvp-eth/deploy-qa` | QA lane：local Anvil harness、chaos driver、wrapper checks | release records、protocol runtime |
| `uvp-deploy/ops/console-web` | `@uvp-eth/ops-console-web` | operator console prototype | protocol runtime |
| `uvp-periphery` | mixed | funding/payment/guarantee/agent adapters and demos | core protocol truth |

## Workspace Packages

`pnpm-workspace.yaml` includes：

```text
uvp-core/crates/uvp-node
uvp-protocol/packages/hook-core
uvp-protocol/packages/compiler
uvp-protocol/packages/statemachine
uvp-protocol/packages/product-dto
uvp-protocol/packages/protocol-bindings
uvp-chain-services/service
uvp-client/package
uvp-order-app/app
zhixu-store/registry
uvp-deploy/deploy
uvp-deploy/qa
uvp-deploy/ops/*
uvp-periphery/executors/*
```

## 重要文档源

- `README.md`：仓库主状态和当前 MVP。
- 部分子模块内有各自 AGENTS.md（如 `uvp-periphery/AGENTS.md`）。
- `docs/product/README.md`：PRD truth index。
- `docs/IMPLEMENTATION_TRACE.md`：实现追踪。
- `uvp-deploy/deploy/releases/`：release records。
- 各模块 `README.md`：局部运行命令和边界。
