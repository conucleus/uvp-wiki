# One Order Through UVP Components

This is the second read after [One Order Story](one-order-story.md). The first pass lets Zhixu, Order, Signal, and Proof emerge from business facts. This pass keeps the same order in view and maps it onto the code modules and product surfaces it crosses.

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

| Order step | Key question | Current code entry | Related pages |
| --- | --- | --- | --- |
| Design the Zhixu rulebook | How is this kind of coordination written as a reusable rulebook? | `zhixu-store/app/src/store/`, `uvp-protocol/packages/compiler/src/zhixu-loader.ts` | [Core Object Overview](../core/README.md), [Zhixu Store](../store/README.md) |
| Compile into a registrable Plan | How does Zhixu become reproducible on-chain material? | `uvp-protocol/packages/hook-core/src/`, `uvp-protocol/packages/compiler/src/` | [From Zhixu to a Registrable Plan](../components/semantics-and-compiler.md) |
| Stabilize public interfaces | Who keeps ABI, EIP-712, typed data, and calldata aligned? | `uvp-protocol/packages/protocol-bindings/src/` | [Protocol Bindings and Public Interfaces](../components/services-and-interfaces.md) |
| Attest and register | Who proves a plan or supplier is trusted, and who can register a plan or order? | `ZhixuTrustRegistry.sol`, `UVPStateMachine.sol`, `UVPDeploymentRegistry.sol` | [Trust Registry and Authorization Boundary](../concepts/trust-and-authorization.md) |
| Create order and permissions | How does one concrete Order bind participants and signal submitters? | `uvp-chain-services/service/src/product/bff/`, `uvp-chain-services/service/src/submissions/` | [Product BFF and Submission Entry](../concepts/architecture/components/chain-services-bff.md) |
| Submit business signals | How do humans, enterprise scripts, or agents sign and submit evidence fingerprints? | `uvp-order-app/app/src/`, `uvp-executor-kit/package/src/` | [Product BFF and Submission Entry](../concepts/architecture/components/chain-services-bff.md), [Order App](../execution/order-app.md), [Executor Kit](../execution/README.md) |
| Evaluate on chain | How do signals trigger status changes, HookReady, timers, or overlays? | `uvp-protocol/contracts/uvp-contracts/src/`, `uvp-protocol/packages/statemachine/src/` | [UVPStateMachine](../components/onchain-runtime.md) |
| Handle runtime changes | How does one order select or replace an executor, or swap a resource manifest? | `UVPStagePatchModule.sol`, `uvp-chain-services/service/src/stage-patches/` | [UVPStateMachine](../components/onchain-runtime.md), [Stage Overlay](../concepts/state-machine/stage-overlay.md) |
| Dock a sub-Zhixu | How can one Zhixu act as the executor of another order? | `UVPDockingModule.sol`, `uvp-protocol/packages/protocol-bindings/src/`, `zhixu-store/app/src/store/StoreDockingPage.tsx` | [Docked Zhixu Runtime](../concepts/state-machine/docking.md), [Executor Kit](../execution/README.md) |
| Read chain state | How are orders, tasks, timeline, proof, and trust rebuilt from events? | `uvp-chain-services/service/src/indexer/`, `uvp-chain-services/service/src/storage/`, `uvp-chain-services/service/src/product/` | [Chain Services](../components/chain-services.md) |
| Translate into product language | What DTOs do ordinary users see as orders, tasks, and proof? | `uvp-protocol/packages/product-dto/src/`, `uvp-chain-services/service/src/api/routes/product-read.ts` | [Product DTO and User Surfaces](../product/README.md) |
| Store management and notifications | How are Nucleation, operators, suppliers, notifications, and audit organized? | `uvp-chain-services/service/src/store-console/`, `src/store-suppliers/`, `src/governance/`, `src/notifications/` | [Zhixu Store](../store/README.md), [Chain Services](../components/chain-services.md) |

## Do Not Confuse

- Store draft, review, audit, contact, and notification are workflow or projection state, not on-chain facts.
- Chain Services can prepare typed data, verify signatures, relay transactions, and project proof, but it cannot create business signatures for participants.
- Product DTO is ordinary user language; contracts, events, EIP-712, ABI, and canonical hashes remain public interfaces.
- Order App and executor-kit are two signal producer surfaces: one for humans, one for scripts, enterprise systems, and supervised agents.

## Read Next

After this page, read [Core Object Overview](../core/README.md). If the object relations are already clear, jump to [From Zhixu to a Registrable Plan](../components/semantics-and-compiler.md), [Protocol Bindings and Public Interfaces](../components/services-and-interfaces.md), [Product BFF and Submission Entry](../concepts/architecture/components/chain-services-bff.md), [UVPStateMachine](../components/onchain-runtime.md), [Chain Services](../components/chain-services.md), [Zhixu Store](../store/README.md), or [Executor Kit](../execution/README.md).
