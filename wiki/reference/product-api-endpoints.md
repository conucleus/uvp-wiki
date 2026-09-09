---
title: Product API 端点速查
type: reference
audience: 工程贡献者
status: verified
---

# Product API 端点速查

Product API 位于 `@uvp-eth/chain-services`，把 StateMachine 事件投影与 Store 链下资料组合成 Store、Order App 和 executor-kit 使用的 DTO。

## Catalog、Orders 与 Tasks

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

Plan 发布状态来自 `UVPStateMachine.PlanRegistered` 投影。任务来自 `HookReady`，执行钱包来自 Plan 声明的 signal capability 与订单级 `SignalSubmitterAuthorized`。角色名称只负责展示。

### 访问口径：纯链上事实公开，业务档案凭身份

`GET /product/orders/:orderId/timeline` 与 `GET /product/orders/:orderId/proof` 是纯链上事实的投影，**匿名可读是设计口径**（白皮书 §7：链上事件是公开可回放真相，链下投影可从事件重建、不造事实），不是漏配的鉴权缺口。

与之相对，业务档案端点一律要求会话身份（白皮书 §7.2 业务面最小可见）：`GET /product/submissions/:submissionId`、`GET /product/order-triggers/:triggerId` 要求钱包会话（或 local 开发的显式 dev 身份）；邀请预览 `GET /product/invites/:inviteId` 除会话身份外还必须携带一次性 invite token（哈希比对），且响应只含最小字段集——联系方式脱敏、金额仅对创建者/已接受参与者可见。

## Product BFF（草稿、邀请与订单触发）

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

业务档案（order-triggers、邀请预览）按上节口径要求会话身份/invite token；`triggerId` 为不可枚举随机 id。草稿读取与参与者名单限创建者或已接受参与者。

## Submission 与 Evidence

```text
POST /product/evidence
GET  /product/evidence/:evidenceId
GET  /product/evidence/:evidenceId/proof
POST /product/tasks/:taskId/prepare-submit
POST /product/tasks/:taskId/submit
GET  /product/submissions/:submissionId
```

`prepare-submit` 生成 EIP-712 typed data。`submit` 验证签名并交给 relayer；链上结果以 `SignalSubmitted` 为准。

## Order Overlay

```text
POST /product/tasks/:taskId/prepare-stage-executor-patch
POST /product/tasks/:taskId/submit-stage-executor-patch
POST /product/tasks/:taskId/prepare-stage-resource-patch
POST /product/tasks/:taskId/submit-stage-resource-patch
```

Executor patch 处理订单级 executor selection、handoff 和 replacement。Resource patch 绑定 `resourceKey`、`manifestHash`、`policyHash` 与 `manifestURI`。

## Store Console

Store Console 同样位于 chain-services，按能力（capability）授权：钱包先经 challenge/verify 建立会话，后续请求以会话凭证标识身份；`store.read` 是匿名可用的公开读能力，写操作各自要求对应的 `store.*` 能力（如 `store.draft.review`、`store.version.activate`、`store.supplier.review`、`store.docking.create`、`store.listing.manage`）。

会话与身份：

```text
POST /store/auth/challenge
POST /store/auth/verify
POST /store/auth/logout
GET  /store/auth/session
GET  /store/auth/addresses
POST /store/auth/addresses/revoke
GET  /store/session
```

目录、订单与运营读：

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

Zhixu 草稿、Product Schema 与版本：

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

供应商目录：

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

Docking 工作台：

```text
POST /store/docking-sessions
GET  /store/docking-sessions/:sessionId
POST /store/docking-sessions/:sessionId/validate
POST /store/docking-sessions/:sessionId/save-draft-map
```

Listing 与页面装饰：

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

入驻申请与评估：

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

Draft、docking session、listing、装饰、供应商名称、能力标签、匹配资料与审核记录属于 Store 的链下事实。Identity Registry 投影只提供 `subjectId` 与钱包的公开对应关系。

## Readiness

```text
GET /product/staging/readiness
```

该接口输出脱敏的部署、索引、存储、角色输入与 Product 状态摘要；条件不足时返回 `503 not_ready`。

## 相关页面

- DTO 字段与状态映射：[Product DTO](../concepts/product/dto.md)
- 本地启动 API 与前端：[运行服务和前端](../how-to/run-services-and-apps.md)
- 服务语义与边界：[Product API（概念）](../concepts/services/product-api.md)
- 提交链路（typed data → 签名 → relayer）：[Signal](../concepts/core/signal.md) 与 [EIP-712 与 Relayer](../concepts/trust/eip712-relayer.md)
