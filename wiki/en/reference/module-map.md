---
title: Module Map
type: reference
audience: 工程贡献者
status: verified
---

# Module Map

## Public Repositories

| Repository | Workspace module | Responsibility |
| --- | --- | --- |
| [uvp-core](https://github.com/conucleus/uvp-core) | `uvp-core/` | Rust normative semantic core, golden corpus, CLI/FFI/N-API adapters. |
| [uvp-protocol](https://github.com/conucleus/uvp-protocol) | `uvp-protocol/` | compiler, HookPlan, state-machine reference, contracts, ABI/EIP-712, Product DTO. |
| [uvp-chain-services](https://github.com/conucleus/uvp-chain-services) | `uvp-chain-services/` | chain indexer, projection, generic read API, optional relay, proof verifier, chain health. |
| [zhixu-store](https://github.com/conucleus/zhixu-store) | `zhixu-store/` | hosts `@uvp-eth/zhixu-registry`: a permissionless ZhixuRecord / IdentityClaim data layer (no UI, no review). |
| [uvp-order-app](https://github.com/conucleus/uvp-order-app) | `uvp-order-app/` | single participant flow: wallet session, order draft/invite/finalize, order room. |
| [uvp-client](https://github.com/conucleus/uvp-client) | `uvp-client/` | four public entries (core/browser/headless/cli): transport, Product V3 client, EIP-1193 wallet, watcher, executor CLI. |

## Workspace Modules

| Path | Package | Responsible for | Not responsible for |
| --- | --- | --- | --- |
| `uvp-core/crates/uvp-node` | `@conucleus/uvp-core-node` | versioned Node native artifact of the Rust semantic core | Product API, DB, RPC |
| `uvp-protocol/packages/hook-core` | `@uvp-eth/hook-core` | single TS core adapter, version assertion, and product-facing Hook API | independent semantics implementations, DB, Solidity |
| `uvp-protocol/packages/compiler` | `@uvp-eth/compiler` | Zhixu compiler, OnchainHookPlan, commitPlan/finalizePlan two-step registration args | hook runtime execution |
| `uvp-protocol/packages/statemachine` | `@uvp-eth/statemachine` | offline chain event replay oracle | contract authorization, HTTP dispatch |
| `uvp-protocol/packages/protocol-bindings` | `@uvp-eth/protocol-bindings` | ABI, EIP-712, calldata, hash helpers | private keys, env, watcher, tx submit |
| `uvp-protocol/contracts/uvp-contracts` | Foundry project | Solidity contracts, ABI fixtures, contract tests | backend service code |
| `uvp-protocol/packages/product-dto` | `@uvp-eth/product-dto` | product-facing DTO contracts | React, wallet, storage, chain client |
| `uvp-chain-services/service` | `@uvp-eth/chain-services` | chain indexer, projection, generic read API, optional relay, proof verifier; see [Chain Services](../concepts/services/chain-services.md) | protocol source of truth, order/store business authority |
| `zhixu-store/registry` | `@uvp-eth/zhixu-registry` | ZhixuRecord / IdentityClaim registry data layer (permissionless, no review) | storefront/UI, order authorization, KYC |
| `uvp-order-app/app` | `@uvp-eth/order-app` | single participant flow (create/invite/accept/room) | order-state ownership, custody |
| `uvp-client/package` | `@uvp-eth/uvp-client` | core/browser/headless SDK entries + executor CLI (watch/signal/doctor/wallet) | privileged backend truth, server |
| `uvp-deploy/deploy` | `@uvp-eth/deploy` | release lane: deploy scripts, manifests, compatibility matrix, release records | external deploy repo (see the `uvp-deploy` workspace) |
| `uvp-deploy/qa` | `@uvp-eth/deploy-qa` | QA lane: local Anvil harness, chaos driver, wrapper checks | release records, protocol runtime |
| `uvp-deploy/ops/console-web` | `@uvp-eth/ops-console-web` | operator console prototype | protocol runtime |
| `uvp-periphery` | mixed | funding/payment/guarantee/agent adapters and demos | core protocol truth |

## Workspace Packages

`pnpm-workspace.yaml` includes:

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

## Key Document Sources

- `README.md`: repository main status and current MVP.
- Some submodules have their own AGENTS.md (e.g. `uvp-periphery/AGENTS.md`).
- `docs/product/README.md`: PRD truth index.
- `docs/IMPLEMENTATION_TRACE.md`: implementation trace.
- `uvp-deploy/deploy/releases/`: release records.
- Each module's `README.md`: local run commands and boundaries.
