---
title: Product API 参考
type: reference
audience: 工程贡献者
status: verified
---

# Product API 参考

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

Store 写接口需要 operator/admin 身份。Draft、docking session、供应商名称、能力标签、匹配资料与审核记录属于 Store 的链下事实。Identity Registry 投影只提供 `subjectId` 与钱包的公开对应关系。

## Readiness

```text
GET /product/staging/readiness
```

该接口输出脱敏的部署、索引、存储、角色输入与 Product 状态摘要；条件不足时返回 `503 not_ready`。
