---
title: Product API Endpoints
type: reference
audience: 工程贡献者
status: verified
---

# Product API Endpoints

In this repository `@uvp-eth/chain-services` carries the chain-read and operations surface: it projects chain events into generic chain-read routes (`/chain/*`), identity-binding reads, and operations gates. Product business write paths (drafts, invites, task actions, evidence, submission orchestration) and Store Console workbench endpoints are owned by the used-car application backend; their HTTP paths, tables, and signing keys follow that repository's API contract.

> Pending confirmation: application Product / Store endpoint names are outside this repository's verification scope; consult the application `app-contract` path contract before citing specific paths.

## Chain-read and operations endpoints in this repository

```text
GET  /chain/orders
GET  /chain/orders/:orderId
GET  /chain/orders/:orderId/tasks
GET  /chain/tasks
GET  /chain/tasks/:taskId
GET  /chain/sync-state
GET  /chain/snapshot
GET  /chain/plans/:planId/:planHash/admissions
GET  /chain/plans/:planId/:planHash/triggers
GET  /identity/bindings
GET  /healthz
GET  /readyz
GET  /admin/diagnostics
GET  /admin/ops/status
GET  /admin/ops/summary
POST /admin/ops/projections/rebuild
GET  /admin/ops/indexer/pending-steps
POST /admin/ops/indexer/pending-steps/retry
```

Chain-read semantics:

- `/chain/orders` and `/chain/orders/:orderId` both return `{ orders }`; order ids are plan-scoped, and a single read returns 404 when no projection exists rather than degrading to empty.
- `/chain/orders/:orderId/tasks`, `/chain/tasks`, and `/chain/tasks/:taskId` return task projections; tasks are generated only by chain events.
- `/chain/sync-state` and `/chain/snapshot` return sync state and a snapshot. The snapshot includes static Docks (`uvp.dock.v1`) and the DockBinding/per-output projection (`uvp.dockBinding.v1`): binding identity and emitted facts come from chain events, while the current A/B window `satisfied` flag and relative `dueInSeconds` are live enrichment from the `UVPStagePatchModule.dockOutputWindow` view at read time — not persisted, not history.
- `/chain/plans/:planId/:planHash/admissions` and `/triggers` read the plan compilation artifact (`plan_artifacts`); birth lines are enumerated by `triggers[]`.
- `/identity/bindings` is the read-only identity-binding projection.
- Operations surface: `/healthz`, `/readyz`, `/admin/diagnostics`, and `/admin/ops/*` require operations admin credentials.

## Product business endpoints (owned by the application backend)

```text
GET  /product/zhixus
GET  /product/zhixus/:zhixuId
GET  /product/orders
GET  /product/orders/:orderId
GET  /product/orders/:orderId/timeline
GET  /product/orders/:orderId/proof
GET  /product/tasks
GET  /product/tasks/:taskId
GET  /product/me
GET  /product/me/orders
GET  /product/me/tasks
GET  /product/me/tasks/:taskId
GET  /product/me/activity-feed
```

Plan publication status comes from the `UVPStateMachine.PlanRegistered` projection. Tasks come from `HookReady`; executor wallets come from the `stage -> supplierId` assignment and `UVPIdentityRegistry.accountOf(supplierId)`, with an active SID. Role names are display only.

### Access policy: timeline/proof use the participant gate, business records require identity and ownership

`GET /product/orders/:orderId/timeline` and `GET /product/orders/:orderId/proof` are projections of pure on-chain facts, but their event payloads carry participant data such as signal-submitter wallets and signature details — they use the same participant gate as the order detail (whitepaper §7: chain events being publicly replayable refers to reading the chain directly; it does not mean the off-chain read endpoints are open anonymously): they require a session identity (a wallet session, or an explicit dev identity in local development), and only order participants (on-chain assignee wallets, active executors, the creator, or accepted participants) may read them; anonymous requests get 401, and non-participants get the same response as "order not found" (404), leaking no existence.

Business-record endpoints likewise require a session identity (whitepaper §7.2, minimal business visibility): `GET /product/submissions/:submissionId` and `GET /product/order-triggers/:triggerId` require a wallet session (or an explicit dev identity in local development), and the session wallet must further match the record's owner; the invite preview `POST /product/invites/:inviteId` must carry the one-time invite token (hash-compared, submitted in the request body; a session wallet is optional and only widens amount visibility), and its response is a minimal field set — contact info is masked and money amounts are visible only to the draft creator or accepted participants.

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
POST /product/invites/:inviteId
POST /product/invites/:inviteId/accept
POST /product/invites/:inviteId/reject
```

Business records (order triggers, invite preview) require a session identity / invite token per the policy above; `triggerId` is a non-enumerable random id. Draft reads and participant lists are limited to the creator or accepted participants. The BFF persists draft and workflow state; what actually makes an order exist is a birth event on `UVPStateMachine`, and what actually advances tasks are chain events such as `SignalSubmitted` and `HookReady`.

## Submission and Evidence

```text
POST /product/evidence
GET  /product/evidence/:evidenceId
GET  /product/evidence/:evidenceId/proof
POST /product/tasks/:taskId/prepare-submit
POST /product/tasks/:taskId/submit
GET  /product/submissions/:submissionId
```

`prepare-submit` produces EIP-712 typed data. `submit` verifies the signature and hands the request to the relayer; the on-chain result is authoritative via `SignalSubmitted`. The protocol-side signal entry is direct `submitSignal` (identity fixed to `msg.sender`; a contract executor may be paid for by a relayer).

## Order Overlay (protocol side)

Stage supplier patch: `UVPStagePatchModule`'s `StageSupplierPatch` typed data (domain `stageSupplierPatch` 1, with `previousSupplierId` distinguishing assign/handoff) → `applyStageSupplierPatchFor`; the signed entry carries `bindingProof` and `candidateProof`.

Stage file write: submitted as `files: StageFile[]` on `submitSignal` (`signalId == 0` is a pure file write) and applied by `UVPFileResourceModule.applyStageFiles` with same-key overwrite.

The application backend owns product-side typed-data preparation and submission orchestration; endpoint names follow the application API contract.

## Store Console

The Store Console also lives in the application repository and is authorized by capability: a wallet first establishes a session via challenge/verify, and later requests identify themselves with the session credential; `store.read` is the anonymous public read capability, and each write requires its own `store.*` capability (e.g. `store.draft.review`, `store.version.activate`, `store.supplier.review`, `store.listing.manage`).

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

Dock workbench (Store off-chain workflow):

Dock assembly sessions, validation, and draft maps are Store off-chain materials; the application repository owns their endpoints and storage. On-chain facts are `DockRegistered`, `StageDockSupplierSelected`, `DockBindingPoked`, `DockOutputSubmitted`, and the two orders' events.

Listings and page decoration:

```text
POST /store/listings/import
GET  /store/listings
GET  /store/listings/:listingId
GET  /store/listings/:listingId/anchor-verification
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

Join applications:

```text
POST /store/join-applications
GET  /store/join-applications
GET  /store/join-applications/:applicationId
POST /store/join-applications/:applicationId/review-start
POST /store/join-applications/:applicationId/approve
POST /store/join-applications/:applicationId/reject
POST /store/join-applications/:applicationId/revoke
```

Drafts, Dock assembly sessions, listings, decoration, supplier names, capability tags, matching profiles, and review records are Store off-chain facts. The Identity Registry projection only provides the public correspondence between `subjectId` and wallets.

## Readiness

Operational readiness in this repository is `GET /readyz` and `GET /admin/diagnostics`; the staging readiness summary (deployment, indexing, storage, role inputs, and sample participant wallets) belongs to the application/operations surface and requires governance admin credentials.

## Related Pages

- Chain-read DTOs and fields: [Chain Services](../concepts/services/chain-services.md)
- DTO fields and status mapping: [Product DTO](../concepts/product/dto.md)
- Start the API and frontends locally: [Run Services and Frontends](../how-to/run-services-and-apps.md)
- Service semantics and boundaries: [Product API (concept)](../concepts/services/product-api.md)
- Submission flow (typed data → signature → relayer): [Signal](../concepts/core/signal.md) and [EIP-712 and Relayer](../concepts/trust/eip712-relayer.md)
