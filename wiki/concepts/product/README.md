---
title: Product DTO 与用户表面
type: meta
audience: 产品与前端工程师、协议读者
preread: ../protocol-boundaries.md
status: verified
---

# Product DTO 与用户表面

> 前置阅读：[协议边界（不变量总纲）](../protocol-boundaries.md)
Product DTO 与用户表面定义普通用户和产品前端看到的对象语言：订单、任务、证据、证明、参与方、信任状态和 signal container。它不承载事件重建、索引或 HTTP runtime；这些运行时能力属于 [Chain Services](../services/chain-services.md)。产品表面只关心链上 projection 如何被表达成 DTO，并被 Store、Order App、executor-kit 消费。

```text
chain events
  -> rebuildable Chain Services projection
  -> Product DTO
  -> Order App / Store / executor-kit / periphery adapter
```

最重要的翻译是从 DSL stage 到 Product task：

```text
stage.receiveSignals
  -> compiled Hook
  -> trigger=true
  -> HookReady
  -> ProductTaskDTO
  -> 用户或 executor 提交 Signal
  -> Product proof row
```

## 可运行界面

Product DTO 最终落在真实可跑的产品表面上：Order App 面向普通参与者处理待办，Store Console 面向凝结核和 operator 组织秩序、供应商、试拼和审查。

![Order App 待办界面](../../assets/screenshots/order-app.png)

*Order App：普通参与者看到的待办、订单、证明和提交入口。*

![Store Console 秩序目录界面](../../assets/screenshots/store-console.png)

*Store Console：凝结核和 operator 看到的秩序目录、试拼、供应商和审查入口。*

## 协议语言与产品语言

| 协议语言 | 产品表面可以说成 |
| --- | --- |
| `OrderRegistered` | 订单已创建，等待参与方或任务推进。 |
| `SignalSubmitterAuthorized` | 某个参与方被允许提交某类动作。 |
| `HookReady` | 一个任务已经可处理。 |
| `SignalSubmitted` | 参与方已提交凭证指纹或确认动作。 |
| `HookStatusChanged` | 条件等待、就绪、取消或仍未满足。 |

普通用户主要看到订单、任务、参与方、证据和 proof。`sourceId`、`signalId`、`hookId`、gas、ABI 等协议字段可以放在高级证明视图中，服务可验证性。

## 用户表面

| 页面 | 作用 |
| --- | --- |
| [Product DTO](dto.md) | 面向普通用户的 order/task/proof/trust DTO，隐藏 hook 和 ABI 细节。 |
| [Signal Container](signal-container.md) | task、evidence、typed data、签名、submit、proof 的产品包装。 |
| [Store 与 Order App](apps.md) | Store、Order App、executor-kit 和 periphery adapter 如何消费同一套 Product projection。 |
| [Product API 端点速查](../../reference/product-api-endpoints.md) | 当前 Product API 路由和语义。 |

## 边界

| 层 | 负责什么 |
| --- | --- |
| [Chain Services](../services/chain-services.md) | 从链事件重建 projection，提供 Product API、Store API、relayer、proof verifier 和 runtime profile。 |
| Product DTO 与用户表面 | 约定普通用户和产品前端如何表达 order/task/proof/identity，以及 signal container 的数据合同。 |
| [Order App](../apps/order-app.md) / [Executor Kit](../apps/executor-kit.md) | 消费 Product DTO，准备证据、签名、提交和读取 proof。 |
| [Zhixu Store](../store/README.md) | 消费 Product/Store DTO，组织凝结核工作台、supplier、identity、operator workflow 和 audit。 |

- Store metadata、draft、supplier profile、audit 和 JWT session 属于 [秩序商店](../store/README.md) 语境，是凝结核工作台或平台 workflow 状态。
- Product API 可以准备 typed data、验证签名、调用 relayer、返回 proof；授权检查始终由合约执行。协议不变量的唯一总纲见[协议边界](../protocol-boundaries.md)。
- 如果 Product API 返回的状态无法追溯到 event provenance 或 Store 明确标注的 metadata，就属于产品读模型或 workflow 状态。
- executor-kit 的 Product API signal producer 和 thin MCP adapter 属于 [Executor Kit](../apps/executor-kit.md)；生产运行、密钥治理和 live operator runbook 由执行与运维页面承载。
