# 产品表面

产品表面定义普通用户和产品前端看到的语言：订单、任务、证明、参与方、证据和信任状态。事件重建、索引和 HTTP runtime 属于 [Chain Services](../components/chain-services.md)；产品表面只关心这些 projection 如何被表达成 DTO 并被 Store、Order App、executor-kit 消费。

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

## 本篇子项

| 子页 | 说明 |
| --- | --- |
| [Product DTO](product/dto.md) | `ProductOrderDTO`、`ProductTaskDTO` 如何隐藏 hook 和 ABI 细节。 |
| [Signal Container](product/signal-container.md) | 一个授权业务动作如何被包装成任务、证据、签名、提交和证明。 |
| [Store 与 Order App](product/apps.md) | Store、普通参与者 App、executor-kit 的展示和提交边界。 |

## 产品语言和协议语言

| 协议语言 | 产品表面可以说成 |
| --- | --- |
| `OrderRegistered` | 订单已创建，等待参与方或任务推进。 |
| `SignalSubmitterAuthorized` | 某个参与方被允许提交某类动作。 |
| `HookReady` | 一个任务已经可处理。 |
| `SignalSubmitted` | 参与方已提交凭证指纹或确认动作。 |
| `HookStatusChanged` | 条件等待、就绪、取消或仍未满足。 |

普通用户主要看到订单、任务、参与方、证据和 proof。`sourceId`、`signalId`、`hookId`、gas、ABI 或 Store or external institution 内部结构可以放在高级证明视图中，服务可验证性。

## 产品表面的数据流

产品表面的正确关系是：

```text
Chain Services projection
  -> Product DTO
  -> Store / Order App / executor-kit / periphery adapter
```

如果 Product API 返回的状态无法追溯到 event provenance 或 Store 明确标注的 metadata，就属于产品读模型或 workflow 状态。
