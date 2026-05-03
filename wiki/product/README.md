# 产品语言与 DTO/API

产品语言与 DTO/API 把链上事实翻译成 ordinary Product UI、participant task、Product DTO/API 和 signal container。Product API 由 [非可信执行层：Chain Services](../components/chain-services.md) 提供；本目录定义 Product 层如何说“订单、任务、证据、proof、信任状态”，以及这些 DTO 如何被 Store、Order App、executor-kit 和 adapter 消费。

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

## 和执行、Store 的分工

| 目录 | 负责什么 |
| --- | --- |
| 本目录 | DTO、API 路由、task/proof/trust 的产品语言、Signal Container 数据合约。 |
| [执行者与集成](../execution/README.md) | Executor Kit、Order App、enterprise script、AI/MCP adapter、docked Zhixu 和 periphery adapter 如何签名、提交 signal、读取 proof。 |
| [秩序商店](../store/README.md) | 凝结核工作台、Zhixu/Supplier 管理、trust 校验、平台 workflow 和 operator audit。 |

## 当前注意事项

- Store metadata、draft、supplier profile、audit 和 JWT session 属于 [秩序商店](../store/README.md) 语境，是凝结核工作台或平台 workflow 状态。
- Product API 可以准备 typed data、验证签名、调用 relayer、返回 proof；`UVPStateMachine` 授权仍由合约检查。
- `uvp-order-app` 已是独立 participant app 边界，但尚未被同一条 Base Sepolia Product API 真实任务流完整证明。
- executor-kit 的 Product API signal producer 和 thin MCP adapter 属于 [执行者与集成](../execution/README.md)，生产运行、密钥治理和 live operator runbook 写在执行/运维口径。
