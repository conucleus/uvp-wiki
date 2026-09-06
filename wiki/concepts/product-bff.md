---
title: Product BFF 与提交入口
type: explanation
audience: 应用开发者
status: verified
---

# Product BFF 与提交入口

Product BFF 指 Product Backend-for-Frontend。它是 UVP 产品写入链路里的独立边界：把用户可理解的 draft、invite、task action 和 evidence 指纹转换成可验证的 order registration、typed data、签名提交和 submission 状态。

它主要覆盖三块代码：

| 代码入口 | 负责什么 |
| --- | --- |
| `uvp-chain-services/service/src/product/bff/` | 订单草稿、邀请、参与方确认、授权构建和订单注册提交工作流。 |
| `uvp-chain-services/service/src/submissions/` | Product task 的 prepare-submit、signature verification、submission tracking 和 relayer handoff。 |
| `uvp-chain-services/service/src/stage-patches/` | stage executor/resource patch 的 typed data、签名校验和提交入口。 |

## Order BFF 职责

Order BFF 处理“把一个可创建订单的 Zhixu 变成一笔待注册订单”的产品过程：

- 创建 order draft。
- 生成并管理参与方 invite。
- 记录参与方 accept/reject。
- 校验 Zhixu 是否有 active Store version。
- 校验 plan 是否 published、是否 revoked。
- 校验 supplier wallet 是否被 revoked。
- 从 `orderPermissionTable` 和参与方列表生成 `SignalAuthorization[]`。
- 准备订单注册 payload 和初始 trigger。
- 跟踪 registration submission 和 retry。

Order BFF 代码入口明细见 [Submissions 与 Stage Patch](services/submissions-stage-patch.md)。

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

## Signal 提交入口

订单注册之后，参与者或 executor 通过 Product task 提交业务 signal：入口不让普通用户处理 sourceId、signalId、ABI 或 gas，而是先准备可读 summary 和 EIP-712 typed data，再让授权钱包签名。代码入口明细见 [Submissions 与 Stage Patch](services/submissions-stage-patch.md)。

## Stage Patch 提交入口

Stage executor patch 和 resource patch 也是 Product 写入入口，但它们和普通 business signal 分开签名、分开校验。代码入口明细见 [Submissions 与 Stage Patch](services/submissions-stage-patch.md)。

## 边界

- 不替参与方签名。
- 不绕过 plan publication 和 supplier identity 检查。
- 不把 draft、invite、registration attempt 当成链上订单。
- 不把 submission row 当成链上 `SignalSubmitted`。
- 不暴露 `/product/flows`；Product object 是 Zhixu order。
- 不把 Store review 当成 trust publication。
