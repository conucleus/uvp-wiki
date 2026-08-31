---
title: Core Concepts
type: explanation
audience: 协议读者
preread: ../reference/glossary.md
status: verified
---

# Core Concepts

> Prerequisite reading: [Glossary](../reference/glossary.md)
When unsure about terminology, check the [Core Glossary](../reference/glossary.md) first.

The core of `uvp-eth` is a state-machine protocol that lands Zhixu (order) coordination rulebooks on the EVM chain. Contracts and chain events are the source of truth; Store, Product API, Order App, executor-kit, and periphery adapters compile, index, display, sign, and submit around that source of truth. These objects are the language layer consumed jointly by every product.

Read the shortest object relationship first:

```text
Zhixu (order): how this class of coordination runs
  -> Order: this concrete run is in progress
  -> Executor: who handles this step
  -> Signal: who submitted which declaration and evidence fingerprint
  -> Proof / Product view: why this is traceable
```

The engineering implementation then breaks this relationship into compiled artifacts, on-chain registration parameters, Identity Registry, state-machine evaluation, event replay, and Product DTOs. Those are a second layer, not the first entry point for understanding UVP. This page is an object index, not a first tutorial: new readers should first grasp four foundational objects — Zhixu (order) is the reusable coordination rulebook, an Order is one run, the Executor is the runtime handler, and a Signal is an authorized business declaration; the remaining objects explain versions, causality, task opening, material review, resources, and proof.

## Object Map

### Read First

| Object | Start with | Core question |
| --- | --- | --- |
| Zhixu (order) | [Zhixu DSL](core/zhixu.md) | How a coordination order is described statically. |
| Order | [Order](core/order.md) | How one concrete run records signals, tasks, and proof. |
| Signal | [Signal](core/signal.md) | How authorized business declarations are signed, deduplicated, and submitted. |
| Executor | [Executor](core/executor.md) | Who actually executes or submits signals for the current order and stage. |

### Read When You Need Rule Internals

| Object | Start with | Core question |
| --- | --- | --- |
| Plan | [Plan](core/plan.md) | How a Zhixu becomes a static, certifiable, registrable compiled artifact. |
| Source | [Source Causal Chain](core/source.md) | How the causal context of a signal chains, forks, and converges. |
| Hook | [Hook](core/hook.md) | How readiness and state changes derive from signal conditions. |
| Trigger | [Trigger](core/trigger.md) | Which hook opens actionable tasks when Ready and emits `HookReady`. |
| File Resources | [File Resources](core/file-resources.md) | How stage resource handles point to off-chain protocols, evidence templates, or resource manifests. |

### Read When You Need Organization and Material Review

| Object | Start with | Core question |
| --- | --- | --- |
| Nucleus / 凝结核 | [Nucleus / 凝结核](core/nucleation.md) | Who initiates, designs, and maintains a Zhixu; `nucleation` is the DSL field and nucleation context. |
| Supplier | [Supplier](core/supplier.md) | How registered suppliers, capability subjects, trust subjects, and capability passports are expressed. |
| Trust / Authorization | [Trust and Authorization](trust/README.md) | Who passes material review, who can submit order actions, and how those two are separated. |

## Where Supplier and Executor Sit

Supplier is how the Store organizes real-world fulfillment subjects: nuclei can describe requirements in their order design, while Store maintains profiles, capability tags, contacts, matching, and proof materials; `UVPIdentityRegistry` only registers subject-to-wallet bindings. Actual task authorization still comes from Order signatures and order-level authorization; capability tags are not a protocol precondition.

Executor is the runtime execution binding of an order: a static Zhixu may declare a default executor, stages with stage-executor-patch capability may choose the active executor at runtime, and the contract ultimately decides whether a signal is accepted using order-level authorization, the active executor overlay, and EIP-712 signatures.

## Zhixu, Nuclei, and Suppliers Reappear in the Store

The same objects carry different emphasis in different sections:

| Section | Zhixu / nucleus emphasis | Supplier emphasis |
| --- | --- | --- |
| Core concepts | DSL fields, `spec.nucleation.id`, Plan compilation, plan hash, chain registration, order instance. | Capability subject, trust subject, capability passport, signal authorization boundary. |
| Zhixu Store | Store gives nuclei a workbench for design, organization, publication materials, proof, and material-review requests. | How nuclei organize supplier networks, and how Store maintains directory, contacts, platform tags, proof, and material-review request material. |

## How to Read

1. This page establishes the object vocabulary (concept entries).
2. Read [object pages](core/zhixu.md) as needed (one page per object under `core/`).
3. Then read the three architecture chapters: [Architecture](architecture.md), [Data Flow and Source of Truth](data-flow-and-truth.md), and [Plan and Order Lifecycle](lifecycle.md).
4. Finally go deeper by topic: [State Machine](state-machine/README.md), [Artifacts and Hashes](artifacts-and-hashes.md), [Trust and Authorization](trust/README.md), [Product Surfaces](product/README.md).

## Sibling Chapters

| Chapter | Description |
| --- | --- |
| [Architecture](architecture.md) | Module boundaries, dependency direction, source of truth, and data flow. |
| [State Machine](state-machine/README.md) | How the contract stores signals, evaluates hooks, and handles timers and stage overlays; part of the core component chain. |
| [Artifacts and Hashes](artifacts-and-hashes.md) | Compiled artifacts, canonical hashes, stable IDs, and registration parameters. |
| [Trust and Authorization](trust/README.md) | Identity Registry, Plan publication, order-level signal authorization, EIP-712, and the relayer boundary. |
| [Product Surfaces](product/README.md) | How chain-services project chain events into orders, tasks, and proofs ordinary users can read. |
| [Zhixu Store](store/README.md) | The Store is a first-class product/governance system that gives nuclei a workbench, and reinterprets Zhixu/Supplier, identity verification, contact notifications, fulfillment records, and platform workflow. |
| [Order App and executor-kit](apps/order-app-vs-executor-kit.md) | How the participant app and the executor integration surface consume tasks and submit signals. |

## Boundary Checklist

- Contracts and chain events decide the real state of plan, order, signal, hook, and publication; Store, Order App, and Product API organize user language and metadata, while protocol facts come from chain events.
- Indexer databases must be rebuildable from events and cannot become the source of truth.
- Relayers may sponsor or forward transactions, but must not generate business signatures for participants.
- Supplier identity (material review) and order-level signal authorization are layered separately.
- Executor/resource patches affect only a single Order; Plans stay static versions.
- `supplierType=zhixu` drives the local order through proof validation, docking links, and authorized signal mapping.
- Trigger hooks that become Ready open actionable tasks; on-chain order identity is created by the trigger order entry point.
- `fileResources` are resource handles; business file plaintext stays off-chain.
- Store metadata organizes objects and catalogs; plan/supplier identity comes from registry events.
- Store admins own platform workflow; nuclei own governance inside their Zhixu; Identity Registry operators own identity verification and binding.
- Executor Kit is the executor integration surface, working around the state machine and Product API.
- Funding, payment, guarantee, and agent adapters may appear as implementations of Supplier or Executor roles, consuming signal/proof around core interfaces without adding new sources of truth.

For the full discussion of these boundaries, see [Protocol Boundaries](protocol-boundaries.md).
