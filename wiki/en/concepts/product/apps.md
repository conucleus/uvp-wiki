---
title: Store and Order App
type: meta
audience: 产品与前端工程师
preread: README.md
status: verified
---

# Store and Order App

The Store, Order App, and executor-kit consume the same set of on-chain facts from different user perspectives. This page is an index; detailed boundaries of each surface live on their own pages.

| Surface | One-line positioning | See |
| --- | --- | --- |
| Store | The Nucleus's and operators' centralized governance and cataloging tool: order creation, task review, plan publication, supplier identity, metadata, review, audit. | [Zhixu Store](../store/README.md) |
| Order App | The ordinary participant task tool: to-dos, submission confirmation, evidence fingerprints, on-chain proof, readiness. | [Order App](../apps/order-app.md) |
| executor-kit | Integration tool for executors, enterprise systems, and AI/MCP adapters: Product API mode and chain watcher mode paths. | [Executor Kit](../apps/executor-kit.md), [Order App vs Executor Kit](../apps/order-app-vs-executor-kit.md) |

The shared bottom line for all three: they do not own order state — the authorized wallet's signature makes the business action. The Store's centralized authority can influence recommendations, reviews, tagging, and governance entry points, but it cannot let metadata replace `PlanRegistered`, a review draft replace `SignalSubmitted`, or the Store database replace the Identity Registry, nor can it generate business signatures on behalf of participants.

## Periphery adapters

Funding, guarantee, AI/MCP, and demo executors can live in `uvp-periphery`. They consume `UVPStateMachine`, optional `UVPIdentityRegistry` name resolution, Product DTOs, or executor-kit instead of defining new core order truth.
