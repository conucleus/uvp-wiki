# API Routes

`src/api/routes/` is the entry point for Chain Services HTTP route modules. Routes are grouped by consumption surface: Product, Store, submission, evidence, governance, notification, diagnostics, and local test control.

## Route Module Ownership

| Route module | Ownership |
| --- | --- |
| `product-read.ts` | Product orders, tasks, timeline, proof read model. |
| `product-bff.ts` | order draft, invite, participant confirmation, registration submit. |
| `stage-patches.ts` | executor/resource patch prepare and submit. |
| `submissions.ts` | wallet submit, submission status, retry entry point. |
| `evidence.ts` | evidence upload metadata, proof route, object handle. |
| `store-console.ts` | Store search, Zhixu console, draft/version/runtime view. |
| `store-docking.ts` | docking session, validate, draft map. |
| `store-suppliers.ts` | supplier directory, review, and matching inputs. |
| `governance.ts` | admin review and identity-binding register/revoke transaction workflow. |
| `notifications.ts` | supplier notification profile, delivery ops. |
| `diagnostics.ts` | health/readiness/admin diagnostics. |
| `admin-ops.ts` | ops-only maintenance route. |
| `e2e-controls.ts` | local/product E2E fixture controls; must be disabled for testnet/production. |

## Route Shell

| File | Responsibility |
| --- | --- |
| `src/api/server.ts` | HTTP server entry point. |
| `src/api/routes.ts` | route registration. |
| `src/api/route-context.ts` | stores, services, and runtime config injection. |
| `src/api/store-authz.ts` | Store operator/admin headers and access control. |
| `src/api/diagnostics.ts` | readiness and redacted diagnostics helper. |
| `src/api/route-module.ts` | route module interface. |

## Design Rules

- A new route must clearly belong to Product, Store, governance, ops, or local E2E.
- Product routes must not expose Store admin workflows.
- Store routes must not fabricate Product proof, Plan publication state, or identity bindings.
- E2E controls are for local testing only; testnet/production profiles must fail closed.
- Every public claim must be traceable to an event, hash, signature, DTO contract, or workflow audit.
