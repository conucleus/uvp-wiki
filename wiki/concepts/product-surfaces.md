# 产品表面

产品表面把链上事实翻译成人类能用的订单、任务、证明和信任信息。它把 `UVPStateMachine` 和 `ZhixuTrustRegistry` 的事件投影成 Product API、Store 和 Order App 能消费的 DTO；协议状态仍由链上事件决定。

## 本篇子项

| 子页 | 说明 |
| --- | --- |
| [事件投影](product/projections.md) | indexer 如何从事件重建 order/task/timeline/proof。 |
| [Product DTO](product/dto.md) | `ProductOrderDTO`、`ProductTaskDTO` 如何隐藏 hook 和 ABI 细节。 |
| [Signal Container](product/signal-container.md) | 一个授权业务动作如何被包装成任务、证据、签名、提交和证明。 |
| [Store 与 Order App](product/apps.md) | Store、普通参与者 App、executor-kit 各自应该展示或提交什么。 |

## 产品语言和协议语言

| 协议语言 | 产品表面可以说成 |
| --- | --- |
| `OrderRegistered` | 订单已创建，等待参与方或任务推进。 |
| `SignalSubmitterAuthorized` | 某个参与方被允许提交某类动作。 |
| `HookReady` | 一个任务已经可处理。 |
| `SignalSubmitted` | 参与方已提交凭证指纹或确认动作。 |
| `HookStatusChanged` | 条件等待、就绪、取消或仍未满足。 |

普通用户主要看到订单、任务、参与方、证据和 proof。`sourceId`、`signalId`、`hookId`、gas、ABI 或 trust-domain 内部结构可以放在高级证明视图中，服务可验证性。

## 产品表面的数据流

产品表面的正确关系是：

```text
链上事件
  -> 可重建 projection
  -> Product DTO
  -> Store / Order App / executor-kit
```

如果 Product API 返回的状态无法追溯到 event provenance 或 Store 明确标注的 metadata，就应写成产品读模型或 workflow 状态。
