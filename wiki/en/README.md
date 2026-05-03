# uvp-eth Wiki

In the AI era, the cost of getting work done is dropping quickly, but transaction costs do not disappear on their own. Knowing who should transact with whom, what to agree on, who should take the next step, who is allowed to confirm it, and what consequences follow after confirmation is still the most expensive part of cross-organization coordination.

One person with AI can work with much greater leverage, but that still only means “I can do the work.” UVP provides a standardized Signal Container: who is authorized to emit which signal, which Order the signal is bound to, which stage, evidence fingerprint, and signature it belongs to, and what coordination consequence it enters after it is emitted.

UVP records protocol facts: a subject authorized by a particular Zhixu emits a business signal under a specific Order, stage, and evidence fingerprint, and takes responsibility for that claim. Ground truth, qualification review, guarantees, insurance, dispute rulings, and regulatory conclusions can be emitted as their own signals by the relevant trust domain, Supplier, funding party, auditor, or adapter.

UVP compresses complex production relationships into coordination language that computers can understand, record on chain, and hold accountable. `Zhixu` is the transliteration of the underlying Chinese coordination term; in this repository it refers to the static coordination definition: who starts first, who owns the next step, which Supplier can take over, what evidence counts as completion, and which route applies on failure. An Order is one runtime instance of a Zhixu version. The Zhixu DSL is a low-cost way to express transactional coordination; the blockchain and smart contracts are the high-falsification-cost record system. `uvp-eth` connects the two so strangers, enterprise systems, AI agents, Suppliers, trust domains, and ordinary participants can organize production around the same signal boundary.

`uvp-eth` is the EVM-native implementation track for this mechanism. It compiles coordination design into deterministic artifacts, gives plan and Supplier attestations to the trust registry, and gives Orders, signals, HookReady, and fulfillment proofs to the on-chain state machine. Backends handle indexing, projection, display, relay, and caching; object storage keeps off-chain materials; on chain keeps hashes, URIs, signatures, and events.

This is also the fundamental difference between `uvp-eth` and a multi-party database consistency scheme: participants are accountable for the standard signals they emit under a pre-agreed Zhixu. UVP primarily reduces search, negotiation, coordination, supervision, integration, dispute, and denial costs.

This Wiki is the human-readable entry point for `uvp-eth`. It organizes source code, tests, ABI fixtures, PRD records, and release evidence into a project manual that can be read by path.

## In One Line

```text
Nucleation designs Zhixu
  -> Supplier / Executor capability network
  -> deterministic HookPlan / OnchainHookPlan artifacts
  -> ZhixuTrustRegistry plan attestation
  -> UVPStateMachine plan/order/signal/hook events
  -> Store Nucleation workbench, trust checks, fulfillment views, and platform workflow
  -> non-trusted execution layer / chain-services replayed projections
  -> Product DTOs
  -> Store / Order App / executor-kit / docked Zhixu
```

There is only one core principle: contracts and chain events are the protocol source of truth. Backend services, Store metadata, demo adapters, object storage, and frontend caches are responsible for projection, indexing, display, relay, or off-chain material storage. UVP records accountable signals emitted by authorized subjects and the consequences those signals have under Zhixu.

## Read This First

If you want to get to engineering work quickly:

1. Read [Project Status](status/README.md) to see what is verified and what is still prototype work.
2. Read [One Order Story](getting-started/one-order-story.md) and [the glossary](reference/glossary.md) to separate “Zhixu” from “Order.”
3. Run [Quick Start](getting-started/quick-start.md) to confirm the workspace builds.
4. Read [Core Concepts](core/README.md) to understand Zhixu, Nucleation, Supplier, Executor, Source/Signal/Hook/Trigger, File Resources, Plan, and Order.
5. Read [Core Components](components/README.md) to understand compiler, contracts, state machine, the non-trusted execution layer, Product DTOs, and deploy.
6. For Store work, read [Store](store/README.md).
7. For executor, adapter, AI/MCP, or peer Zhixu integration, read [Executors and Integrations](execution/README.md).
8. For user-facing product language, start with [Product Language and DTO/API](product/README.md).
9. Before changing a public boundary, read [Public Interfaces](reference/public-interfaces.md).

## Document Map

- [Getting Started](getting-started/README.md): reader entry point, one-order story, quick start, and current project status.
- [Core Concepts](core/README.md): Zhixu, Nucleation, Supplier, Executor, Source/Signal/Hook/Trigger,
  File Resources, Plan, Order, and the trust/authorization relationships between those protocol objects.
- [Core Components](components/README.md): hook-core, compiler, protocol bindings,
  artifacts/hashes, contracts/registries, state machine/replay, the non-trusted execution layer, Product DTOs, and deploy/release.
- [Store](store/README.md): how Store gives Nucleation a workbench and organizes Zhixu/Supplier, trust checks,
  fulfillment/proof views, contact notifications, configuration publishing, platform workflow, and audit.
- [Executors and Integrations](execution/README.md): executor-kit, Order App, enterprise scripts,
  AI/MCP adapters, docked Zhixu, and periphery adapter execution entry points.
- [Product Language and DTO/API](product/README.md): Product DTO/API, Signal Container,
  Order App, and ordinary Product UI.
- [Local / Staging / Release](tasks/development.md): development tasks, Anvil, Base Sepolia,
  release evidence, and troubleshooting.
- [Reference and Evidence](reference/public-interfaces.md): public interfaces, contract events, Product API,
  CLI/config, and release claim language.
- [Contribution Rules](contribute/documentation-rules.md): how to update the Wiki without polluting protocol boundaries.

See [SUMMARY.md](SUMMARY.md) for the full table of contents. `wiki/site/` is static site build output, not an editing source.

## Current Project Status

At the time this Wiki was assembled, the repository already includes, and in varying degrees has been tested or supported by staging evidence:

- deterministic compiler, HookPlan, and EVM-facing OnchainHookPlan artifacts;
- `UVPStateMachine`, `ZhixuTrustRegistry`, and `UVPDeploymentRegistry` contracts;
- explicit order-level signal submitter authorization;
- first-writer-wins signal handling, hook status, timers, and `HookReady` events;
- the non-trusted execution layer / chain-services that replay Product order/task/proof/trust projections from chain events;
- Store Console, Store workbench, Order App, and executor-kit Product API / chain CLI;
- the `supplierType=zhixu` / `signalMap` compilation semantics and the local/linked docked execution protocol surface;
- local Anvil, Product local Anvil, Base Sepolia rehearsal, and release gate scripts;
- the periphery directory for funding, guarantee, payment, and agent adapters and demos.
- Base Sepolia `0.2` Product/Store staging evidence, including the 2026-05-01 managed Postgres/R2/JWT record and the 2026-05-02 local Docker Postgres release-candidate rehearsal record.

Status boundaries:

- Base Sepolia rehearsal supports testnet/staging claims; production claims need separate release evidence.
- Store metadata, contact information, notification state, review state, fulfillment record views, and Product BFF state belong to the product and workflow read models.
- Store admin owns platform workflow; Nucleation owns internal Zhixu design; trust domains own external endorsement.
- USDC, escrow, guarantee, and settlement belong inside the periphery adapter boundary.
- Implemented capabilities must be backed by code, tests, or release evidence; PRD plans should be labeled planned/prototype.
- `uvp-order-app` still needs a complete proof of the same Base Sepolia Product API task flow.
- The current head state for managed Postgres needs a fresh managed run after quota recovery before it can be claimed again.

## Shortest Engineering Path

1. Read [One Order Story](getting-started/one-order-story.md) to build the main path in your head.
2. Read [the glossary](reference/glossary.md) to align the meanings of “Zhixu” and “Order.”
3. Read [Project Status](status/README.md) and use verified/prototype/planned/blocked to judge evidence quality.
4. Run [Quick Start](getting-started/quick-start.md) to confirm local dependencies and contract checks.
5. Read [Core Concepts](core/README.md) and [Core Components](components/README.md) to separate protocol objects from implementation components.
6. Run the [Local Anvil tutorial](tutorials/local-anvil.md) to see the protocol semantics close the loop.
7. Run the [Product Local Loop](tutorials/product-local-loop.md) to see Product DTOs, signatures, submissions, and proof.
8. For Store work, read [Store](store/README.md) first.
9. For executor, adapter, MCP, or linked Zhixu integration, read [Executors and Integrations](execution/README.md) first.
10. Before staging, read [Base Sepolia Staging](tasks/base-sepolia-staging.md) and
   [Release and Verification](operations/release-and-verification.md).
