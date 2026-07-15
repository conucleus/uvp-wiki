# UVP: Verifiable Coordination Protocol for the AI Era

UVP, the Universal Value Protocol, is a protocol and current EVM/Web3 implementation for cross-organization coordination. It does not claim to prove all real-world truth. It records a narrower but critical fact: **who was authorized, for which order and stage, under which evidence fingerprint, to sign and confirm which business signal.**

Those confirmations become replayable proof. Others do not need to trust a platform back office statement alone; they can trace authorization, signatures, evidence fingerprints, and on-chain records to see who confirmed what, on what evidence, and why the order advanced.

On the first pass, readers do not need to memorize every object. Start with one intuition: **Zhixu is the reusable rulebook, Order is the concrete runtime, Executor handles a step, and Signal is the accountable business declaration.** Plan, Hook, Source, Product DTO, ABI, and related concepts are introduced in the second pass and engineering pages.

## What UVP Proves

UVP does not prove that goods truly arrived or that a company is inherently trustworthy. Those judgments still belong to contracts, regulators, insurers, auditors, trust registries, suppliers, or adapters.

UVP proves accountable declarations at coordination boundaries:

```text
authorized subject
  -> for a specific Order / stage
  -> with an evidence fingerprint or metadata URI
  -> signs with an authorized wallet
  -> submits a standard business Signal
  -> creates replayable chain events and state consequences
```

This gives strangers, enterprise systems, AI agents, suppliers, funders, auditors, and regulators a shared record for discussing who confirmed what, on what evidence, and what happened after the confirmation.

## Why the AI Era Needs It

AI is lowering the cost of completing individual tasks, but it does not erase transaction costs. An agent can write code, inspect documents, quote prices, or generate customs material. The hard coordination questions remain: who should work with whom, under which rules, who is allowed to take the next step, who can confirm the result, and who is accountable after confirmation.

UVP's answer is not to let an AI agent become its own source of truth. UVP expresses coordination rules in reusable Zhixu DSL, turns execution permissions, evidence fingerprints, wallet signatures, and state consequences into standardized business signals, and records key facts as replayable proof. To see how this connects transaction costs, platform trust, and L4/L5 coordination, read [Coordination Infrastructure for the AI Era](getting-started/ai-era-coordination.md).

## How One Order Leaves Proof

In a cross-border photovoltaic delivery, the project company, EPC, OEM, customs broker, logistics provider, warehouse, funder, and auditor do not need to move their internal systems into UVP. They only need to submit authorized business signals at key coordination boundaries.

```text
Zhixu rulebook
  -> deterministic Plan artifact
  -> StateMachine Plan commit and publication
  -> Order creation and signal authorization
  -> executor submits evidence hash and signed Signal
  -> UVPStateMachine records events and advances HookReady
  -> Chain Services rebuilds order, task, timeline, and proof rows
```

If you read one story first, read [One Order Story](getting-started/one-order-story.md). On the second pass, read [One Order Through UVP Components](getting-started/order-through-components.md) to locate Store, compiler, Identity Registry, state machine, Chain Services, Order App, and executor-kit.

## What UVP Is Not

UVP is not a generic workflow SaaS, payment provider, custodian, escrow product, or AI agent runtime.

Funding, USDC, escrow, guarantee, settlement, and AI/MCP agent adapters can connect around UVP, but they belong in periphery or external adapters. The core protocol boundary is the coordination state machine: Plans, Orders, authorizations, Signals, hooks, publications, and replayable events.

## Current Implementation and Maturity

The runnable implementation track today is EVM/Web3. `uvp-protocol`, `uvp-chain-services`, `zhixu-store`, `uvp-order-app`, and `uvp-executor-kit` make up the public implementation: the compiler emits deterministic artifacts, contracts record Plan/Order/Signal/trust events, Chain Services rebuilds Product/Store views, and frontends plus executor tools consume those views and submit authorized actions.

Status must be read by layer: compiler, contracts/event replay, Identity Registry, Product DTO, and Chain Services projection have verified claims; Store Console, Order App, executor-kit live operator path, and ops console remain prototype or partial. See [Project Status](status/README.md) for the current wording.

## Start Reading

1. [One Order Story](getting-started/one-order-story.md): follow one cross-border cargo order from design to task proof.
2. [Coordination Infrastructure for the AI Era](getting-started/ai-era-coordination.md): understand the link between transaction costs, platform trust, and the L4/L5 coordination foundation.
3. [Core Concepts](core/README.md): read Zhixu, Order, Signal, Executor, and the rest of the protocol objects by layer.
4. [One Order Through UVP Components](getting-started/order-through-components.md): use the same order to locate the engineering modules.
5. [Glossary](reference/glossary.md): keep the project terms and key concept pairs nearby.

## Choose Your Path

| Goal | Read next |
| --- | --- |
| Understand the system before engineering | [Getting Started](getting-started/README.md), [One Order Through UVP Components](getting-started/order-through-components.md), [Core Concepts](core/README.md). |
| Build Product or Store surfaces | [Product DTO and User Surfaces](product/README.md), [Store](store/README.md), [Order App](execution/order-app.md). |
| Work on protocol or public interfaces | [From Zhixu to a Registrable Plan](components/semantics-and-compiler.md), [UVPStateMachine](components/onchain-runtime.md), [Public Interfaces](reference/public-interfaces.md). |
| Work on Chain Services or Product API | [Chain Services](components/chain-services.md), [Product API](components/chain-services-product-api.md), [Product API Reference](reference/product-api.md). |
| Integrate executors, enterprise scripts, or AI/MCP | [Executors and Integrations](execution/README.md), [Executor Kit](execution/executor-kit.md), [Order App and Executor Kit](concepts/architecture/components/order-app-executor-kit.md). |
| Verify local or staging claims | [Quick Start](getting-started/quick-start.md), [Local Anvil Protocol Loop](tutorials/local-anvil.md), [Base Sepolia Staging](tasks/base-sepolia-staging.md), [Project Status](status/README.md). |

See [SUMMARY.md](SUMMARY.md) for the full table of contents. `wiki/site/` is static site build output, not an editing source.
