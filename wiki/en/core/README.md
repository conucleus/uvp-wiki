# Core Concepts

Core concepts answer the question “what are the protocol objects.” These objects form the language layer consumed by Store, Product API, Order App, executor-kit, and periphery adapters. `Zhixu` is the transliteration of the underlying Chinese coordination term and means the static coordination definition; `Order` means a runtime instance of a Plan.

```text
Zhixu definition
  -> Nucleation
  -> Supplier / Executor capability and execution network
  -> Source / Signal / Hook / Trigger
  -> File Resources
  -> Plan
  -> Order
  -> Attestation / Authorization / Proof
```

## How to Read This

Start with these basic terms. Zhixu is the static definition, Order is the runtime instance, and the remaining objects serve compilation, authorization, endorsement, execution, and display:

| Subpage | Description |
| --- | --- |
| [Zhixu DSL](../concepts/core/zhixu.md) | The code name and DSL shape for Zhixu, describing task, stage, source, signal, supplier boundaries, and selection rights. |
| [Nucleation](../concepts/core/nucleation.md) | The originating nucleus, designer, and organizer of a Zhixu. |
| [Supplier](../concepts/core/supplier.md) | The capability subject and trust subject registered, tagged, and endorsed by Store. |
| [Executor](../concepts/core/executor.md) | The subject that actually executes or submits signals in a given Order, including a peer Zhixu acting as executor. |
| [Source Causal Chain](../concepts/core/source.md) | The causal context where a signal lives, used to express chaining, branching, and convergence. |
| [Signal](../concepts/core/signal.md) | The smallest business input accepted by the state machine, signed and submitted by an authorized wallet. |
| [Hook](../concepts/core/hook.md) | The rule used to derive stage readiness from signal conditions. |
| [Trigger](../concepts/core/trigger.md) | The special hook marker that decides when `HookReady` is emitted and the execution entry opens. |
| [File Resources](../concepts/core/file-resources.md) | Stage resource handles pointing to off-chain objects, protocol files, or resource manifests. |
| [Plan](../concepts/core/plan.md) | The deterministic artifact compiled from a Zhixu for a target chain. |
| [Order](../concepts/core/order.md) | The dynamic runtime instance of a Plan, holding signals, hook runtime, and overlays. |

Read these sibling chapters next:

| Chapter | Description |
| --- | --- |
| [Architecture](architecture.md) | Module boundaries, dependency direction, source of truth, and data flow. |
| [State Machine](state-machine.md) | How the contract stores signals, evaluates hooks, handles timers, and applies stage overlays; this belongs to the core component flow. |
| [Artifacts and Hashes](artifacts-and-hashes.md) | Compiler artifacts, canonical hashes, stable IDs, and registration parameters. |
| [Trust and Authorization](trust-and-authorization.md) | Trust domains, plan attestation, order-level signal authorization, EIP-712, and relayer boundaries. |
| [Product Surfaces](product-surfaces.md) | How chain-services project chain events into orders, tasks, and proofs readable by ordinary users. |
| [Store](../store/README.md) | How Store gives Nucleation a workbench and organizes Zhixu/Supplier, trust checks, contact notifications, fulfillment records, and platform workflow. |
| [Executors and Integrations](../execution/README.md) | Executor Kit, docked Zhixu, Order App, adapters, and MCP/AI execution entry points. |

## Boundary Checks

- Contracts and chain events determine the real state of plans, orders, signals, hooks, and attestations.
- The indexer database must be rebuildable from events and cannot be the source of truth.
- A relayer may sponsor or forward transactions, but it cannot generate business signatures on behalf of participants.
- Store, Order App, and Product API organize user language and metadata; submissions still go through on-chain authorization.
- Store is a first-class trust/workflow system and is described separately from the ordinary product surfaces.
- Store admin owns platform workflow; Nucleation owns internal Zhixu design; trust domains own external endorsement.
- Executor Kit is the executor integration surface and works around the state machine and Product API.
- USDC, escrow, guarantee, and AI agents belong to adapters or periphery, and they consume signals/proofs around the core interface.
