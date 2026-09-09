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

### Access policy: pure on-chain facts are public, business records require identity

`GET /product/orders/:orderId/timeline` and `GET /product/orders/:orderId/proof` are projections of pure on-chain facts. **Anonymous readability is by design** (whitepaper §7: chain events are the publicly replayable truth; off-chain projections are rebuildable from events and create no facts) — not a missing auth gate.

In contrast, business-record endpoints always require a session identity (whitepaper §7.2, minimal business visibility): `GET /product/submissions/:submissionId` and `GET /product/order-triggers/:triggerId` require a wallet session (or an explicit dev identity in local development); the invite preview `GET /product/invites/:inviteId` additionally requires the one-time invite token (hash-compared), and its response is a minimal field set — contact info is masked and money amounts are visible only to the draft creator or accepted participants.

## Product BFF (drafts, invites, and order triggers)

```text
POST /product/order-drafts
GET  /product/order-drafts/:draftId
PATCH /product/order-drafts/:draftId
POST /product/order-drafts/:draftId/prepare-trigger
POST /product/order-drafts/:draftId/trigger
GET  /product/order-triggers/:triggerId
GET  /product/orders/:draftId/participants
POST /product/orders/:draftId/invites
GET  /product/invites/:inviteId
POST /product/invites/:inviteId/accept
POST /product/invites/:inviteId/reject
```

Business records (order triggers, invite preview) require a session identity / invite token per the policy above; `triggerId` is a non-enumerable random id. Draft reads and participant lists are limited to the creator or accepted participants.

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

The Store Console also lives in chain-services and is authorized by capability: a wallet first establishes a session via challenge/verify, later requests identify themselves with the session credential; `store.read` is the anonymous public read capability, and each write requires its own `store.*` capability (e.g. `store.draft.review`, `store.version.activate`, `store.supplier.review`, `store.docking.create`, `store.listing.manage`).

Sessions and identity:

```text
POST /store/auth/challenge
POST /store/auth/verify
POST /store/auth/logout
GET  /store/auth/session
GET  /store/auth/addresses
POST /store/auth/addresses/revoke
GET  /store/session
```

Catalog, order, and operations reads:

```text
GET  /store/search
GET  /store/audit
GET  /store/runtime/summary
GET  /store/zhixus
GET  /store/zhixus/:zhixuId
GET  /store/zhixus/:zhixuId/orders
GET  /store/orders/:orderId/candidates
GET  /store/orders/:orderId/observation
GET  /store/orders/:orderId/replay
GET  /store/orders/:orderId/audit-summary
GET  /store/closure/dry-run
```

Zhixu drafts, product schemas, and versions:

```text
POST /store/zhixu-drafts/import
GET  /store/zhixu-drafts/:draftId
POST /store/zhixu-drafts/:draftId/compile-preview
POST /store/zhixu-drafts/:draftId/submit-review
GET  /store/zhixu-drafts/:draftId/product-schema
PUT  /store/zhixu-drafts/:draftId/product-schema
POST /store/zhixu-drafts/:draftId/product-schema/validate
GET  /store/product-schemas/:planId/:planHash
GET  /store/zhixu-series/:seriesId/versions
POST /store/zhixu-series/:seriesId/versions/:versionId/activate
POST /store/zhixu-series/:seriesId/versions/:versionId/deprecate
```

Supplier directory:

```text
GET  /store/suppliers
POST /store/suppliers
GET  /store/suppliers/:supplierId
GET  /store/suppliers/:supplierId/audits
POST /store/suppliers/:supplierId/review
POST /store/suppliers/:supplierId/request-identity-registration
POST /store/suppliers/:supplierId/request-identity-revocation
POST /store/suppliers/:supplierId/notification-profile
POST /store/suppliers/:supplierId/notification-profile/prepare
```

Docking workbench:

```text
POST /store/docking-sessions
GET  /store/docking-sessions/:sessionId
POST /store/docking-sessions/:sessionId/validate
POST /store/docking-sessions/:sessionId/save-draft-map
```

Listings and page decoration:

```text
POST /store/listings/import
GET  /store/listings
GET  /store/listings/:listingId
POST /store/listings/:listingId/anchor-verification
POST /store/listings/:listingId/review
POST /store/listings/:listingId/delist
POST /store/listings/:listingId/relist
GET  /store/decoration/:planId
PUT  /store/decoration/:planId
GET  /store/decoration/:planId/versions/:version
POST /store/decoration/:planId/versions/:version/restore
GET  /store/publishers/:publisherId/delegations
POST /store/publishers/delegations
POST /store/publishers/delegations/:delegationId/revoke
```

Join applications and assessments:

```text
POST /store/join-applications
GET  /store/join-applications
GET  /store/join-applications/:applicationId
POST /store/join-applications/:applicationId/review-start
POST /store/join-applications/:applicationId/approve
POST /store/join-applications/:applicationId/reject
POST /store/join-applications/:applicationId/revoke
GET  /store/compliance/capabilities
POST /store/compliance/access-preview
GET  /store/risk/capabilities
POST /store/risk/assess
```

Drafts, docking sessions, listings, decoration, supplier names, capability tags, matching profiles, and review records are Store off-chain facts. The Identity Registry projection only provides the public correspondence between `subjectId` and wallets.

## Readiness

```text
GET /product/staging/readiness
```

This endpoint outputs a redacted summary of deployment, indexing, storage, role inputs, and Product state; it returns `503 not_ready` when conditions are insufficient. The summary includes the deployment inventory, role-input posture, and participant wallets of sample tasks — operational detail that requires governance admin credentials (same gate as `/admin/diagnostics`; public aggregate health lives at `/healthz` and `/readyz`).

## Related Pages

- DTO fields and status mapping: [Product DTO](../concepts/product/dto.md)
- Start the API and frontends locally: [Run Services and Frontends](../how-to/run-services-and-apps.md)
- Service semantics and boundaries: [Product API (concept)](../concepts/services/product-api.md)
- Submission flow (typed data → signature → relayer): [Signal](../concepts/core/signal.md) and [EIP-712 and Relayer](../concepts/trust/eip712-relayer.md)
