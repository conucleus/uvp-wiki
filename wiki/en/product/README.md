# Product Language and DTO/API

Product language and DTO/API translate on-chain facts into ordinary Product UI, participant tasks, Product DTO/API, and signal containers. The Product API is provided by [Untrusted Execution Layer: Chain Services](../components/chain-services.md); this directory defines how the Product layer says "order, task, evidence, proof, and trust status," and how these DTOs are consumed by the Store, Order App, executor-kit, and adapters.

```text
chain events
  -> non-trusted execution layer / chain-services replayed projection
  -> Product DTO / Product API
  -> Order App / Store / executor-kit / periphery adapter
```

## Product Surface

| Page | Purpose |
| --- | --- |
| [Product Surfaces](../concepts/product-surfaces.md) | How the Product layer translates chain events into orders, tasks, and proof. |
| [Event Projection](../concepts/product/projections.md) | How to rebuild orders, tasks, timelines, and proof from chain events. |
| [Product DTO](../concepts/product/dto.md) | Order/task/proof/trust DTOs for ordinary users. |
| [Signal Container](../concepts/product/signal-container.md) | The product package for task, evidence, typed data, signature, submit, and proof. |
| [Store and Order App](../concepts/product/apps.md) | How the Store, Order App, executor-kit, and periphery adapters all consume the same Product projection. |
| [Product API Reference](../reference/product-api.md) | The current Product API routes and semantics. |
| [Untrusted Execution Layer: Chain Services](../components/chain-services.md) | The indexer, relayer, proof verifier, and runtime profile that the Product API depends on. |

## Division of Labor with Executors and Store

| Directory | Responsibility |
| --- | --- |
| This directory | DTOs, API routes, product language for task/proof/trust, and the Signal Container data contract. |
| [Executors and Integrations](../execution/README.md) | How Executor Kit, Order App, enterprise scripts, AI/MCP adapters, docked Zhixu, and periphery adapters sign, submit signals, and read proof. |
| [Store](../store/README.md) | Nucleation workbench, Zhixu/Supplier management, trust checks, platform workflow, and operator audit. |

## Current Notes

- Store metadata, drafts, supplier profiles, audit, and JWT sessions belong to the [Store](../store/README.md) context and are part of the Nucleation workbench or platform workflow state.
- The Product API can prepare typed data, verify signatures, call the relayer, and return proof; `UVPStateMachine` authorization is still enforced by the contracts.
- `uvp-order-app` is already an independent participant app boundary, but it has not yet been fully proven through the same Base Sepolia Product API task flow.
- The Product API signal-producer side of executor-kit and the thin MCP adapter belong to [Executors and Integrations](../execution/README.md); production runtime, key governance, and live operator runbooks are written in the execution/operations vocabulary.
