# Product API 参考

Product API 位于 `@uvp-eth/chain-services`，模块归属见 [Chain Services](../components/chain-services.md)。它把链事件 projection 翻译成 Store、Order App 和 executor-kit 可消费的 DTO。

## Catalog 和 Orders

```text
GET /product/zhixus
GET /product/zhixus/:zhixuId
GET /product/orders
GET /product/orders/:orderId
GET /product/orders/:orderId/timeline
GET /product/orders/:orderId/proof
```

规则：

- `/product/zhixus` 是 canonical route。
- `/product/zhixu` 只是旧 singular alias。
- `/product/flows` 不存在。
- `zhixus` 默认只返回 official-domain active/non-revoked plan。
- bare `orderId` 若跨 state-machine deployment 不唯一，应返回 ambiguous candidates。

## Tasks 和 Participant Scope

```text
GET /product/tasks
GET /product/tasks/:taskId
GET /product/me
GET /product/me/orders
GET /product/me/tasks
GET /product/me/tasks/:taskId
```

`/product/me*` 通过以下输入显式过滤 wallet：

- `wallet`
- `walletAddress`
- `x-uvp-wallet-address`
- `x-wallet-address`

它不能从角色 label 推断权限。任务必须来自 indexed state-machine projection 和
order-level submitter authorization。

## Submission

```text
POST /product/tasks/:taskId/prepare-submit
POST /product/tasks/:taskId/submit
GET  /product/submissions/:submissionId
```

`prepare-submit` 生成 EIP-712 typed data。`submit` 验证签名并把 signed payload
交给 relayer adapter。Relayer broadcast disabled 时，API 可以在签名验证后记录
`broadcast_disabled`，但不能伪造链上信号。

## Stage Overlay

```text
POST /product/tasks/:taskId/prepare-stage-executor-patch
POST /product/tasks/:taskId/submit-stage-executor-patch
POST /product/tasks/:taskId/prepare-stage-resource-patch
POST /product/tasks/:taskId/submit-stage-resource-patch
```

Executor patch 只处理 executor selection/handoff/replacement。Resource patch
绑定 `resourceKey`、`manifestHash`、`policyHash` 和 `manifestURI`。生产模式应拒绝
legacy `http`、`txcloud` 和 `plain_text` resource handle。

## Evidence

当前 chain-services compatibility routes：

```text
POST /product/evidence
GET  /product/evidence/:evidenceId
GET  /product/evidence/:evidenceId/proof
```

Order App 的目标边界是：

```text
POST /evidence
GET  /evidence/:evidenceId/proof
```

迁移期间可用 `VITE_UVP_ORDER_APP_EVIDENCE_ROUTE_MODE=chain-services-compat`。

## Readiness

```text
GET /product/staging/readiness
```

这个 route 是 release-evidence gate。它应返回 redacted summary，并在未满足 staging
条件时返回 `503 not_ready`。

## Store Console API

Store routes 是 nucleus/operator 表面，不是 ordinary participant 表面：

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

Store write routes 需要 operator/admin identity。Store draft、docking session 和
supplier metadata 不能替代 chain attestation。
