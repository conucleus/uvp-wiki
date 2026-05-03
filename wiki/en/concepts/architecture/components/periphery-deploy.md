# Periphery and Deployment

`uvp-periphery` and `uvp-deploy/deploy` are important components outside the core protocol. They run around the state machine, but they cannot change the state machine’s factual boundary.

## Periphery

`uvp-periphery` contains:

- Escrow, payment, and guarantee adapters.
- USDC or stablecoin demos.
- AI / MCP agent adapters.
- Industry demos or scenario adapters.
- Executor demos.

Periphery can consume `UVPStateMachine`, `ZhixuTrustRegistry`, Product DTOs, or executor-kit. It cannot turn funding, guarantee, payment, release, refund, or dispute state into new core facts.

## Scenario Adaptation Principle

Periphery scenarios can show how funding, guarantees, customs, logistics, AI / MCP, or enterprise systems join UVP as executors, suppliers, or adapters. Scenario material must not turn industry demos into core protocol facts, and it must not pull payment, logistics, or enterprise system state into the core state machine.

## Deploy

`uvp-deploy/deploy` contains this repository’s own deployment scripts, manifests, and release records. It is responsible for:

- local Anvil bootstrap.
- Product local loop.
- Base Sepolia staging.
- release gates.
- deployment registry records.

Deployment state must not be written to the sibling `/Users/uyhendu/project/uvp-deploy` repository as the factual source for uvp-eth.
