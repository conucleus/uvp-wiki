# Product DTO 与用户表面

Product DTO 与用户表面定义普通用户看到的对象语言：订单、任务、证据、证明、参与方、信任状态和 signal container。它不承载 indexer、relayer、storage 或 HTTP runtime；这些运行时能力属于 [Chain Services](../components/chain-services.md)。

```text
chain events
  -> rebuildable Chain Services projection
  -> Product DTO
  -> Order App / Store / executor-kit
```

## 可运行界面

Product DTO 最终落在真实可跑的产品表面上：Order App 面向普通参与者处理待办，Store Console 面向凝结核和 operator 组织秩序、供应商、试拼和审查。

![Order App 待办界面](../assets/screenshots/order-app.png)

*Order App：普通参与者看到的待办、订单、证明和提交入口。*

![Store Console 秩序目录界面](../assets/screenshots/store-console.png)

*Store Console：凝结核和 operator 看到的秩序目录、试拼、供应商和审查入口。*

## 用户表面

| 页面 | 作用 |
| --- | --- |
| [产品表面](../concepts/product-surfaces.md) | Product 层如何把链事件翻译成订单、任务和 proof。 |
| [Product DTO](../concepts/product/dto.md) | 面向普通用户的 order/task/proof/trust DTO。 |
| [Signal Container](../concepts/product/signal-container.md) | task、evidence、typed data、签名、submit、proof 的产品包装。 |
| [Store 与 Order App](../concepts/product/apps.md) | Store、Order App、executor-kit 和 periphery adapter 如何消费同一套 Product projection。 |
| [Product API 参考](../reference/product-api.md) | 当前 Product API 路由和语义。 |

## 与 Chain Services 的边界

| 层 | 负责什么 |
| --- | --- |
| [Chain Services](../components/chain-services.md) | 从链事件重建 projection，提供 Product API、Store API、relayer、proof verifier 和 runtime profile。 |
| Product DTO 与用户表面 | 约定普通用户和产品前端如何表达 order/task/proof/identity，以及 signal container 的数据合同。 |
| [Order App](../execution/order-app.md) / [Executor Kit](../execution/README.md) | 消费 Product DTO，准备证据、签名、提交和读取 proof。 |
| [Zhixu Store](../store/README.md) | 消费 Product/Store DTO，组织凝结核工作台、supplier、identity、operator workflow 和 audit。 |

## 边界

- Store metadata、draft、supplier profile、audit 和 JWT session 属于 [秩序商店](../store/README.md) 语境，是凝结核工作台或平台 workflow 状态。
- Product API 可以准备 typed data、验证签名、调用 relayer、返回 proof；`UVPStateMachine` 授权仍由合约检查。
- `uvp-order-app` 已是独立 participant app 边界，但尚未被同一条 Base Sepolia Product API 真实任务流完整证明。
- executor-kit 的 Product API signal producer 和 thin MCP adapter 属于 [Executor Kit](../execution/README.md)；生产运行、密钥治理和 live operator runbook 由执行与运维页面承载。
