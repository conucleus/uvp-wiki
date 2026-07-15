# Core Concepts

The core of `uvp-eth` is a state machine protocol that brings Zhixu coordination rulebooks onto the EVM chain. Contracts and chain events are the source of truth; services, Store, Order App, and executor-kit compile, index, display, sign, and submit around that source of truth.

Read the shortest object relationship first:

```text
Zhixu: how this class of coordination runs
  -> Order: this concrete coordination is running
  -> Executor: who handles this step
  -> Signal: who submitted which statement and evidence fingerprint
  -> Proof / Product view: why this is traceable
```

The engineering implementation then breaks that relationship into compiler artifacts, on-chain registration parameters, Identity Registry events, state-machine evaluation, event replay, and Product DTOs. Those are second-layer concepts, not the first entry point for understanding UVP.

## Reading Order

Start with these foundational terms. Zhixu is the reusable rulebook, Order is the runtime instance, Executor and Signal explain who moves the order forward, and the other objects serve compilation, authorization, endorsement, execution, and display:

| Subpage | Description |
| --- | --- |
| [Zhixu DSL](core/zhixu.md) | The code name and DSL form of Zhixu, describing task, stage, source, signal, supplier boundaries, and choice rights. |
| [Order](core/order.md) | The dynamic runtime instance of a Plan, holding signals, hook runtime, and overlays. |
| [Executor](core/executor.md) | The subject that actually executes or submits signals in a given Order, including a peer Zhixu acting as executor. |
| [Signal](core/signal.md) | The smallest business input accepted by the state machine, signed and submitted by an authorized wallet. |
| [Plan](core/plan.md) | The deterministic artifact compiled from a Zhixu for a target chain. |
| [Nucleus / Nucleation](core/nucleation.md) | The originating nucleus, designer, and organizer of a Zhixu; `nucleation` remains the field/context name. |
| [Supplier](core/supplier.md) | The capability subject and trust subject registered, labeled, and endorsed by Store. |
| [Source Causal Chain](core/source.md) | The causal context a signal belongs to, used to express same-source chaining, branching, and convergence. |
| [Hook](core/hook.md) | The rule for deriving stage readiness from signal conditions. |
| [Trigger](core/trigger.md) | The special hook marker that decides when `HookReady` is emitted and the execution entry opens. |
| [File Resources](core/file-resources.md) | Stage resource handles pointing to off-chain objects, protocol files, or resource manifests. |
| [Plan](core/plan.md) | The deterministic artifact compiled from a Zhixu for a target chain. |
| [Order](core/order.md) | The dynamic runtime instance of a Plan, holding signals, hook runtime, and overlays. |

Read the sibling chapters below as well:

| Chapter | Description |
| --- | --- |
| [Architecture](architecture.md) | Module boundaries, dependency direction, source of truth, and data flow. |
| [State Machine](state-machine.md) | How the contract stores signals, evaluates hooks, handles timers, and applies stage overlays; this belongs to the core component flow. |
| [Artifacts and Hashes](artifacts-and-hashes.md) | Compiler artifacts, canonical hashes, stable IDs, and registration parameters. |
| [Identity and Authorization](trust-and-authorization.md) | Identity binding, Plan publication, order-level signal authorization, EIP-712, and relayer boundaries. |
| [Product Surfaces](product-surfaces.md) | How chain-services project chain events into orders, tasks, and proofs that ordinary users can read. |
| [Store](../store/README.md) | How Store gives the Nucleus a workbench and organizes Zhixu/Supplier, trust checks, contact notifications, fulfillment records, and platform workflow. |
| [Executors and Integrations](../execution/README.md) | Executor Kit, docked Zhixu, Order App, adapters, and MCP/AI execution entry points. |

## Boundary Checks

- Contracts and chain events determine the real state of plans, orders, signals, hooks, and publications.
- The indexer database must be rebuildable from events and cannot be the source of truth.
- A relayer may sponsor or forward transactions, but it cannot generate business signatures on behalf of participants.
- Store, Order App, and Product API organize user language and metadata; submissions still go through on-chain authorization.
- Store is a first-class trust/workflow system and is described separately from the ordinary product surfaces.
- Store admin owns platform workflow; the Nucleus owns internal Zhixu design; trust registries own external endorsement.
- Executor Kit is the executor integration surface and works around the state machine and Product API.
- USDC, escrow, guarantee, and AI agents belong to adapters or periphery, and they consume signals/proofs around the core interface.
