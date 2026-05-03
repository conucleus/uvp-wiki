# Module Boundaries

This repository is split into modules by responsibility. When deciding where a change belongs, first ask whether it defines protocol facts, projects chain facts, presents product language, or implements a periphery adapter.

## Protocol Layer

| Module | Responsibility |
| --- | --- |
| `uvp-protocol/packages/hook-core` | Hook DSL parsing, dependency extraction, and local semantic evaluation. |
| `uvp-protocol/packages/compiler` | Compilation from Zhixu to HookPlan, on-chain artifacts, and `registerPlan` parameters. |
| `uvp-protocol/packages/statemachine` | Platform-neutral reducer, chain-event replay oracle, and semantic regression tests. |
| `uvp-protocol/packages/protocol-bindings` | Browser-safe ABI, EIP-712, calldata, and hash helpers. |
| `uvp-protocol/contracts/uvp-contracts` | Solidity contracts, ABI fixtures, deployment scripts, and contract tests. |

These modules define the public protocol interface. Changes to ABI, events, typed data, canonical hashes, or artifact schemas must be treated as protocol changes.

## Service Layer

| Module | Responsibility |
| --- | --- |
| `uvp-chain-services/service` | Indexer, relayer, proof verifier, Product API, and Store API. |
| `uvp-protocol/packages/product-dto` | Shared DTO contract for Product API, Store, and Order App. |

The service layer may cache and project, but its databases must be rebuildable from chain events. `miniprogram-backend`, any external database, or any HTTP service can only act as a read model or workflow, not as the source of truth for plan/order/signal/hook.

## Product and Executor

| Module | Responsibility |
| --- | --- |
| `zhixu-store/app` | Store/workbench prototype for order creation, task review, chain proofs, and trust attestation display. |
| `uvp-order-app/app` | Ordinary participant app for invite onboarding, task inbox, evidence fingerprints, and proof display. |
| `uvp-executor-kit/package` | CLI and SDK for executors. |

These surfaces consume DTOs, signing requests, or chain events. They improve UX; contract authorization remains the submission gate.

## Deployment and Periphery

| Module | Responsibility |
| --- | --- |
| `uvp-deploy/deploy` | This repository’s own deployment scripts, environment manifests, and release records. |
| `uvp-periphery` | Escrow, payment, guarantee, agent, and demo adapters. |

Deployment state must stay in this repository and must not depend on the sibling `/Users/uyhendu/project/uvp-deploy` repository. Funding, guarantee, and agent integrations belong to the periphery, which must consume the core state machine through interfaces.
