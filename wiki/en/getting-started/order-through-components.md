# One Order Through UVP Components

This is the second read after [One Order Story](one-order-story.md). The first pass lets Zhixu, Order, Executor, Signal, and proof emerge from business facts. This pass keeps the same order in view and maps it onto the code modules and product surfaces it crosses.

That means this page starts using engineering terms such as Plan, compiler, trust registry, state machine, Chain Services, and Product DTO. They are not first-pass vocabulary to memorize; they are component names for how this order lands in the system.

Read it as a guided pass through the system:

1. A Zhixu draft is compiled and endorsed into registrable chain material.
2. A plan and order are registered, along with the permissions that make the order actionable.
3. A participant submits a signal, the state machine evaluates it, and Chain Services projects the result back into product language.

The path below follows that sequence.

```text
Zhixu draft
  -> compile preview and deterministic artifacts
  -> plan/supplier attestation
  -> plan and order registration
  -> order-level signal authorization
  -> Product task or HookReady
  -> Order App / executor-kit signs and submits
  -> UVPStateMachine evaluates hooks
  -> Chain Services replays projections
  -> Product / Store / proof views
```

## Component Path

| Order step | Key question | Stable implementation boundary | Related pages |
| --- | --- | --- | --- |
| Design the Zhixu rulebook | How is this kind of coordination written as a reusable rulebook? | Store workbench and compiler input boundary. | [Core Object Overview](../core/README.md), [Zhixu Store](../store/README.md) |
| Compile into a registrable Plan | How does Zhixu become reproducible on-chain material? | Hook Core semantics and EVM compiler artifacts. | [From Zhixu to a Registrable Plan](../components/semantics-and-compiler.md) |
| Stabilize public interfaces | Who keeps ABI, EIP-712, typed data, and calldata aligned? | Protocol Bindings for ABI, typed data, and hash boundaries. | [Protocol Bindings and Public Interfaces](../components/services-and-interfaces.md) |
| Attest and register | Who proves a plan or supplier is trusted, and who can register a plan or order? | Trust registry, state-machine contracts, and deployment registry. | [Trust Registry and Authorization Boundary](../concepts/trust-and-authorization.md) |
| Create order and permissions | How does one concrete Order bind participants and signal submitters? | Product BFF and order authorization builder. | [Product BFF and Submission Entry](../concepts/architecture/components/chain-services-bff.md) |
| Submit business signals | How do humans, enterprise scripts, or agents sign and submit evidence fingerprints? | Order App and executor-kit signal producer. | [Product BFF and Submission Entry](../concepts/architecture/components/chain-services-bff.md), [Order App](../execution/order-app.md), [Executor Kit](../execution/README.md) |
| Evaluate on chain | How do signals trigger status changes, HookReady, timers, or overlays? | UVPStateMachine and replay oracle. | [UVPStateMachine](../components/onchain-runtime.md) |
| Handle runtime changes | How does one order select or replace an executor, or swap a resource manifest? | Stage overlay contracts and stage-patch service boundary. | [UVPStateMachine](../components/onchain-runtime.md), [Stage Overlay](../concepts/state-machine/stage-overlay.md) |
| Dock a sub-Zhixu | How can one Zhixu act as the executor of another order? | Docking module, signal mapping, and linked-order proof boundary. | [Docked Zhixu Runtime](../concepts/state-machine/docking.md), [Executor Kit](../execution/README.md) |
| Read chain state | How are orders, tasks, timeline, proof, and trust rebuilt from events? | Chain Services indexer, projection, and storage boundary. | [Chain Services](../components/chain-services.md) |
| Translate into product language | What DTOs do ordinary users see as orders, tasks, and proof? | Product DTO and Product API read model. | [Product DTO and User Surfaces](../product/README.md) |
| Store management and notifications | How are Nucleus, operators, suppliers, notifications, and audit organized? | Store API, governance, audit, and notification boundary. | [Zhixu Store](../store/README.md), [Chain Services](../components/chain-services.md) |

Specific directories can move during refactors; use the [Module Map](../reference/module-map.md) when you need workspace locations.

## Read Next

After this page, read [Core Object Overview](../core/README.md). If the object relations are already clear, jump to [From Zhixu to a Registrable Plan](../components/semantics-and-compiler.md), [Protocol Bindings and Public Interfaces](../components/services-and-interfaces.md), [Product BFF and Submission Entry](../concepts/architecture/components/chain-services-bff.md), [UVPStateMachine](../components/onchain-runtime.md), [Chain Services](../components/chain-services.md), [Zhixu Store](../store/README.md), or [Executor Kit](../execution/README.md).
