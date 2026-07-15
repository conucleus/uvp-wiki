# Engineering Architecture Entry Point

The engineering architecture page helps developers decide where code should live, where state comes from, and which modules a change will affect.

## Architecture Main Line

| Page | Purpose |
| --- | --- |
| [Architecture](../concepts/architecture.md) | the overall layering of protocol core, chain services, product surfaces, executor tools, deployment records, and periphery. |
| [Module Boundaries](../concepts/architecture/modules.md) | what each workspace directory owns, and which interfaces are public boundaries. |
| [Data Flow and Source of Truth](../concepts/architecture/flow-and-truth.md) | which states must come from chain, and which are only reconstructable projections or operational aids. |
| [Local to On-chain Path](../concepts/architecture/lifecycle.md) | the full lifecycle from Zhixu compilation and plan publication to Product DTOs. |
| [Module Map](../reference/module-map.md) | quick reference for workspace packages, responsibilities, and forbidden responsibilities. |

## Component Boundaries

| Page | Component |
| --- | --- |
| [Compiler and Hook Core](../concepts/architecture/components/compiler-hook-core.md) | Hook DSL parser/evaluator, compiler, deterministic artifacts. |
| [Contracts and Registries](../concepts/architecture/components/contracts-registries.md) | `UVPStateMachine`, `UVPIdentityRegistry`, `UVPDeploymentRegistry`. |
| [Product BFF](../concepts/architecture/components/chain-services-bff.md) | order draft, invite, participant confirmation, authorization, and registration workflow. |
| [Store and Governance](../concepts/architecture/components/store-governance.md) | Store Console, governance handoff, supplier directory. |
| [Order App and Executor Kit](../concepts/architecture/components/order-app-executor-kit.md) | participant app, executor CLI/SDK, AI/MCP adapter boundary. |
| [Periphery and Deployment](../concepts/architecture/components/periphery-deploy.md) | funding/guarantee/payment/agent adapters, deploy scripts, and release records. |

## Common Engineering Paths

| Task | Read first |
| --- | --- |
| Local development and testing | [Daily Development](../tasks/development.md) |
| Run services and frontends | [Run Services and Frontends](../tasks/run-services-and-apps.md) |
| Run the protocol Anvil loop | [Local Anvil Protocol Loop](../tutorials/local-anvil.md) |
| Run the Product local loop | [Product Local Loop](../tutorials/product-local-loop.md) |
| Prepare Base Sepolia | [Base Sepolia Staging](../tasks/base-sepolia-staging.md) |
| Judge a release claim | [Release and Verification](../operations/release-and-verification.md) |
| Troubleshoot | [Troubleshooting](../operations/troubleshooting.md) |

## Impact Surface of Changes

- If you change ABI, events, selectors, EIP-712, canonical hashes, or artifact schemas, handle them per [Public Interfaces](../reference/public-interfaces.md).
- If you change Product DTO or Product API, update chain-services, Store, Order App, executor-kit, and related tests.
- If you change staging/release gates, update the release evidence rules under `uvp-deploy/deploy/releases/` and the staging/release pages in this Wiki.
- If you change funding, payment, guarantee, or agent adapters, keep them under `uvp-periphery/` and prove that they consume the core interfaces instead of rewriting core state.
