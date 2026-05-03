# Getting Started

This section answers three questions:

- What should I read first?
- How do I confirm the local environment is not broken?
- Which loop should I run to understand the project?

Recommended order:

1. [One Order Story](one-order-story.md): use a single cross-border order to understand Zhixu, Plan, Order, signal, and proof.
2. [Glossary](../reference/glossary.md): align the meaning of terms such as “Zhixu” and “Order.”
3. [Quick Start](quick-start.md): install dependencies and run workspace-level checks.
4. [Core Concepts](../concepts/overview.md): understand the project language.
5. [Local Anvil Protocol Loop](../tutorials/local-anvil.md): see the full path from Zhixu to chain-event replay.
6. [Product Local Loop](../tutorials/product-local-loop.md): see how Product API creates orders, submits tasks, and queries proof.

## Start by Understanding the Objects

`uvp-eth` is UVP’s EVM/Web3 track, and the core objects are organized along this line:

- Static design: Zhixu, HookPlan, OnchainHookPlan, Plan.
- Dynamic runtime: Order, signal, hook runtime, stage overlay, proof.
- Endorsement and authorization: trust domain, plan/supplier attestation, order-level signal authorization.
- Product read models: indexer, Product API, Store, Order App.
- Peripheral extensions: funding, payment, escrow, guarantee, and agent adapters, all placed under
  `uvp-periphery/`.

The engineering boundary is explicit as well: this repository does not import or vendor the sibling `uvp` Go repository; protocol facts come from contract state and chain events; read models must be rebuildable from events.

## Environment Requirements

- Node.js 20 or newer.
- pnpm 9.15.0.
- Foundry for Solidity build/test.
- Anvil for the local chain loop.
- Base Sepolia staging requires `~/.test_envs`, but Quick Start does not need any secrets.

Do not write private keys, RPC secrets, JWT keys, or object storage secrets into the repository, logs, or documentation.
