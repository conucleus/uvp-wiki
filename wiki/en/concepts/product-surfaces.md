# Product Surfaces

Product surfaces define the language ordinary users and product frontends see: orders, tasks, proof, participants, evidence, and trust status. Event rebuilding, indexing, and HTTP runtime belong to [Chain Services](../components/chain-services.md); product surfaces focus on how those projections become DTOs consumed by Store, Order App, and executor-kit.

The most important translation is from DSL stage to Product task:

```text
stage.receiveSignals
  -> compiled Hook
  -> trigger=true
  -> HookReady
  -> ProductTaskDTO
  -> user or executor submits a Signal
  -> Product proof row
```

## Subpages

| Subpage | Description |
| --- | --- |
| [Product DTO](product/dto.md) | How `ProductOrderDTO` and `ProductTaskDTO` hide hook and ABI details. |
| [Signal Container](product/signal-container.md) | How a single authorized business action is wrapped into task, evidence, signing, submission, and proof. |
| [Store and Order App](product/apps.md) | Display and submission boundaries for Store, the ordinary participant app, and executor-kit. |

## Product Language and Protocol Language

| Protocol language | Product surfaces can say |
| --- | --- |
| `OrderRegistered` | The order has been created and is waiting for participant or task progress. |
| `SignalSubmitterAuthorized` | A participant is allowed to submit a certain kind of action. |
| `HookReady` | A task is ready to be handled. |
| `SignalSubmitted` | A participant has submitted a credential fingerprint or confirmation action. |
| `HookStatusChanged` | The condition is waiting, ready, cancelled, or still unsatisfied. |

Ordinary users mainly see orders, tasks, participants, evidence, and proof. `sourceId`, `signalId`, `hookId`, gas, ABI, or Store or external institution internals can live in advanced proof views for service verifiability.

## Product Surface Data Flow

The correct relation for product surfaces is:

```text
Chain Services projection
  -> Product DTOs
  -> Store / Order App / executor-kit / periphery adapter
```

If the Product API returns a state that cannot be traced back to event provenance or to metadata explicitly marked by Store, it belongs to a product read model or workflow state.
