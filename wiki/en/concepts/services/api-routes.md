---
title: API Routes
type: reference
audience: 工程贡献者
status: verified
---

# API Routes

`src/api/routes/` is the entry point for Chain Services HTTP route modules. Routes are grouped by consumption surface: generic chain reads, identity bindings, diagnostics, ops, and explicit 410 responses for migrated business surfaces. For user-facing route documentation, see [Product API Endpoints](../../reference/product-api-endpoints.md).

## Route Module Ownership

The authoritative source is route registration under `uvp-chain-services/service/src/api/routes.ts`.

| Route module | Ownership |
| --- | --- |
| `chain-read.ts` | `/chain/*` generic chain reads: orders, tasks, sync-state, snapshot (including the `stateMachineDockBindings` Dock binding projection with A/B window live enrichment), and plan admissions / triggers read faces. |
| `identity-bindings.ts` | `/identity/bindings` identity binding projection. |
| `diagnostics.ts` | Health / readiness diagnostics. |
| `admin-ops.ts` | Ops-only maintenance routes. |
| `v1-gone.ts` | Explicit 410 response for the V1 order surface (`v1_order_surface_removed`), pointing at the application side's V3 order routes. |

## Route Shell

| File | Responsibility |
| --- | --- |
| `src/api/server.ts` | HTTP server entry point. |
| `src/api/routes.ts` | Route registration. |
| `src/api/route-context.ts` | Stores, services, dock binding window reader, and runtime config injection. |
| `src/api/route-module.ts` | Route module interface. |
| `src/api/diagnostics.ts` | Readiness and redacted diagnostics helper. |
| `src/api/dock-binding-windows.ts` | Binding identity and emission come from event projections; current A/B windows are read live from the stage-patch `dockOutputWindow` view at request time. |
| `src/security/admin-auth.ts`, `audit.ts` | Ops admin authentication and audit. |

## Design Rules

- A new route must clearly belong to chain reads, identity, diagnostics, ops, or business-surface migration responses.
- Chain-read routes expose no business rows, wallet sessions, or Store workflow.
- Business write paths (order drafts/invites/participants, evidence, governance, submission orchestration) belong to the application side; this package does not broadcast or create business signatures.
- There are no local E2E fixture-control routes; testnet/production profiles fail closed on missing explicit configuration — see [Storage, Migration, and Runtime Profile](storage-runtime.md) for the full checklist.
- Every public claim must be traceable to an event, hash, signature, DTO contract, or workflow audit.
