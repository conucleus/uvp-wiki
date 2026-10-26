---
title: Store 与 Order App
type: meta
audience: 产品与前端工程师
preread: README.md
status: verified
---

# Store 与 Order App

> 前置阅读：[Product DTO 与用户表面](README.md)
Order App 与 uvp-client 站在不同用户位置消费同一套链上事实；`zhixu-registry` 只登记自述与身份声明。本页是索引；各表面的详细边界见对应页面。

| 表面 | 一句话定位 | 详见 |
| --- | --- | --- |
| zhixu-registry | permissionless 的 ZhixuRecord / IdentityClaim 登记数据层：只存自述、签名与 opaque refs，无 UI、无审核、无推荐。 | [zhixu-registry](../../reference/module-map.md) |
| Order App | 普通参与者的任务工具：待办、提交确认、证据指纹、链上证明、readiness。 | [Order App](../apps/order-app.md) |
| uvp-client | 公共客户端四入口：`browser` 供宿主注入钱包消费 Product DTO；`headless`/`cli` 供脚本与 chain executor 走 watcher/signal。 | [UVP Client](../apps/uvp-client.md)、[Order App 与 UVP Client](../apps/order-app-vs-uvp-client.md) |

共同底线：不拥有订单状态，授权钱包签名才是业务动作。registry 记录不能替代 `PlanRegistered`、`SignalSubmitted` 或 Identity Registry，也不能替参与方生成业务签名。

## Periphery Adapter

资金、担保、AI/MCP、demo executor 可以放在 `uvp-periphery`。它们消费 `UVPStateMachine`、可选的 `UVPIdentityRegistry` 名称解析、Product DTO 或 `@uvp-eth/uvp-client`，而不是定义新的核心订单真相。
