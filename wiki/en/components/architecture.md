# Component Chain and Module Boundaries

This page is not a loose index. It is the assembly view of the core components. It helps engineers decide where a given state comes from, where the code should live, and which interfaces are affected by a change.

## Component Bus

| Layer | Code entry | Fact or interface |
| --- | --- | --- |
| DSL/semantics | `uvp-protocol/packages/hook-core/`, `uvp-protocol/packages/compiler/` | Hook expression, HookPlan, OnchainHookPlan, planId/planHash. |
| On-chain execution | `uvp-protocol/contracts/uvp-contracts/` | ABI, events, EIP-712 domain, `UVPStateMachine`, `ZhixuTrustRegistry`. |
| Replay/reference | `uvp-protocol/packages/statemachine/` | reference reducer, event replay, runtime semantic tests. |
| Bindings | `uvp-protocol/packages/protocol-bindings/` | browser-safe ABI, typed-data builders, hash helpers, calldata builders. |
| Non-trusted execution layer | `uvp-chain-services/service/` | forkable off-chain indexer, projection, relayer boundary, proof verifier, Product/Store API. |
| Product language | `uvp-protocol/packages/product-dto/` | Product order/task/proof/trust DTO. |
| Store/Product UIs | `zhixu-store/app/`, `uvp-order-app/app/` | Store workbench, participant task UI, proof display. |
| Execution tools | `uvp-executor-kit/package/` | CLI/SDK/MCP signal producer. |
| Deploy/evidence | `uvp-deploy/deploy/` | deployment manifests, release records, staging gates. |
| Periphery | `uvp-periphery/` | payment/funding/guarantee/agent adapters and demos. |

## Architecture Main Line

```text
core objects
  -> semantic/compiler components
  -> contracts and registries
  -> chain events
  -> replay/non-trusted execution projections
  -> Store / Product / execution surfaces
```

Full reading list:

| Page | What it solves |
| --- | --- |
| [Architecture Overview](../concepts/architecture.md) | The system is layered into protocol core, chain services, product surfaces, executor tools, deployment records, and periphery adapters. |
| [Module Boundaries](../concepts/architecture/modules.md) | What each workspace directory owns, and which boundaries must not be crossed. |
| [Data Flow and Source of Truth](../concepts/architecture/flow-and-truth.md) | Which states must come from chain, and which are only reconstructable projections or operational aids. |
| [Local to On-chain Path](../concepts/architecture/lifecycle.md) | The full lifecycle from Zhixu compilation and plan attestation to Product DTOs. |
| [Module Map](../reference/module-map.md) | Quick reference for packages, responsibilities, and forbidden responsibilities. |

## Architecture Rules

- Contracts and chain events are the source of truth for plan, order, signal, hook, attestation, and deployment cutover.
- Store, Product API, Order App, and executor-kit may only consume, project, display, relay, or submit authorized actions.
- The indexer and durable database must be rebuildable from events and cannot become protocol sources of truth.
- Periphery may implement funding, guarantee, payment, or agent adapters, but it must consume the core interfaces.
- Any cross-module change must check whether ABI, event, typed data, canonical hash, DTO, CLI, and release evidence have drifted.
