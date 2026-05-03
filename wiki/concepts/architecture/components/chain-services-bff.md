# Product BFF

Product BFF 位于 `uvp-chain-services/service/src/product/bff/`。它负责订单草稿、邀请、参与方确认、授权构建和订单注册提交工作流。

## 职责

Product BFF 处理“把一个可创建订单的 Zhixu 变成一笔待注册订单”的产品过程：

- 创建 order draft。
- 生成并管理参与方 invite。
- 记录参与方 accept/reject。
- 校验 Zhixu 是否有 active Store version。
- 校验 plan 是否 attested、是否 revoked。
- 校验 supplier wallet 是否被 revoked。
- 从 `orderPermissionTable` 和参与方列表生成 `SignalAuthorization[]`。
- 准备订单注册 payload 和初始 trigger。
- 跟踪 registration submission 和 retry。

## 代码入口

| 文件 | 职责 |
| --- | --- |
| `registration.ts` | order registration adapter 和提交路径。 |
| `authorization.ts` | Product authorization builder。 |
| `service.ts` | draft、invite、participant、submit workflow。 |
| `store.ts` | BFF storage contract。 |
| `sqlite-store.ts`、`postgres-store.ts` | durable draft/workflow store。 |
| `types.ts` | draft、invite、participant、registration 类型。 |
| `src/api/routes/product-bff.ts` | HTTP route。 |

## 工作流

```text
create order draft
  -> invite participants
  -> participants accept with wallet
  -> build SignalAuthorization[]
  -> prepare registration payload
  -> submit through configured adapter
  -> indexer later observes OrderRegistered
```

BFF database 保存 draft 和 workflow 状态。真正让订单存在的是 `UVPStateMachine.OrderRegistered`。真正让任务推进的是后续 `SignalSubmitted`、`HookReady` 等事件。

## 边界

- 不替参与方签名。
- 不绕过 plan attestation 和 supplier trust 检查。
- 不把 draft、invite、registration attempt 写成链上订单。
- 不暴露 `/product/flows`；Product object 是 Zhixu order。
- 不把 Store review 当成 trust attestation。
