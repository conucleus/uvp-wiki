# UVP Wiki

A cross-organization coordination protocol for the AI era: UVP, the Universal Value Protocol, uses a Zhixu DSL, standardized business signals, wallet signatures, and on-chain proof to reduce the costs of search, agreement, coordination, supervision, integration, dispute, and denial.

UVP Wiki is the public reading entry for the Universal Value Protocol. The current runnable implementation track is EVM/Web3: reusable cross-organization coordination designs become endorsed on-chain Plans, concrete Orders, wallet-signed business Signals, and replayable proof. UVP is chain-targetable as a protocol; the EVM track is working today, and Solana boundaries are reserved as explicit TODO surfaces.

## In the AI Era, Transaction Costs Remain

In the AI era, the cost of getting work done is dropping quickly, but transaction costs do not disappear on their own. Knowing who should transact with whom, what has been agreed, who should take the next step, who is allowed to confirm, and which consequence follows after confirmation remains one of the most expensive parts of cross-organization coordination.

One person with AI can do more work, but that still only says "I can do the work." Enterprises, strangers, AI agents, suppliers, funders, auditors, and ordinary participants still need to answer the same operational questions: who is authorized to emit which signal, which order and stage the signal belongs to, which evidence fingerprint and signature it carries, and what consequence it enters after submission.

If you are searching for how collaboration works in the AI era, how to orchestrate AI agents, how to reduce transaction costs, or how to prove cross-organization workflows on chain, UVP's answer is to turn coordination rules, execution permissions, evidence fingerprints, and state consequences into standardized signal containers.

## What UVP Solves

UVP records protocol facts: a subject authorized by a specific Zhixu declares, under a specific Order, stage, and evidence fingerprint, that a business Signal has been emitted and that the subject is accountable for that declaration. Real-world truth, qualification review, guarantee, insurance, dispute resolution, and regulatory conclusions can be expressed by the relevant trust domain, supplier, funder, auditor, or adapter as its own signal.

UVP compresses complex production relationships into an order language that computers can interpret and chains can record. `Zhixu` is the transliteration of the underlying Chinese coordination term; in UVP it means a static coordination definition: who starts, who takes the next step, which supplier may take over, what evidence counts as completion, and where the process goes on failure. An Order is one runtime of a specific Zhixu version.

The Zhixu DSL is a low-cost way to define transaction agreements; blockchains and smart contracts are high-forgery-cost recording systems. The EVM implementation connects the two, so strangers, enterprise systems, AI agents, suppliers, trust domains, and ordinary participants can organize production around the same signal boundary.

## Coase-Theorem Engineering Practice

UVP aims to be an engineering practice of Coase-style transaction-cost reduction in the AI era. Its engineering goal is to turn transaction costs into implementable protocol objects.

| Transaction cost | UVP engineering object |
| --- | --- |
| Search cost | Store, Supplier registry, trust projection, Product catalog. |
| Agreement cost | Zhixu DSL, Plan, plan hash, file resources, supplier requirements. |
| Coordination cost | Source, Signal, Hook, Trigger, Order, executor authorization. |
| Supervision cost | Evidence metadata, payload hash, metadata URI, proof row, timeline. |
| Integration cost | Product DTO, Chain Services, executor-kit, adapter/periphery boundary. |
| Dispute and denial cost | EIP-712 signatures, `SignalSubmitted`, `HookReady`, trust-registry events, replayable chain proof. |

UVP defines how AI agents, enterprises, humans, and on-chain state coordinate inside the same accountable boundary.

## Current EVM Implementation

The current EVM implementation connects the Zhixu coordination model to EVM-compatible chains. It compiles coordination designs into deterministic artifacts, puts plan and supplier endorsement into a trust registry, and puts Orders, Signals, HookReady events, and fulfillment proof into an on-chain state machine. Backend services index, project, display, relay, and cache; object storage keeps off-chain materials; the chain stores hashes, URIs, signatures, and events.

The compiler boundary now separates the platform-neutral `HookPlanArtifact` from chain target artifacts. The current runnable target is EVM (`EvmHookPlanArtifact`, still compatible with the legacy `OnchainHookPlanArtifact` name). Solana target interfaces are reserved as explicit TODO boundaries; they should fail closed until a Solana program, indexing adapter, wallet signer, and release-evidence path exist.

```text
Nucleation designs a Zhixu
  -> compiler creates deterministic Plan artifacts
  -> trust domain attests the plan hash
  -> publisher registers the Plan
  -> registrar creates an Order and writes signal authorization
  -> executor or participant signs and submits a Signal
  -> UVPStateMachine emits SignalSubmitted / HookReady / status events
  -> Chain Services rebuilds Product and Store views from events
```

Chain Services is the rebuildable service layer: it indexes, projects, verifies, relays, and exposes Product / Store APIs. In protocol discussions this layer is also called the non-trusted execution layer. The phrase means contracts and chain events are the protocol fact source, while Chain Services is a rebuildable projection and relay layer.

Funding, USDC, escrow, guarantee, and settlement can be built around this path, but they stay in periphery adapters. The core protocol boundary is the coordination state machine: Plans, Orders, authorizations, Signals, hooks, attestations, and replayable events.

## Public Implementation Repositories

UVP Wiki is the reading layer for a working implementation, and the EVM/Web3 implementation of UVP is split across these public repositories:

| Repository | Responsibility |
| --- | --- |
| [uvp-protocol](https://github.com/conucleus/uvp-protocol) | Zhixu compiler, HookPlan, state-machine reference, Solidity contracts, ABI, EIP-712, and Product DTO. |
| [uvp-chain-services](https://github.com/conucleus/uvp-chain-services) | Rebuildable service layer: indexer, relayer, proof verifier, Product API, Store API, projection, and workflow runtime. |
| [zhixu-store](https://github.com/conucleus/zhixu-store) | Store / workbench frontend: Zhixu catalog, supplier registry, trust/proof views, and operator workflows. |
| [uvp-order-app](https://github.com/conucleus/uvp-order-app) | Participant Order App: invite onboarding, task inbox, evidence fingerprints, proof display, and readiness checks. |
| [uvp-executor-kit](https://github.com/conucleus/uvp-executor-kit) | Executor CLI/SDK/MCP: executor wallets, chain watcher, Product API signal producer, and adapter integration. |

UVP Wiki explains how those repositories fit into one on-chain-provable coordination path; code, tests, and run scripts live in the repositories themselves.

## Protocol Boundaries

UVP's protocol boundary is standardized signal accountability inside a pre-agreed Zhixu. Participants are accountable for the signals they emit; contracts and chain events provide the record; rebuildable services and adapters organize views, submissions, and integrations around that record. UVP mainly reduces the transaction costs of search, agreement, coordination, supervision, integration, dispute, and denial.

| Area | UVP definition |
| --- | --- |
| Multi-party coordination | A protocol that records authorized business signals and their coordination consequences through chain events. |
| Backend workflow | Backends project and relay around protocol facts from contracts and chain events. |
| Funding and settlement | Funding, guarantees, USDC, escrow, and settlement are adapters around the core state machine. |
| Business files | The chain stores hashes, URIs, signatures, and events; business materials stay off chain. |

UVP Wiki is the human-readable entry point for the protocol and its current public implementation tracks. It organizes source code, tests, ABI fixtures, PRD records, and release evidence into a project manual that can be read by path.

## Who UVP Wiki Is For

| Reader | What you can learn here |
| --- | --- |
| New partner or ecosystem reader | Why UVP exists, what a Zhixu/Order/Signal means, and how one order is proven. |
| Product or Store builder | How Product DTOs, Store workflow, supplier registry, proof views, and operator actions fit around chain facts. |
| Protocol engineer | How compiler artifacts, contracts, events, EIP-712, hashes, replay, and public interfaces fit together. |
| Executor or adapter integrator | How Order App, executor-kit, enterprise scripts, AI/MCP, docked Zhixu, and periphery adapters submit signals. |
| Release owner | How local Anvil, Product loops, Base Sepolia staging, status labels, and release evidence should be read. |

## Start Reading

If you are new to UVP, use this order:

1. [One Order Story](getting-started/one-order-story.md): follow one cross-border cargo order from design to task proof.
2. [Actor Map](getting-started/actor-map.md): learn who Buyer, Nucleation, Store operator, Trust Domain, Registrar, Supplier, Executor, Relayer, and Chain Services are.
3. [Evidence and Proof Path](getting-started/evidence-proof-path.md): understand how private business files become hashes, signed signals, events, and Product proof rows.
4. [Glossary](reference/glossary.md): keep the project terms and "do not confuse" pairs nearby.
5. [Core Concepts](core/README.md): read the protocol objects after the story is clear.

## Choose Your Path

| Goal | Read next |
| --- | --- |
| Understand the system before engineering | [Getting Started](getting-started/README.md), [Core Concepts](core/README.md), [Product Language and DTO/API](product/README.md). |
| Build Product or Store surfaces | [Product Language and DTO/API](product/README.md), [Store](store/README.md), [Order App and Executor Kit](concepts/architecture/components/order-app-executor-kit.md). |
| Work on protocol or public interfaces | [Core Components](components/README.md), [Public Interfaces](reference/public-interfaces.md), [Contracts and Events](reference/contracts-and-events.md). |
| Integrate executors, adapters, or AI/MCP | [Executors and Integrations](execution/README.md), [Executor Kit](execution/executor-kit.md), [Periphery and Adapters](concepts/architecture/components/periphery-deploy.md). |
| Verify local or staging claims | [Quick Start](getting-started/quick-start.md), [Local Anvil Protocol Loop](tutorials/local-anvil.md), [Base Sepolia Staging](tasks/base-sepolia-staging.md), [Project Status](status/README.md). |

See [SUMMARY.md](SUMMARY.md) for the full table of contents. `wiki/site/` is static site build output, not an editing source.
