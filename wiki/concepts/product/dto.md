---
title: Product DTO
type: reference
audience: 产品与前端工程师
preread: README.md
status: verified
---

# Product DTO

Product DTO 是面向普通用户和产品前端的稳定合同。它把协议字段翻译成订单、任务、证明、参与方和信任状态。

## ProductOrderDTO

`productOrderFromStateMachine()` 把 `StateMachineOrderProjection` 映射为 `ProductOrderDTO`。常见内容：

| 字段 | 来源 |
| --- | --- |
| order identity | `orderId`、chain、contract、deployment。 |
| plan proof | `planId`、`planHash`、plan registration event。 |
| status | 从 projection status 映射。 |
| tasks | 从 `StateMachineTaskProjection` 映射。 |
| timeline | 从链事件和 projection effects 生成。 |
| proof | 从 event provenance 生成。 |
| trust | 从 identity projection 合并。 |

资金字段当前故意表达为未接入：

```text
totalAmount.display = "未接入资金托管"
fundingStatus = "资金托管未接入本接口"
```

这表示核心 UVP 协议不是支付提供方。USDC、escrow 或担保应由 periphery adapter 接入。

## ProductTaskDTO

`productTaskFromStateMachineTask()` 会把任务补充成普通用户能操作的结构：

| 字段 | 含义 |
| --- | --- |
| assignee wallet | 当前应处理任务的钱包。 |
| supplier identity | 供应商可信信息和证明。 |
| capability / add-on | 执行能力或扩展动作。 |
| resource requirements | 资源需求、manifest、policy。 |
| canSubmit | 当前用户是否看起来可以提交。 |
| proofSummary | 摘要证明。 |
| proofRows | 具体链事件证明。 |

`canSubmit` 是产品辅助判断，不是最终授权。合约仍会检查显式 Signal 授权或 Plan 限定的 executor 动态委任。

## 状态映射

Order 不承载业务生命周期状态：

| Projection 状态 | 产品状态 | 含义 |
| --- | --- | --- |
| `registered` | `registered` | `orderId` 已注册，之后的进展分别读取 Signal、Hook 和 Task。 |

任务状态可以映射成：

| Projection 状态 | 产品状态 |
| --- | --- |
| `ready` | `open` |
| `submitted` | `submitted` |
| `cancelled` | `blocked` |
| unknown | `blocked` |

DTO 字段与状态映射以 `@uvp-eth/product-dto` 包类型定义为准。
