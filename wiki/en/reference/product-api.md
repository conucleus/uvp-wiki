# Product API Reference

The Product API lives in `@uvp-eth/chain-services`, and its module ownership is described in [Chain Services](../components/chain-services.md). It translates chain-event projections into DTOs consumable by Store, Order App, and executor-kit.

## Catalog and Orders

```text
GET /product/zhixus
GET /product/zhixus/:zhixuId
GET /product/orders
GET /product/orders/:orderId
GET /product/orders/:orderId/timeline
GET /product/orders/:orderId/proof
```

Rules:

- `/product/zhixus` is the canonical route.
- `/product/zhixu` is only a legacy singular alias.
- `/product/flows` does not exist.
- `zhixus` returns active, non-revoked plans from the configured product registry projection by default.
- If a bare `orderId` is not unique across state-machine deployments, the API should return ambiguous candidates.

## Tasks and Participant Scope

```text
GET /product/tasks
GET /product/tasks/:taskId
GET /product/me
GET /product/me/orders
GET /product/me/tasks
GET /product/me/tasks/:taskId
```

`/product/me*` explicitly filters wallets through these inputs:

- `wallet`
- `walletAddress`
- `x-uvp-wallet-address`
- `x-wallet-address`

Role labels are for display only. Tasks must come from the indexed state-machine projection and order-level submitter authorization.

## Submission

```text
POST /product/tasks/:taskId/prepare-submit
POST /product/tasks/:taskId/submit
GET  /product/submissions/:submissionId
```

`prepare-submit` generates EIP-712 typed data. `submit` verifies the signature and hands the signed payload to the relayer adapter. When relayer broadcast is disabled, the API may record `broadcast_disabled` after signature verification; the on-chain signal is still authoritative through `SignalSubmitted`.

## Stage Overlay

```text
POST /product/tasks/:taskId/prepare-stage-executor-patch
POST /product/tasks/:taskId/submit-stage-executor-patch
POST /product/tasks/:taskId/prepare-stage-resource-patch
POST /product/tasks/:taskId/submit-stage-resource-patch
```

Executor patch only handles executor selection, handoff, and replacement. Resource patch binds `resourceKey`, `manifestHash`, `policyHash`, and `manifestURI`. Production mode should reject legacy `http`, `txcloud`, and `plain_text` resource handles.

## Evidence

Current chain-services compatibility routes:

```text
POST /product/evidence
GET  /product/evidence/:evidenceId
GET  /product/evidence/:evidenceId/proof
```

The target boundary for Order App is:

```text
POST /evidence
GET  /evidence/:evidenceId/proof
```

During migration, `VITE_UVP_ORDER_APP_EVIDENCE_ROUTE_MODE=chain-services-compat` may be used.

## Readiness

```text
GET /product/staging/readiness
```

This route is the release-evidence gate. It should return a redacted summary and `503 not_ready` when staging conditions are not met.

## Store Console API

Store routes are the nucleation/operator surface; ordinary participant surfaces go through Product/Order App routes:

```text
GET  /store/search
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
POST /store/zhixu-drafts/:draftId/request-attestation
GET  /store/suppliers
GET  /store/suppliers/:supplierId
POST /store/suppliers
POST /store/suppliers/:supplierId/review
POST /store/suppliers/:supplierId/request-attestation
POST /store/suppliers/:supplierId/request-revocation
```

Store write routes require operator/admin identity. Store draft, docking session, and supplier metadata are workflow/material; chain attestation comes from trust-registry projection.
