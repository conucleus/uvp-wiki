---
title: Module Map
type: reference
audience: 工程贡献者
status: verified
---

# Module Map

## Public Repositories

| Repository | Module | Responsibility |
| --- | --- | --- |
| [uvp-core](https://github.com/conucleus/uvp-core) | `uvp-core/` | Rust canonical semantics core, golden corpus, CLI/FFI/N-API adapters. |
| [uvp-protocol](https://github.com/conucleus/uvp-protocol) | `uvp-protocol/` | Compiler, HookPlan, state-machine reference, contracts, ABI/EIP-712, chain-read contract. |
| [uvp-chain-services](https://github.com/conucleus/uvp-chain-services) | `uvp-chain-services/` | Chain indexer, projection, generic read API, optional relay, proof verifier, chain health. |
| [zhixu-store](https://github.com/conucleus/zhixu-store) | `zhixu-store/` | Hosts `@uvp-eth/zhixu-registry`: permissionless ZhixuRecord registration data layer (no UI, no review). |
| [uvp-order-app](https://github.com/conucleus/uvp-order-app) | `uvp-order-app/` | Single participant flow: wallet session, order draft/invite/finalize, order room. |
| [uvp-client](https://github.com/conucleus/uvp-client) | `uvp-client/` | Four public client entries (core/browser/headless/cli): transport, browser wallet client, EIP-1193 wallet, watcher, executor CLI. |

## Workspace Modules

| Path | Package | Responsibility | Not responsible for |
| --- | --- | --- | --- |
| `uvp-core/crates/uvp-node` | `@conucleus/uvp-core-node` | Versioned Node native artifact of the Rust semantic core | Product API, DB, RPC |
| `uvp-protocol/packages/hook-core` | `@uvp-eth/hook-core` | The only TS core adapter, version assertions, product-side Hook API | Independent semantics, DB, Solidity |
| `uvp-protocol/packages/compiler` | `@uvp-eth/compiler` | Zhixu compiler, OnchainHookPlan, commitPlan/finalizePlan registration parameters | Hook runtime execution |
| `uvp-protocol/packages/statemachine` | `@uvp-eth/statemachine` | Offline chain-event replay oracle | Contract authorization, HTTP dispatch |
| `uvp-protocol/packages/canonical-json` | `@uvp-eth/canonical-json` | Canonical JSON/hash primitives, single implementation | Domain hashes, business rules |
| `uvp-protocol/packages/chain-read-contract` | `@uvp-eth/chain-read-contract` | Single source for `/chain/*` wire DTOs and runtime decoders | Business DTOs, DB/projection internal models |
| `uvp-protocol/packages/service-runtime` | `@uvp-eth/service-runtime` | Shared Node service primitives (address/hex, display, log redaction, JSON bigint, PG row) | Business rules, protocol semantics |
| `uvp-protocol/packages/protocol-bindings` | `@uvp-eth/protocol-bindings` | ABI, EIP-712, calldata, hash helpers | Private keys, env, watcher, tx submit |
| `uvp-protocol/contracts/uvp-contracts` | Foundry project | Solidity contracts, ABI fixtures, contract tests | Backend service code |
| `uvp-chain-services/service` | `@uvp-eth/chain-services` | Chain indexer, projection, generic read API, optional relay, proof verifier; see [Chain Services](../concepts/services/chain-services.md) | Protocol fact source, order/Store business authority |
| `zhixu-store/registry` | `@uvp-eth/zhixu-registry` | ZhixuRecord registration data layer (permissionless, no review) | Store/UI, order authorization, KYC, identity registry |
| `uvp-order-app/app` | `@uvp-eth/order-app` | Single participant flow (order draft/invite/accept/room) | Order-state ownership, escrowed funds |
| `uvp-client/package` | `@uvp-eth/uvp-client` | core/browser/headless SDK entries + executor CLI (watch/signal/doctor/wallet) | Privileged backend truth, server |
| `uvp-deploy/deploy` | `@uvp-eth/deploy` | Release lane: deploy scripts, manifests, compatibility matrix, release records | External deploy repo (see `uvp-deploy` workspace) |
| `uvp-deploy/qa` | `@uvp-eth/deploy-qa` | QA lane: local Anvil harness, chaos driver, wrapper checks | Release records, protocol runtime |
| `uvp-deploy/ops/console-web` | `@uvp-eth/ops-console-web` | Operator console prototype | Protocol runtime |

## Workspace Packages

`pnpm-workspace.yaml` includes:

```text
uvp-core/crates/uvp-node
uvp-protocol/packages/*
uvp-chain-services/service
uvp-client/package
uvp-order-app/app
zhixu-store/registry
uvp-deploy/deploy
uvp-deploy/qa
uvp-deploy/ops/*
```

## Important Documentation Sources

- `README.md`: repository state and current MVP.
- Some submodules have their own AGENTS.md (e.g. `uvp-protocol/AGENTS.md`).
- `docs/IMPLEMENTATION_TRACE.md`: current implementation boundaries.
- `uvp-deploy/deploy/releases/`: release records.
- Each module's `README.md`: local run commands and boundaries.
