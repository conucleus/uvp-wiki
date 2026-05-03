# Core Concepts

The core of `uvp-eth` is a state machine protocol that brings Zhixu coordination definitions onto the EVM chain. Contracts and chain events are the source of truth; services, Store, Order App, and executor-kit compile, index, display, sign, and submit around that source of truth.

The shortest path is:

```text
Zhixu definition
  -> Nucleation
  -> HookPlan
  -> on-chain registration parameters
  -> TrustRegistry plan attestation
  -> UVPStateMachine plan registration
  -> Order registration and signal authorization
  -> participant signal submission
  -> hook status changes or HookReady
  -> events projected into Product DTOs
```

## Reading Order

Start with these foundational terms. Zhixu is the static definition, Order is the runtime instance, and the other objects serve compilation, authorization, endorsement, execution, and display:

| Subpage | Description |
| --- | --- |
| [Zhixu DSL](core/zhixu.md) | The code name and DSL form of Zhixu, describing task, stage, source, signal, supplier boundaries, and choice rights. |
| [Nucleation](core/nucleation.md) | The originating nucleus, designer, and organizer of a Zhixu. |
| [Supplier](core/supplier.md) | The capability subject and trust subject registered, labeled, and endorsed by Store. |
| [Executor](core/executor.md) | The subject that actually executes or submits signals in a given Order, including a peer Zhixu acting as executor. |
| [Source Causal Chain](core/source.md) | The causal context a signal belongs to, used to express same-source chaining, branching, and convergence. |
| [Signal](core/signal.md) | The smallest business input accepted by the state machine, signed and submitted by an authorized wallet. |
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
| [Trust and Authorization](trust-and-authorization.md) | Trust domains, plan attestation, order-level signal authorization, EIP-712, and relayer boundaries. |
| [Product Surfaces](product-surfaces.md) | How chain-services project chain events into orders, tasks, and proofs that ordinary users can read. |
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
