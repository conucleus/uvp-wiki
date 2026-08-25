---
title: API Routes
type: reference
audience: 工程贡献者
status: verified
---

# API Routes

`src/api/routes/` is the entry point for Chain Services HTTP route modules. Routes are grouped by consumption surface: Product, Store, submission, evidence, governance, notification, diagnostics, and local test control. For user-facing route documentation, see [Product API Endpoints](../../reference/product-api-endpoints.md).

## Route Module Ownership

Authoritative source: route registration under `uvp-chain-services/service/src`.

| Route module | Ownership |
| --- | --- |
| `product-read.ts` | Product orders, tasks, timeline, and proof read model. |
| `product-bff.ts` | Order draft, invite, participant confirmation, registration submit. |
| `stage-patches.ts` | Executor/resource patch prepare and submit. |
| `submissions.ts` | Wallet submit, submission status, retry entry points. |
| `evidence.ts` | Evidence upload metadata, proof route, object handle. |
| `store-console.ts` | Store search, Zhixu console, draft/version/runtime views. |
| `store-docking.ts` | Docking session, validate, draft map. |
| `store-suppliers.ts` | Supplier directory, review, matching-material input. |
| `governance.ts` | Admin review, identity binding register/revoke tx workflow. |
| `notifications.ts` | Supplier notification profile, delivery ops. |
| `diagnostics.ts` | Health/readiness/admin diagnostics. |
| `admin-ops.ts` | Ops-only maintenance routes. |
| `e2e-controls.ts` | Local/Product E2E fixture controls; must be disabled on testnet/production. |

## Route Shell

| File | Responsibility |
| --- | --- |
| `src/api/server.ts` | HTTP server entry point. |
| `src/api/routes.ts` | Route registration. |
| `src/api/route-context.ts` | Stores, services, and runtime config injection. |
| `src/api/store-authz.ts` | Store operator/admin headers and access control. |
| `src/api/diagnostics.ts` | Readiness and redacted diagnostics helper. |
| `src/api/route-module.ts` | Route module interface. |

## Design Rules

- A new route must clearly belong to Product, Store, governance, ops, or local E2E.
- Product routes must not expose Store admin workflows.
- Store routes must not fabricate Product proof, Plan publication state, or identity bindings.
- E2E controls are for local testing only; testnet/production profiles must fail closed — see [Storage, Migration, and Runtime Profile](storage-runtime.md) for the full checklist.
- Every public claim must be traceable to an event, hash, signature, DTO contract, or workflow audit.
