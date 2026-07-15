# Periphery 与部署

`uvp-periphery` 和 `uvp-deploy/deploy` 是核心协议之外的重要组件。它们围绕状态机运行，但不能改变状态机的事实边界。

## Periphery

`uvp-periphery` 放这些内容：

- escrow、payment、guarantee adapter。
- USDC 或稳定币 demo。
- AI/MCP agent adapter。
- 行业 demo 或场景适配器。
- executor demo。

Periphery 可以消费 `UVPStateMachine`、可选的 `UVPIdentityRegistry` 名称解析、Product DTO 或 executor-kit。它不能把资金、担保、付款、释放、退款、争议等状态改造成新的核心事实源。

## 场景适配原则

Periphery 场景可以展示资金、担保、清关、物流、AI/MCP 或企业系统如何
作为 executor、supplier 或 adapter 接入 UVP。行业 demo 不能成为核心协议事实，支付、物流或企业系统状态也不能纳入 core state machine。

## Deploy

`uvp-deploy/deploy` 放本仓库自己的部署脚本、manifest 和 release record。它负责：

- local Anvil bootstrap。
- Product local loop。
- Base Sepolia staging。
- release gates。
- deployment registry record。

部署状态不能写到 sibling `/Users/uyhendu/project/uvp-deploy` 仓库作为 uvp-eth 的事实来源。
