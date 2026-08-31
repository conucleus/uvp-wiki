---
title: Order App 与 Executor Kit
type: explanation
audience: 执行者、集成工程师
preread: ../core/executor.md
status: verified
---

# Order App 与 Executor Kit

> 前置阅读：[Executor](../core/executor.md)
Order App 和 executor-kit 都是 signal producer 的入口，但用户不同。Executor Kit 的完整说明见 [Executor Kit](executor-kit.md)，docked Zhixu 说明见 [Zhixu 作为 Executor](zhixu-as-executor.md)。

## 三种执行入口

| 入口 | 适合谁 | 事实边界 |
| --- | --- | --- |
| Order App | 普通参与者、人工任务处理。 | 只消费 Product DTO 和 signal container。 |
| Executor Kit Product API mode | 企业系统、supervised agent、脚本、未来 MCP 工具。 | 通过 prepare/sign/submit/proof 边界提交。 |
| Executor Kit chain-native mode | 高级链原生 executor、executor。 | 直接监听 `HookReady` 并提交授权 `submitSignal`。 |

多数真实集成优先走 Product API mode。chain-native mode 保留给需要低层 HookReady 和直接合约交互的执行者。

## Order App

`uvp-order-app/app` 面向普通参与者，展示：

- 邀请和 onboarding。
- 任务 inbox。
- 当前钱包责任。
- supplier backing。
- evidence 指纹。
- 提交确认。
- proof rows。
- readiness 和 blocked reason。

普通用户界面不暴露 HookPlan、sourceId、signalId、ABI、calldata 或 gas 细节。

## Executor Kit

`uvp-executor-kit/package` 面向执行者、企业系统、AI/MCP adapter、executor。它有两类模式：

| 模式 | 用途 |
| --- | --- |
| Chain mode | 直接 watch `HookReady`，提交低层 signal，适合高级链原生集成。 |
| Product API mode | 读取 Product API task/signal container，准备证据、签名、提交和证明，适合大多数集成。 |

它的位置是执行者集成面。多数执行者走 Product API mode；只有需要直接监听 `HookReady`、自管 handler 和直接合约交易的高级集成才走 chain mode。

## 共同边界

本节为执行面边界的唯一权威陈述。

两者最终都不能绕过：

- 订单级 signal 授权。
- EIP-712 business signature。
- payload hash。
- first-writer-wins signal 语义。
- chain event proof。
- active executor overlay。

Order App 是人的任务界面；executor-kit 是自动化和系统集成界面。它们不拥有订单状态。
