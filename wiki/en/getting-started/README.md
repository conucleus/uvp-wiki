# Getting Started

If you already understand roughly what UVP is trying to solve but do not yet have the object map in your head, start here. Build intuition from the story first, then read the roles and terms, and only then move into local verification.

This is not the concept encyclopedia. The first pass should build the business intuition: a reusable coordination rulebook is a Zhixu, one concrete runtime is an Order, the subject handling a step is an Executor, and the accountable business declaration that moves the order forward is a Signal.

## Recommended First Pass

1. [One Order Story](one-order-story.md): one concrete cross-border order from Zhixu design to chain proof.
2. [Core Concepts](../core/README.md): after the story is clear, read the protocol objects by layer.
3. [Glossary](../reference/glossary.md): terms and key concept pairs.

## Second Pass

After the first pass, move into the engineering path:

1. [One Order Through UVP Components](order-through-components.md): the same order crossing Store, compiler, Identity Registry, state machine, Chain Services, Order App, and executor-kit.
2. [Architecture Overview](../concepts/architecture.md): module boundaries, dependency direction, source of truth, and data flow.

## Engineering First Pass

After the conceptual pass, use these pages to verify the local workspace:

1. [Quick Start](quick-start.md): install and run workspace-level checks.
2. [Local Anvil Protocol Loop](../tutorials/local-anvil.md): see the full path from Zhixu to chain-event replay.
3. [Product Local Loop](../tutorials/product-local-loop.md): see Product API order creation, task submission, and proof.
4. [Project Status](../status/README.md): check what is verified, prototype, planned, or blocked.

## Environment Requirements

- Node.js 20 or newer.
- pnpm 9.15.0.
- Foundry for Solidity build/test.
- Anvil for the local chain loop.
- Base Sepolia staging requires `~/.test_envs`, but Quick Start does not need any secrets.

Do not write private keys, RPC secrets, JWT keys, or object storage secrets into the repository, logs, or documentation.
