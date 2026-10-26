---
title: Periphery and Deployment
type: explanation
audience: 工程贡献者
status: verified
---

# Periphery and Deployment

`uvp-periphery` and `uvp-deploy/deploy` are important components outside the core protocol. They run around the state machine but cannot change its fact boundary.

## Periphery

`uvp-periphery` holds:

- Settlement-custody, payment, and guarantee adapters.
- USDC or stablecoin demos.
- AI/MCP agent adapters.
- Industry demos or scenario adapters.
- Executor demos.

Periphery may consume `UVPStateMachine`, optional `UVPIdentityRegistry` name resolution, Product DTOs, or uvp-client. It must not turn funding, guarantee, payment, release, refund, or disputed-payout states into a new core source of truth.

## Scenario Adaptation Principle

Periphery scenarios may demonstrate how funding, guarantees, customs clearance, logistics, AI/MCP, or enterprise systems plug into UVP as executor, supplier, or adapter. Industry demos cannot become core protocol facts, and payment, logistics, or enterprise system states cannot enter the core state machine.

## Deploy

`uvp-deploy/` is this repository's deployment domain, split by lane: `deploy/` (release) holds deployment/broadcast scripts, manifests, the compatibility matrix, and release records; `qa/` holds the local Anvil bootstrap, the local product loop, and chaos; `ops/` holds the operator console and runbooks. The release lane is responsible for:

- Base Sepolia staging.
- Release gates.
- Deployment registry records.

Deployment state must not be written to a sibling deployment repository outside this repo as the source of truth for uvp-eth.

## Related Pages

- [Protocol Boundaries (Periphery Adapters)](protocol-boundaries.md)
- [Deploy and Evidence](../meta/deploy-release.md)
- [Module Map](../../reference/module-map.md)
- [Contracts and Registries](contracts-and-registries.md)
