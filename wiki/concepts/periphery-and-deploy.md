---
title: Periphery 与部署
type: explanation
audience: 工程贡献者
status: verified
---

# Periphery 与部署

`uvp-periphery` 和 `uvp-deploy/deploy` 是核心协议之外的重要组件。它们围绕状态机运行，但不能改变状态机的事实边界。

## Periphery

`uvp-periphery` 放这些内容：

- 资金托管、payment、guarantee adapter。
- USDC 或稳定币 demo。
- AI/MCP agent adapter。
- 行业 demo 或场景适配器。
- executor demo。

Periphery 可以消费 `UVPStateMachine`、可选的 `UVPIdentityRegistry` 名称解析、Product DTO 或 uvp-client。它不能把资金、担保、付款、释放、退款、争议赔付等状态改造成新的核心事实源。

## 场景适配原则

Periphery 场景可以展示资金、担保、清关、物流、AI/MCP 或企业系统如何
作为 executor、supplier 或 adapter 接入 UVP。行业 demo 不能成为核心协议事实，支付、物流或企业系统状态也不能纳入 core state machine。

## Deploy

`uvp-deploy/` 是本仓库的部署域，按车道拆分：`deploy/`（release）放部署/广播脚本、manifest、兼容矩阵和 release record；`qa/` 放 local Anvil bootstrap、Product local loop 与 chaos；`ops/` 放运维台与 runbook。release 车道负责：

- Base Sepolia staging。
- release gates。
- deployment registry record。

部署状态不能写到仓库外的 sibling 部署仓作为 uvp-eth 的事实来源。

## 相关页面

- [协议边界（外围适配）](protocol-boundaries.md)
- [部署与证据](../meta/deploy-release.md)
- [模块地图](../reference/module-map.md)
- [Contracts 与 Registries](contracts-and-registries.md)
