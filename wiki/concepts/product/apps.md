---
title: Store 与 Order App
type: meta
audience: 产品与前端工程师
preread: README.md
status: verified
---

# Store 与 Order App

> 前置阅读：[Product DTO 与用户表面](README.md)
Store、Order App 和 executor-kit 站在不同用户视角上消费同一套链上事实。本页是索引；各表面的详细边界见对应页面。

| 表面 | 一句话定位 | 详见 |
| --- | --- | --- |
| Store | 凝结核与 operator 的中心化治理和编目工具：订单创建、任务审阅、plan publication、supplier identity、metadata、review、audit。 | [秩序商店](../store/README.md) |
| Order App | 普通参与者的任务工具：待办、提交确认、证据指纹、链上证明、readiness。 | [Order App](../apps/order-app.md) |
| executor-kit | 执行者、企业系统、AI/MCP adapter 的集成工具：Product API mode 与 chain watcher mode 两条路径。 | [Executor Kit](../apps/executor-kit.md)、[Order App 与 Executor Kit](../apps/order-app-vs-executor-kit.md) |

三者共同的底线：不拥有订单状态，授权钱包签名才是业务动作。Store 的中心化权威可以影响推荐、审核、打标和治理入口，但不能让 metadata 替代 `PlanRegistered`、审核草稿替代 `SignalSubmitted`、Store 数据库替代 Identity Registry，也不能替参与方生成业务签名。

## Periphery Adapter

资金、担保、AI/MCP、demo executor 可以放在 `uvp-periphery`。它们消费 `UVPStateMachine`、可选的 `UVPIdentityRegistry` 名称解析、Product DTO 或 executor-kit，而不是定义新的核心订单真相。
