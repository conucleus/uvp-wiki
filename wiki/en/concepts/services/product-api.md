---
title: Product API
type: explanation
audience: 应用开发者
status: verified
---

# Product API

The Product API is the main entry point for ordinary participants, the Order App, executor-kit, and agent adapters to consume the rebuildable service layer. It translates chain-event projections into orders, tasks, timelines, proofs, and submission containers in ordinary user language.

## Code Entry Points

| File | Responsibility |
| --- | --- |
| `src/product/service.ts` | Product order/task/timeline/proof projection service. |
| `src/product/staging-readiness.ts` | Staging readiness gate and redacted readiness summary. |
| `src/api/routes/product-read.ts` | Product read routes. |
| `src/api/routes/evidence.ts` | Product evidence route. |
| `src/api/routes/stage-patches.ts` | Product stage patch prepare/submit routes. |
| `src/api/routes/submissions.ts` | Product submission status routes. |

## Core Routes

For the full route list, see [Product API Endpoints](../../reference/product-api-endpoints.md).

The Product object is an Order — one runtime instance of a Zhixu; route naming keeps the order/task/proof vocabulary and does not introduce traditional linear `/product/flows` semantics.

## Language Boundary

The Product API hides low-level details such as HookPlan, sourceId, signalId, ABI, and gas from ordinary users, translating on-chain state into "orders, tasks, evidence, proof, next step". Proof fields still retain the tx hash, block, log index, contract address, chain id, and event type needed by advanced readers.

## `/product/me`

`/product/me` must filter tasks from an explicit wallet address, which can come from a query, header, or wallet context. Display names, role labels, or Store metadata may only assist presentation; authority comes from state-machine projection and order-level submitter authorization.

## Boundaries

- The Product API may prepare typed data, verify signatures, call the relayer, and return proof.
- Order-level authorization is still checked by the contract.
- Drafts, submission status, and notification state are labeled workflow/projection state.
- Revoked plan/supplier entries remain displayed as revoked/blocked in the Product API.
- Staging readiness is service-instance health and boundary checking; production claims require release evidence.
