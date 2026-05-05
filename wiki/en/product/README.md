# Product DTO and User Surfaces

Product DTO and user surfaces define the object language ordinary users see: orders, tasks, evidence, proof, participants, trust status, and signal containers. It does not carry indexer, relayer, storage, or HTTP runtime responsibilities; those runtime capabilities belong to [Chain Services](../components/chain-services.md).

```text
chain events
  -> Chain Services replayed projection
  -> Product DTO
  -> Order App / Store / executor-kit
```

## User Surfaces

| Page | Purpose |
| --- | --- |
| [Product Surfaces](../concepts/product-surfaces.md) | How the Product layer translates chain events into orders, tasks, and proof. |
| [Product DTO](../concepts/product/dto.md) | Order/task/proof/trust DTOs for ordinary users. |
| [Signal Container](../concepts/product/signal-container.md) | The product package for task, evidence, typed data, signature, submit, and proof. |
| [Store and Order App](../concepts/product/apps.md) | How the Store, Order App, executor-kit, and periphery adapters all consume the same Product projection. |
| [Product API Reference](../reference/product-api.md) | The current Product API routes and semantics. |

## Boundary with Chain Services

| Layer | Responsibility |
| --- | --- |
| [Chain Services](../components/chain-services.md) | Rebuild projections from chain events and provide Product API, Store API, relayer, proof verifier, and runtime profile. |
| Product DTO and user surfaces | Define how ordinary users and product frontends express order/task/proof/trust, and define the signal-container data contract. |
| [Order App](../execution/order-app.md) / [Executor Kit](../execution/README.md) | Consume Product DTOs, prepare evidence, sign, submit, and read proof. |
| [Zhixu Store](../store/README.md) | Consume Product/Store DTOs and organize nucleation workbench, suppliers, trust, operator workflow, and audit. |

## Boundaries

- Store metadata, drafts, supplier profiles, audit, and JWT sessions belong to the [Store](../store/README.md) context and are part of the Nucleation workbench or platform workflow state.
- The Product API can prepare typed data, verify signatures, call the relayer, and return proof; `UVPStateMachine` authorization is still enforced by the contracts.
- `uvp-order-app` is already an independent participant app boundary, but it has not yet been fully proven through the same Base Sepolia Product API task flow.
- The Product API signal-producer side of executor-kit and the thin MCP adapter belong to [Executor Kit](../execution/README.md); production runtime, key governance, and live operator runbooks belong to execution and operations pages.
