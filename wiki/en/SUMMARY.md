# Wiki Summary

## Learning Path

- [Wiki Home](README.md)
- [Why UVP](tutorials/why-uvp.md)
- [Learning Path Guide](tutorials/README.md)
- [One Order Story](tutorials/one-order-story.md)
- [Local Anvil and Product Loop](tutorials/local-anvil-loop.md)

## Core Concepts

- [Core Concepts Entry](concepts/README.md)
- [Protocol Boundaries](concepts/protocol-boundaries.md)
  - [Zhixu Store Core Concepts](concepts/core/store.md)
  - [Zhixu DSL](concepts/core/zhixu.md)
  - [Order](concepts/core/order.md)
  - [Signal](concepts/core/signal.md)
  - [Plan](concepts/core/plan.md)
  - [Hook](concepts/core/hook.md)
  - [Trigger](concepts/core/trigger.md)
  - [Source Causal Lane](concepts/core/source.md)
    - [Source Modeling Examples](concepts/core/modeling-examples.md)
  - [Executor](concepts/core/executor.md)
  - [Supplier](concepts/core/supplier.md)
  - [Nucleus / Nucleation](concepts/core/nucleation.md)
  - [File Resources](concepts/core/file-resources.md)

## Architecture and Runtime

- [Architecture Overview](concepts/architecture.md)
- [Data Flow and Source of Truth](concepts/data-flow-and-truth.md)
- [Plan and Order Lifecycle](concepts/lifecycle.md)
- [Compiler and Hook Core](concepts/compiler-and-hooks.md)
- [Contracts and Registries](concepts/contracts-and-registries.md)
- [Product BFF and Submission Entry](concepts/product-bff.md)
- [Periphery and Deploy](concepts/periphery-and-deploy.md)
- [UVPStateMachine and State Machine](concepts/state-machine/README.md)
  - [Hook Evaluation](concepts/state-machine/evaluation.md)
  - [Timers and Status](concepts/state-machine/timers-and-status.md)
  - [Stage Overlay: Executor Patch and Resource Patch](concepts/state-machine/stage-overlay.md)
    - [Executor Patch](concepts/state-machine/executor-patch.md)
    - [Resource Patch](concepts/state-machine/resource-patch.md)
  - [Docked Zhixu Runtime](concepts/state-machine/docking.md)
  - [Event Replay](concepts/state-machine/replay.md)
- [Identity, Publication, and Authorization](concepts/trust/README.md)
  - [Store or external institution](concepts/trust/domains.md)
  - [Signal Authorization](concepts/trust/signal-authorization.md)
  - [EIP-712 and Relayer](concepts/trust/eip712-relayer.md)
  - [Stage Patch Authorization](concepts/trust/stage-patch.md)
- [Artifacts and Hashes](concepts/artifacts-and-hashes.md)
  - [Compiler Input](concepts/artifacts/compiler-input.md)
  - [Canonical Hash](concepts/artifacts/canonical-hashes.md)
  - [On-chain Registration Parameters](concepts/artifacts/solidity-registration.md)
- [Chain Services](concepts/services/chain-services.md)
  - [Indexer and Projections](concepts/services/indexer-projections.md)
  - [Submissions and Stage Patch](concepts/services/submissions-stage-patch.md)
  - [Storage, Migration, and Runtime Profile](concepts/services/storage-runtime.md)
  - [Product API](concepts/services/product-api.md)
  - [Relayer](concepts/services/relayer.md)
  - [Evidence, Proof, and File Resource](concepts/services/evidence-proof.md)
  - [Store Console, Supplier, and Governance API](concepts/services/store-api.md)
  - [Notifications and Reconcile](concepts/services/notifications-reconcile.md)
  - [API Routes](concepts/services/api-routes.md)

## Product Surfaces

- [Product DTO and User Surfaces](concepts/product/README.md)
  - [Product DTO](concepts/product/dto.md)
  - [Signal Container](concepts/product/signal-container.md)
  - [Event Projections](concepts/product/projections.md)
  - [Store and Order App](concepts/product/apps.md)
- [Zhixu Store Workbench](concepts/store/README.md)
  - [Zhixu Catalog, Configuration, and Publication](concepts/store/zhixu-management.md)
  - [Supplier Directory, Capabilities, and Contacts](concepts/store/supplier-directory.md)
  - [Fulfillment Status, Proof, and Trust Checks](concepts/store/runtime-proof.md)
  - [Contacts and Notifications](concepts/store/contact-notifications.md)
  - [Operator Permissions, Governance, and Audit](concepts/store/governance-audit.md)
  - [Docking Sandbox and signalMap](concepts/store/docking-sandbox.md)
- [Order App](concepts/apps/order-app.md)
- [Executor Kit](concepts/apps/executor-kit.md)
- [Order App vs Executor Kit](concepts/apps/order-app-vs-executor-kit.md)
- [Zhixu as Executor](concepts/apps/zhixu-as-executor.md)

## How-To

- [Quick Start](how-to/quick-start.md)
- [Daily Development](how-to/development.md)
- [Run Services and Frontends](how-to/run-services-and-apps.md)
- [Base Sepolia Staging](how-to/base-sepolia-staging.md)
- [Release and Verification](how-to/release-checklist.md)
- [Troubleshooting](how-to/troubleshooting.md)

## Reference

- [Version and Semantics Matrix](reference/version-matrix.md)
- [Public Interfaces](reference/public-interfaces.md)
- [Contracts and Events](reference/contracts-and-events.md)
- [Product API Reference](reference/product-api.md)
- [CLI and Configuration](reference/cli-and-config.md)
- [Module Map](reference/module-map.md)
- [Glossary](reference/glossary.md)

## Project Meta

- [Project Status](meta/status.md)
- [Deploy and Evidence](meta/deploy-release.md)
- [Documentation Rules](meta/documentation-rules.md)
- [Epilogue: The Zeroth Understander](meta/epilogue.md)
