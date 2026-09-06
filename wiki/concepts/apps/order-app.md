---
title: Order App
type: explanation
audience: 参与者、前端工程师
preread: order-app-vs-executor-kit.md
status: verified
---

# Order App

> 前置阅读：[Order App 与 Executor Kit](order-app-vs-executor-kit.md)
`uvp-order-app/app` 是普通参与者的订单履约界面。它和 executor-kit 一样是 signal producer，但默认读者是人：参与者打开任务、检查钱包责任、准备证据指纹、确认签名、提交并回看 proof。

它不拥有订单事实。订单、signal、hook 和 proof 来自 `UVPStateMachine` 可重放事件；可选的名称解析来自 `UVPIdentityRegistry`。Order App 消费 Chain Services 暴露的 Product DTO 和 signal container。

```text
Product API /product/me/tasks
  -> task inbox and readiness
  -> evidence fingerprint
  -> prepare-submit typed data
  -> participant wallet signature
  -> submit
  -> proof display
```

## 当前代码边界

以下为撰写时快照，以仓库为准。

| 表面 | 代码入口 | 说明 |
| --- | --- | --- |
| API client | `uvp-order-app/app/src/api/productApi.ts` | 读取 Product DTO、任务、proof，并调用 prepare/submit。 |
| 参与者身份 | `uvp-order-app/app/src/auth/`、`src/wallet/` | 明确 wallet filter 和 browser wallet 交互。 |
| Onboarding | `uvp-order-app/app/src/onboarding/` | invite onboarding 和参与者入口。 |
| 任务房间 | `uvp-order-app/app/src/order-room/`、`src/tasks/` | 展示待办、readiness、blocked reason 和提交动作。 |
| Evidence | `uvp-order-app/app/src/evidence/` | 生成或展示证据指纹，不把业务明文写上链。 |
| Proof | `uvp-order-app/app/src/proof/` | 展示 proof rows、提交状态和链上来源。 |
| Notifications | `uvp-order-app/app/src/notifications/` | 展示协作提醒，不改变链上状态。 |

## 和 Executor Kit 的分工

Order App 面向人工参与者，executor-kit 面向自动化与企业集成；三种入口的对照矩阵见 [Order App 与 Executor Kit](order-app-vs-executor-kit.md)。两者都不能绕过订单级 signal 授权、EIP-712 业务签名、first-writer-wins 等协议不变量；唯一权威清单见同页[共同边界](order-app-vs-executor-kit.md#共同边界)，不变量总纲见[协议边界](../protocol-boundaries.md)。

## 界面语言边界

普通参与者界面只使用任务语言（待办、提交确认、凭证指纹、证明），HookPlan、sourceId、ABI、calldata、gas 只出现在高级或调试视图；完整表述见 [Order App 与 Executor Kit](order-app-vs-executor-kit.md)。

## 相关页面

- [Order App 与 Executor Kit](order-app-vs-executor-kit.md)
- [Product DTO 与用户表面](../product/README.md)
- [Executor Kit](executor-kit.md)
- [Chain Services](../services/chain-services.md)
