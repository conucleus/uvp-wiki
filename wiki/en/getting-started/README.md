# Getting Started

This section is the learning path after the homepage. It is for readers who already know why UVP matters and now need a low-friction path from story, to actors, to terms, to local verification.

## Recommended First Pass

1. [One Order Story](one-order-story.md): one concrete cross-border order from Zhixu design to chain proof.
2. [Actor Map](actor-map.md): who acts, where they act, and which event proves each fact.
3. [Evidence and Proof Path](evidence-proof-path.md): how private evidence becomes hashes, signed signals, and proof rows.
4. [Glossary](../reference/glossary.md): terms and "do not confuse" pairs.
5. [Core Concepts](../core/README.md): the protocol objects after the story is clear.

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
