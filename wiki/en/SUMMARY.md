# Wiki Summary

## Learn UVP

- [Wiki Entry](README.md)
- [One Order Story](getting-started/one-order-story.md)
- [Actor Map](getting-started/actor-map.md)
- [Evidence and Proof Path](getting-started/evidence-proof-path.md)
- [Glossary](reference/glossary.md)
- [Reader Entry](getting-started/README.md)

## Product and Store

- [Product Language and DTO/API](product/README.md)
- [Product Surfaces](concepts/product-surfaces.md)
  - [Event Projection](concepts/product/projections.md)
  - [Product DTO](concepts/product/dto.md)
  - [Signal Container](concepts/product/signal-container.md)
  - [Store and Order App](concepts/product/apps.md)
- [Store Entry](store/README.md)
  - [Store Authority Boundary and Information Architecture](store/authority-and-ia.md)
  - [Nucleation Workbench](store/nucleation-workbench.md)
  - [Zhixu Catalog, Configuration, and Release](store/zhixu-management.md)
  - [Supplier Registry, Capability, and Contact](store/supplier-registry.md)
  - [Fulfillment Status, Proof, and Trust Checks](store/runtime-proof.md)
  - [Contact and Notifications](store/contact-notifications.md)
  - [Operator Permissions, Governance, and Audit](store/governance-audit.md)
- [Executors and Integrations Entry](execution/README.md)
  - [Executor Kit](execution/executor-kit.md)
  - [Order App and Executor Kit](concepts/architecture/components/order-app-executor-kit.md)

## Core Protocol Concepts

- [Core Concepts Entry](core/README.md)
- [Core Object Overview](concepts/overview.md)
  - [Zhixu DSL](concepts/core/zhixu.md)
  - [Plan](concepts/core/plan.md)
  - [Order](concepts/core/order.md)
  - [Nucleation](concepts/core/nucleation.md)
  - [Supplier](concepts/core/supplier.md)
  - [Executor](concepts/core/executor.md)
  - [Source Causal Chain](concepts/core/source.md)
  - [Signal](concepts/core/signal.md)
  - [Hook](concepts/core/hook.md)
  - [Trigger](concepts/core/trigger.md)
  - [File Resources](concepts/core/file-resources.md)
- [Trust and Authorization](concepts/trust-and-authorization.md)
  - [Trust Domain](concepts/trust/domains.md)
  - [Signal Authorization](concepts/trust/signal-authorization.md)
  - [EIP-712 and Relayer](concepts/trust/eip712-relayer.md)

## Advanced Composition

- [Stage Overlay](concepts/state-machine/stage-overlay.md)
- [Stage Patch Authorization](concepts/trust/stage-patch.md)
- [Docked Zhixu and signalMap](execution/zhixu-as-executor.md)
- [Docking Sandbox](store/docking-sandbox.md)
- [Periphery and Adapters](concepts/architecture/components/periphery-deploy.md)
- [Protocol Mainline Legacy Entry](protocol/README.md)
- [Plan and Order Compatibility Entry](concepts/core/plan-order.md)
- [Store Core Side View](concepts/core/store.md)

## Engineering Components

- [Core Components Entry](components/README.md)
- [Component Flow and Module Boundaries](components/architecture.md)
- [Semantics, Hook Core, and Compiler](components/semantics-and-compiler.md)
  - [Hook Core and Compiler](concepts/architecture/components/compiler-hook-core.md)
  - [Artifacts and Hashes](concepts/artifacts-and-hashes.md)
  - [Compiler Input](concepts/artifacts/compiler-input.md)
  - [Canonical Hashes](concepts/artifacts/canonical-hashes.md)
  - [Onchain Registration Parameters](concepts/artifacts/solidity-registration.md)
- [Onchain Execution, State Machine, and Replay](components/onchain-runtime.md)
  - [Contracts and Registries](concepts/architecture/components/contracts-registries.md)
  - [State Machine](concepts/state-machine.md)
  - [Hook Evaluation](concepts/state-machine/evaluation.md)
  - [Timers and Status](concepts/state-machine/timers-and-status.md)
  - [Event Replay](concepts/state-machine/replay.md)
- [Rebuildable Service Layer: Chain Services](components/chain-services.md)
  - [Indexer and Projections](components/chain-services-indexer-projections.md)
  - [Relayer](components/chain-services-relayer.md)
  - [Submissions and Stage Patch](components/chain-services-submissions-stage-patch.md)
  - [Evidence, Proof, and File Resource](components/chain-services-evidence-proof.md)
  - [Product API](components/chain-services-product-api.md)
  - [Product BFF](concepts/architecture/components/chain-services-bff.md)
  - [Store Console, Supplier, and Governance API](components/chain-services-store-api.md)
  - [Notifications and Reconcile](components/chain-services-notifications-reconcile.md)
  - [Storage, Migration, and Runtime Profile](components/chain-services-storage-runtime.md)
  - [API Routes](components/chain-services-api-routes.md)
- [Services and Interfaces](components/services-and-interfaces.md)
- [Module Map](reference/module-map.md)
- [Engineering Architecture Entry Point](engineering/README.md)
- [Architecture](concepts/architecture.md)
  - [Module Boundaries](concepts/architecture/modules.md)
  - [Data Flow and Source of Truth](concepts/architecture/flow-and-truth.md)
  - [Local-to-Chain Path](concepts/architecture/lifecycle.md)
  - [Store and Governance](concepts/architecture/components/store-governance.md)
  - [Chain Services BFF](concepts/architecture/components/chain-services-bff.md)

## Local / Staging / Release

- [Quick Start](getting-started/quick-start.md)
- [Daily Development](tasks/development.md)
- [Run Services and Frontends](tasks/run-services-and-apps.md)
- [Local Anvil Protocol Loop](tutorials/local-anvil.md)
- [Product Local Loop](tutorials/product-local-loop.md)
- [Base Sepolia Staging](tasks/base-sepolia-staging.md)
- [Deployment and Evidence](components/deploy-release.md)
- [Release and Verification](operations/release-and-verification.md)
- [Troubleshooting](operations/troubleshooting.md)

## Reference and Evidence

- [Public Interfaces](reference/public-interfaces.md)
- [Contracts and Events](reference/contracts-and-events.md)
- [Product API](reference/product-api.md)
- [CLI and Config](reference/cli-and-config.md)
- [Project Status](status/README.md)

## Contribution

- [Documentation Rules](contribute/documentation-rules.md)
