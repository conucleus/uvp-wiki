---
title: Product API 端点速查
type: reference
audience: 工程贡献者
status: verified
---

# Product API 端点速查

`@uvp-eth/chain-services` 在本仓承担链读与运维面：把链事件投影成通用链读路由（`/chain/*`）、身份绑定读面与运维门。Product 业务写路径（draft、invite、task action、evidence、submission 编排）与 Store Console 工作台端点由 used-car 应用仓 backend 拥有；其 HTTP 路径、表与签名 key 以应用仓 API 契约为准。

> 待确认：应用仓 Product / Store 端点名不在本仓核验范围；引用具体路径前以应用仓 `app-contract` 的路径契约为准。

## 本仓链读与运维端点

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

链读语义：

- `/chain/orders` 与 `/chain/orders/:orderId` 都以 `{ orders }` 返回；订单 id 按 plan 作用域，单条读在无投影时返回 404，不退化成空。
- `/chain/orders/:orderId/tasks`、`/chain/tasks`、`/chain/tasks/:taskId` 给任务投影；任务只由链事件生成。
- `/chain/sync-state`、`/chain/snapshot` 给同步状态与快照。snapshot 含静态 Dock（`uvp.dock.v1`）与 DockBinding/per-output 投影（`uvp.dockBinding.v1`）：binding 身份、emitted 事实来自链上事件，A/B 窗口的当前 `satisfied` 与相对 `dueInSeconds` 是读时对 `UVPStagePatchModule.dockOutputWindow` view 的 live enrichment，不持久、不构成历史。
- `/chain/plans/:planId/:planHash/admissions` 与 `/triggers` 读计划编译产物（`plan_artifacts`）；出生线由 `triggers[]` 枚举。
- `/identity/bindings` 是身份绑定只读投影。
- 运维面：`/healthz`、`/readyz`、`/admin/diagnostics`、`/admin/ops/*` 要求运维 admin 凭据。

## Product 业务端点（应用仓 backend 拥有）

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

Plan 发布状态来自 `UVPStateMachine.PlanRegistered` 投影。任务来自 `HookReady`，执行钱包来自 Plan 声明的 signal capability 与订单级 `SignalSubmitterAuthorized`。角色名称只负责展示。

### 访问口径：timeline/proof 走参与者门，业务档案凭身份与归属

`GET /product/orders/:orderId/timeline` 与 `GET /product/orders/:orderId/proof` 虽是纯链上事实的投影，但事件载荷携带信号提交者钱包、签名细节等参与者数据——与订单详情同口径走参与者门（白皮书 §7：链上事件公开可回放指的是直接读链，不等于链下读端点匿名开放）：要求会话身份（钱包会话，或 local 开发的显式 dev 身份），且只有订单参与者（链上指派钱包、在任执行者、创建者或已接受参与的订单归属）可读；匿名请求返回 401，非参与者与"订单不存在"同响应（404），不泄露存在性。

业务档案端点同样要求会话身份（白皮书 §7.2 业务面最小可见）：`GET /product/submissions/:submissionId`、`GET /product/order-triggers/:triggerId` 要求钱包会话（或 local 开发的显式 dev 身份），会话钱包还须与档案归属比对；邀请预览 `POST /product/invites/:inviteId` 必须携带一次性 invite token（哈希比对，随请求体提交；会话钱包可选，仅用于金额可见范围判定），且响应只含最小字段集——联系方式脱敏、金额仅对创建者/已接受参与者可见。

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
POST /product/invites/:inviteId
POST /product/invites/:inviteId/accept
POST /product/invites/:inviteId/reject
```

业务档案（order-triggers、邀请预览）按上节口径要求会话身份/invite token；`triggerId` 为不可枚举随机 id。草稿读取与参与者名单限创建者或已接受参与者。BFF 持久化 draft 与 workflow 状态；真正让订单存在的是 `UVPStateMachine` 的出生事件，真正推进任务的是 `SignalSubmitted`、`HookReady` 等链事件。

## Submission 与 Evidence

```text
POST /product/evidence
GET  /product/evidence/:evidenceId
GET  /product/evidence/:evidenceId/proof
POST /product/tasks/:taskId/prepare-submit
POST /product/tasks/:taskId/submit
GET  /product/submissions/:submissionId
```

`prepare-submit` 生成 EIP-712 typed data。`submit` 验证签名并交给 relayer；链上结果以 `SignalSubmitted` 为准。协议侧 signal 写入口是 direct `submitSignal`（身份固定 `msg.sender`，合约 executor 可由 relayer 代付）。

## Order Overlay（协议面）

executor patch：`UVPStagePatchModule` 的 `StageExecutorPatch` typed data（域 `stageExecutorPatch` 0.4，mode 闭集 `assign`/`handoff`）→ `applyStageExecutorPatchFor`；signed 入口携带 `bindingProof`、`candidateProof` 与 `executorAuthorizations`。

阶段文件 patch：随 direct `submitSignal` 尾部 `bytes32 filesDigest` + `FilePatch` 提交（`signalId == 0` 为纯文件 patch），由 `UVPFileResourceModule.applyStageFilePatch` 落 `add` / `replace` / `remove`；`baseHash` 必填并等于该 stage 当前文件版本。

产品侧的 typed data 准备与提交编排由应用仓 backend 维护，端点名以应用仓 API 契约为准。

## Store Console

Store Console 同样位于应用仓，按能力（capability）授权：钱包先经 challenge/verify 建立会话，后续请求以会话凭证标识身份；`store.read` 是匿名可用的公开读能力，写操作各自要求对应的 `store.*` 能力（如 `store.draft.review`、`store.version.activate`、`store.supplier.review`、`store.listing.manage`）。

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

Dock 工作台（Store 链下 workflow）：

Dock 试拼会话、validate 与 draft map 属 Store 链下材料；应用仓维护其端点与存储。链上事实以 `DockRegistered`、`StageDockExecutorSelected`、`DockBindingPoked`、`DockOutputSubmitted` 与两侧订单事件为准。

Listing 与页面装饰：

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

入驻申请：

```text
POST /store/join-applications
GET  /store/join-applications
GET  /store/join-applications/:applicationId
POST /store/join-applications/:applicationId/review-start
POST /store/join-applications/:applicationId/approve
POST /store/join-applications/:applicationId/reject
POST /store/join-applications/:applicationId/revoke
```

Draft、Dock 试拼会话、listing、装饰、供应商名称、能力标签、匹配资料与审核记录属于 Store 的链下事实。Identity Registry 投影只提供 `subjectId` 与钱包的公开对应关系。

## Readiness

本仓运维就绪走 `GET /readyz` 与 `GET /admin/diagnostics`；staging readiness 摘要（部署、索引、存储、角色输入与样本参与方钱包）属应用仓/运维面，要求治理 admin 凭据。

## 相关页面

- 链读 DTO 与字段：[Chain Services](../concepts/services/chain-services.md)
- DTO 字段与状态映射：[Product DTO](../concepts/product/dto.md)
- 本地启动 API 与前端：[运行服务和前端](../how-to/run-services-and-apps.md)
- 服务语义与边界：[Product API（概念）](../concepts/services/product-api.md)
- 提交链路（typed data → 签名 → relayer）：[Signal](../concepts/core/signal.md) 与 [EIP-712 与 Relayer](../concepts/trust/eip712-relayer.md)
