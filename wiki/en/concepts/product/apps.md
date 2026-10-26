---
title: Store and Order App
type: meta
audience: 产品与前端工程师
preread: README.md
status: verified
---

# Store and Order App

> Prerequisite reading: [Product DTO and User Surfaces](README.md)
Order App and uvp-client consume the same on-chain facts from different runtime positions; `zhixu-registry` records self-descriptions and identity claims only. This page is an index; detailed boundaries live on their own pages.

| Surface | One-line positioning | See |
| --- | --- | --- |
| zhixu-registry | Permissionless ZhixuRecord / IdentityClaim registry data layer: self-descriptions, signatures, and opaque refs only; no UI, review, or recommendation. | [Module Map](../../reference/module-map.md) |
| Order App | The ordinary participant task tool: to-dos, submission confirmation, evidence fingerprints, on-chain proof, readiness. | [Order App](../apps/order-app.md) |
| uvp-client | Integration tool for executors, enterprise systems, and supervised AI agent scripts: Product API mode and chain watcher mode paths. | [UVP Client](../apps/uvp-client.md), [Order App vs UVP Client](../apps/order-app-vs-uvp-client.md) |

The shared bottom line: none of these surfaces own order state — the authorized wallet's signature makes the business action. Registry records cannot replace `PlanRegistered`, `SignalSubmitted`, or the Identity Registry, and cannot generate business signatures on behalf of participants.

## Periphery adapters

Funding, guarantee, AI/MCP, and demo executors can live in `uvp-periphery`. They consume `UVPStateMachine`, optional `UVPIdentityRegistry` name resolution, Product DTOs, or uvp-client instead of defining new core order truth.
