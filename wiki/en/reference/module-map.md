# Module Map

## Public Repositories

| Repository | Workspace module | Responsibility |
| --- | --- | --- |
| [uvp-core](https://github.com/conucleus/uvp-core) | `uvp-core/` | Rust normative semantic core, golden corpus, and CLI/FFI/N-API adapters. |
| [uvp-protocol](https://github.com/conucleus/uvp-protocol) | `uvp-protocol/` | compiler, HookPlan, state-machine reference, contracts, ABI/EIP-712, Product DTO. |
| [uvp-chain-services](https://github.com/conucleus/uvp-chain-services) | `uvp-chain-services/` | indexer, relayer, proof verifier, Product/Store API, projection, workflow runtime. |
| [zhixu-store](https://github.com/conucleus/zhixu-store) | `zhixu-store/` | Store/workbench frontend, catalog, supplier directory, identity/proof views. |
| [uvp-order-app](https://github.com/conucleus/uvp-order-app) | `uvp-order-app/` | participant Order App, task inbox, evidence/proof display, readiness checks. |
| [uvp-executor-kit](https://github.com/conucleus/uvp-executor-kit) | `uvp-executor-kit/` | executor CLI/SDK/MCP, chain watcher, Product API signal producer, adapter integration. |

## Workspace Modules

| Path | Package | Responsible for | Not responsible for |
| --- | --- | --- | --- |
| `uvp-core/crates/uvp-node` | `@conucleus/uvp-core-node` | versioned Node native artifact for the Rust semantic core | Product API, DB, RPC |
| `uvp-protocol/packages/hook-core` | `@uvp-eth/hook-core` | single TypeScript core adapter, version assertion, and product-facing Hook API | independent semantics, DB, Solidity |
| `uvp-protocol/packages/compiler` | `@uvp-eth/compiler` | Zhixu compiler, OnchainHookPlan, `registerPlan` args | hook runtime execution |
| `uvp-protocol/packages/statemachine` | `@uvp-eth/statemachine` | offline chain event replay oracle | contract authorization, HTTP dispatch |
| `uvp-protocol/packages/protocol-bindings` | `@uvp-eth/protocol-bindings` | ABI, EIP-712, calldata, hash helpers | private keys, env, watcher, tx submit |
| `uvp-protocol/contracts/uvp-contracts` | Foundry project | Solidity contracts, ABI fixture, contract tests | backend service code |
| `uvp-protocol/packages/product-dto` | `@uvp-eth/product-dto` | product-facing DTO contracts | React, wallet, storage, chain client |
| `uvp-chain-services/service` | `@uvp-eth/chain-services` | indexer, relayer, proof verifier, Product/Store APIs; see [Chain Services](../components/chain-services.md) | protocol source of truth |
| `zhixu-store/app` | `@uvp-eth/zhixu-store-web` | Store/workbench frontend | old Go-coupled Store BFF |
| `uvp-order-app/app` | `@uvp-eth/order-app` | participant task/signal console | Store Console, escrow demo |
| `uvp-executor-kit/package` | `@uvp-eth/executor-kit` | executor CLI/SDK/MCP, chain watcher, Product API signal producer | privileged backend truth |
| `uvp-deploy/deploy` | `@uvp-eth/deploy` | deploy scripts, manifests, release records | sibling `/Users/uyhendu/project/uvp-deploy` |
| `uvp-deploy/apps/ops-console-web` | `@uvp-eth/ops-console-web` | operator console prototype | protocol runtime |
| `uvp-periphery` | mixed | funding/payment/guarantee/agent adapters and demos | core protocol truth |

## Workspace Packages

`pnpm-workspace.yaml` includes:

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

## Key Document Sources

- `README.md`: repository main status and current MVP.
- `AGENTS.md`: boundaries and engineering rules.
- `docs/product/README.md`: PRD truth index.
- `docs/IMPLEMENTATION_TRACE.md`: implementation trace.
- `uvp-deploy/deploy/releases/`: release records.
- Each module `README.md`: local run commands and boundaries.
