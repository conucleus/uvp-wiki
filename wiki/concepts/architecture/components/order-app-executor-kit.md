# Order App 与 Executor Kit

Order App 和 executor-kit 都是 signal producer 的入口，但用户不同。Executor Kit 的完整集成说明见 [Executor Kit](../../../execution/executor-kit.md)，docked Zhixu 说明见 [Zhixu 作为 Executor](../../../execution/zhixu-as-executor.md)。

## Order App

`uvp-order-app/app` 面向普通参与者。它应该展示：

- 邀请和 onboarding。
- 任务 inbox。
- 当前钱包责任。
- supplier backing。
- evidence 指纹。
- 提交确认。
- proof rows。
- readiness 和 blocked reason。

它不应该把普通用户暴露在 HookPlan、sourceId、signalId、ABI、calldata 或 gas 细节里。

## Executor Kit

`uvp-executor-kit/package` 面向执行者、企业系统、AI/MCP adapter、validator、adjudicator。它有两类模式：

| 模式 | 用途 |
| --- | --- |
| Chain mode | 直接 watch `HookReady`，提交低层 signal，适合高级链原生集成。 |
| Product API mode | 读取 Product API task/signal container，准备证据、签名、提交和证明，适合大多数集成。 |

它的位置不是“普通产品表面”，而是执行者集成面。多数执行者应该走 Product API mode；只有需要直接监听 `HookReady`、自管 handler 和直接合约交易的高级集成才走 chain mode。

## 共同边界

两者最终都不能绕过：

- 订单级 signal 授权。
- EIP-712 business signature。
- payload hash。
- first-writer-wins signal 语义。
- chain event proof。
- active executor overlay。

Order App 是人的任务界面；executor-kit 是自动化和系统集成界面。它们不拥有订单状态。
