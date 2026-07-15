# Product API Reference

The Product API lives in `@uvp-eth/chain-services`. It combines StateMachine event projections with Store-managed off-chain records for Store, Order App, and executor-kit DTOs.

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

Plan publication comes from the `UVPStateMachine.PlanRegistered` projection. Tasks come from `HookReady`; executor wallets come from Plan-declared signal capabilities and order-level `SignalSubmitterAuthorized` events. Role names are display metadata.

## Submission and Evidence

```text
POST /product/evidence
GET  /product/evidence/:evidenceId
GET  /product/evidence/:evidenceId/proof
POST /product/tasks/:taskId/prepare-submit
POST /product/tasks/:taskId/submit
GET  /product/submissions/:submissionId
```

`prepare-submit` produces EIP-712 typed data. `submit` verifies the signature and hands the request to the relayer. `SignalSubmitted` records the on-chain result.

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

Store writes require operator/admin identity. Drafts, docking sessions, supplier names, capability tags, matching records, and reviews are Store-managed off-chain facts. The Identity Registry projection only exposes the public `subjectId` to wallet mapping.

## Readiness

```text
GET /product/staging/readiness
```

This endpoint returns a redacted deployment, indexer, storage, role-input, and Product-state summary. It returns `503 not_ready` when the required conditions are incomplete.
