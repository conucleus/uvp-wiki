---
title: Product API Endpoints
type: reference
audience: 工程贡献者
status: verified
---

# Product API Endpoints

The Product API lives in `@uvp-eth/chain-services`. It combines StateMachine event projections with Store-managed off-chain records into the DTOs used by Store, Order App, and executor-kit.

## Catalog, Orders, and Tasks

```text
GET /product/zhixus
GET /product/zhixus/:zhixuId
GET /product/orders
GET /product/orders/:orderId
GET /product/orders/:orderId/timeline
GET /product/orders/:orderId/proof
GET /product/tasks
GET /product/tasks/:taskId
GET /product/me
GET /product/me/orders
GET /product/me/tasks
GET /product/me/tasks/:taskId
GET /product/me/activity-feed
```

Plan publication status comes from the `UVPStateMachine.PlanRegistered` projection. Tasks come from `HookReady`; executor wallets come from Plan-declared signal capabilities and order-level `SignalSubmitterAuthorized`. Role names are display only.

## Submission and Evidence

```text
POST /product/evidence
GET  /product/evidence/:evidenceId
GET  /product/evidence/:evidenceId/proof
POST /product/tasks/:taskId/prepare-submit
POST /product/tasks/:taskId/submit
GET  /product/submissions/:submissionId
```

`prepare-submit` produces EIP-712 typed data. `submit` verifies the signature and hands the request to the relayer; the on-chain result is authoritative via `SignalSubmitted`.

## Order Overlay

```text
POST /product/tasks/:taskId/prepare-stage-executor-patch
POST /product/tasks/:taskId/submit-stage-executor-patch
POST /product/tasks/:taskId/prepare-stage-resource-patch
POST /product/tasks/:taskId/submit-stage-resource-patch
```

Executor patches handle order-level executor selection, handoff, and replacement. Resource patches bind `resourceKey`, `manifestHash`, `policyHash`, and `manifestURI`.

## Store Console

```text
GET  /store/session
GET  /store/search
GET  /store/audit
GET  /store/runtime/summary
GET  /store/zhixus
GET  /store/zhixus/:zhixuId
GET  /store/orders/:orderId/candidates
POST /store/docking-sessions
GET  /store/docking-sessions/:sessionId
POST /store/docking-sessions/:sessionId/validate
POST /store/docking-sessions/:sessionId/save-draft-map
POST /store/zhixu-drafts/import
GET  /store/zhixu-drafts/:draftId
POST /store/zhixu-drafts/:draftId/compile-preview
POST /store/zhixu-drafts/:draftId/submit-review
GET  /store/suppliers
GET  /store/suppliers/:supplierId
POST /store/suppliers
POST /store/suppliers/:supplierId/review
POST /store/suppliers/:supplierId/request-identity-registration
POST /store/suppliers/:supplierId/request-identity-revocation
```

Store write endpoints require operator/admin identity. Drafts, docking sessions, supplier names, capability tags, matching profiles, and review records are Store off-chain facts. The Identity Registry projection only provides the public correspondence between `subjectId` and wallets.

## Readiness

```text
GET /product/staging/readiness
```

This endpoint outputs a redacted summary of deployment, indexing, storage, role inputs, and Product state; it returns `503 not_ready` when conditions are insufficient.

## Related Pages

- DTO fields and status mapping: [Product DTO](../concepts/product/dto.md)
- Start the API and frontends locally: [Run Services and Frontends](../how-to/run-services-and-apps.md)
- Service semantics and boundaries: [Product API (concept)](../concepts/services/product-api.md)
- Submission flow (typed data → signature → relayer): [Signal](../concepts/core/signal.md) and [EIP-712 and Relayer](../concepts/trust/eip712-relayer.md)
