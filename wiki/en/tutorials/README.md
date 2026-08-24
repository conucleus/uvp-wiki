---
title: Getting Started
type: meta
audience: 全部读者
status: verified
---

# Getting Started

If you already know roughly what UVP is trying to solve but do not yet have the full object map in your head, start here. Build intuition from the story first, then read the roles and terms, and only then move into local verification.

This is not the concept encyclopedia. The first pass only needs to build the business intuition: a class of coordination is written as a Zhixu, one concrete run is an Order, whoever actually handles a step is an Executor, and what pushes the order forward is a Signal.

## Recommended First Pass

1. [Coordination Infrastructure for the AI Era](why-uvp.md): why UVP exists and which transaction costs it turns into protocol objects.
2. [One Order Story](one-order-story.md): use one cross-border order to understand the path from Zhixu design to on-chain proof.
3. [Core Concepts](../core/README.md): once the story is clear, read the protocol objects by layer.
4. [Glossary](../reference/glossary.md): project terms and key concept pairs.

## Second Pass

After the first pass, move into the engineering path:

1. [Plan and the Order Lifecycle](../concepts/lifecycle.md): use the same order to locate Store, compiler, Identity Registry, state machine, Chain Services, Order App, and executor-kit.


2. [Architecture Overview](../concepts/architecture.md): module boundaries, dependency direction, source of truth, and data flow.

## Engineering First Pass

After the conceptual reading, use these pages to verify the local workspace:

1. [Quick Start](../how-to/quick-start.md): install dependencies and run workspace-level checks.
2. [Local Anvil Protocol Loop](local-anvil-loop.md): first see the full path from Zhixu to chain-event replay, then continue with the Product local surface at the end of the same page.
3. [Project Status](../meta/status.md): confirm what is verified, prototype, planned, or blocked.

## Environment Requirements

- Node.js 20 or newer.
- pnpm 9.15.0.
- Foundry for Solidity build/test.
- Anvil for the local chain loop.
- Base Sepolia staging requires `~/.test_envs`, but Quick Start does not need any secrets.

Do not write private keys, RPC secrets, JWT keys, or object storage secrets into the repository, logs, or documentation.
