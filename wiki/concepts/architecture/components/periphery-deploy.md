# Periphery 与部署

`uvp-periphery` 和 `uvp-deploy/deploy` 是核心协议之外的重要组件。它们围绕状态机运行，但不能改变状态机的事实边界。

## Periphery

`uvp-periphery` 放这些内容：

- escrow、payment、guarantee adapter。
- USDC 或稳定币 demo。
- AI/MCP agent adapter。
- 行业 demo，例如 Africa MRO docking。
- executor demo。

Periphery 可以消费 `UVPStateMachine`、`ZhixuTrustRegistry`、Product DTO 或 executor-kit。它不能把资金、担保、付款、释放、退款、争议等状态改造成新的核心事实源。

## Africa MRO 示例

Africa MRO demo 展示一个 master order 加多个 docked execution orders：

- master order 负责获客、寻源、付款路径、采购、物流、现场安装、验收。
- supplier-sourcing、payment-settlement、procurement、logistics、field-service 等是 docked Zhixu。
- 每个 stage 的协议和证据要求放在 `fileResources`，链上只保留 hash/URI/signal proof。

它说明 UVP 可以协调复杂产业链，但不把支付或物流系统纳入核心协议。

## Deploy

`uvp-deploy/deploy` 放本仓库自己的部署脚本、manifest 和 release record。它负责：

- local Anvil bootstrap。
- Product local loop。
- Base Sepolia staging。
- release gates。
- deployment registry record。

部署状态不能写到 sibling `/Users/uyhendu/project/uvp-deploy` 仓库作为 uvp-eth 的事实来源。
