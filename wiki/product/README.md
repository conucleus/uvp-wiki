# 产品与执行面

产品与执行面把链上事实翻译成 ordinary Product UI、participant task、Product DTO/API 和 signal container。Product API 由 [非可信执行层：Chain Services](../components/chain-services.md) 提供；本页只讲 Product 语言和用户/执行者消费方式。Store 和执行者集成都已经是单独一级目录；本页只在需要说明 DTO/API 消费方时链接它们。

```text
chain events
  -> non-trusted execution layer / chain-services replayed projection
  -> Product DTO / Product API
  -> Order App / Store / executor-kit / periphery adapter
```

## 产品表面

| 页面 | 作用 |
| --- | --- |
| [产品表面](../concepts/product-surfaces.md) | Product 层如何把链事件翻译成订单、任务和 proof。 |
| [事件投影](../concepts/product/projections.md) | 如何从 chain events 重建订单、任务、时间线和 proof。 |
| [Product DTO](../concepts/product/dto.md) | 面向普通用户的 order/task/proof/trust DTO。 |
| [Signal Container](../concepts/product/signal-container.md) | task、evidence、typed data、签名、submit、proof 的产品包装。 |
| [Store 与 Order App](../concepts/product/apps.md) | Store、Order App、executor-kit 和 periphery adapter 如何消费同一套 Product projection。 |
| [Product API 参考](../reference/product-api.md) | 当前 Product API 路由和语义。 |
| [非可信执行层：Chain Services](../components/chain-services.md) | Product API 的 indexer、relayer、proof verifier 和 runtime profile 归属。 |

## 跳转到执行与 Store

| 页面 | 集成语境 |
| --- | --- |
| [秩序商店](../store/README.md) | Store 作为凝结核工作台和一级 trust/workflow 系统，组织 Zhixu/Supplier、proof 和平台 workflow。 |
| [执行者与集成](../execution/README.md) | Executor Kit、AI/MCP adapter、enterprise script、docked Zhixu 和 periphery adapter。 |
| [Executor](../concepts/core/executor.md) | 订单运行时执行者和 signal submitter 的核心对象边界。 |

## 当前注意事项

- Store metadata、draft、supplier profile、audit 和 JWT session 属于 [秩序商店](../store/README.md) 语境，是凝结核工作台或平台 workflow 状态。
- Product API 可以准备 typed data、验证签名、调用 relayer、返回 proof；`UVPStateMachine` 授权仍由合约检查。
- `uvp-order-app` 已是独立 participant app 边界，但尚未被同一条 Base Sepolia Product API 真实任务流完整证明。
- executor-kit 的 Product API signal producer 和 thin MCP adapter 属于 [执行者与集成](../execution/README.md)，生产运行、密钥治理和 live operator runbook 写在执行/运维口径。
