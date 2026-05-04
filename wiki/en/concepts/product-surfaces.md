# Product Surfaces

Product surfaces translate on-chain facts into order, task, proof, and trust information that people can actually use. They project events from `UVPStateMachine` and `ZhixuTrustRegistry` into DTOs consumed by the Product API, Store, and Order App; protocol state is still decided by on-chain events.

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
| [Event Projection](product/projections.md) | How the indexer rebuilds order / task / timeline / proof from events. |
| [Product DTO](product/dto.md) | How `ProductOrderDTO` and `ProductTaskDTO` hide hook and ABI details. |
| [Signal Container](product/signal-container.md) | How a single authorized business action is wrapped into task, evidence, signing, submission, and proof. |
| [Store and Order App](product/apps.md) | What Store, the ordinary participant app, and executor-kit should each display or submit. |

## Product Language and Protocol Language

| Protocol language | Product surfaces can say |
| --- | --- |
| `OrderRegistered` | The order has been created and is waiting for participant or task progress. |
| `SignalSubmitterAuthorized` | A participant is allowed to submit a certain kind of action. |
| `HookReady` | A task is ready to be handled. |
| `SignalSubmitted` | A participant has submitted a credential fingerprint or confirmation action. |
| `HookStatusChanged` | The condition is waiting, ready, cancelled, or still unsatisfied. |

Ordinary users mainly see orders, tasks, participants, evidence, and proof. `sourceId`, `signalId`, `hookId`, gas, ABI, or trust-domain internals can live in advanced proof views for service verifiability.

## Product Surface Data Flow

The correct relation for product surfaces is:

```text
chain events
  -> rebuildable projections
  -> Product DTOs
  -> Store / Order App / executor-kit
```

If the Product API returns a state that cannot be traced back to event provenance or to metadata explicitly marked by Store, it should be treated as a product read model or workflow state.
