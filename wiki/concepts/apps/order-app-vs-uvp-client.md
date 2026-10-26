---
title: Order App 与 UVP Client
type: explanation
audience: 执行者、集成工程师
preread: ../core/executor.md
status: verified
---

# Order App 与 UVP Client

> 前置阅读：[Executor](../core/executor.md)

Order App 和 uvp-client 都是 signal producer 的入口，但用户与运行位置不同：Order App 是浏览器里的人工订单流程；uvp-client 是同一套签名/构造/提交能力的公共库与执行者 CLI。完整说明见 [UVP Client](uvp-client.md)。

## 执行入口

| 入口 | 适合谁 | 事实边界 |
| --- | --- | --- |
| Order App（浏览器） | 普通参与者：开单、邀请、接受、任务、订单房间。 | 通过 `uvp-client/browser` 消费 Product DTO、注入钱包与 typed data，不拥有订单状态。 |
| `uvp-client/browser` | 宿主应用（含 Order App 与 used-car host）。 | 注入 EIP-1193 provider 与 session；不读 env/localStorage/私钥。 |
| `uvp-client/headless` | 企业脚本、supervised agent、未来 MCP、chain executor。 | 私钥只从显式 env 读取；watcher/job store 是执行工具状态。 |
| `uvp-client/cli` | 执行者与运维在终端运行 watch/signal/doctor/wallet。 | 不提供 server；不创建订单授权。 |

Order App 是人的订单界面；uvp-client 是自动化、宿主集成与执行者的公共客户端。两者最终都落回同一套链上授权与事件证明。

## Order App

`uvp-order-app/app` 只保留单一参与者流程：

- 钱包会话与参与者身份。
- 订单草稿 → 邀请 → buyer EIP-712 finalize。
- 邀请接受与订单房间读面。

普通用户界面不暴露 HookPlan、sourceId、signalId、ABI、calldata 或 gas 细节。其 Product transport、wallet 签名与 typed-data 校验来自 `@uvp-eth/uvp-client/browser`。

## UVP Client

`uvp-client/package` 是公共客户端，四个入口分工：

| 入口 | 用途 |
| --- | --- |
| `/core` | transport、chain target、signal build/decode/submit、validation、evidence。 |
| `/browser` | Product V3 客户端、EIP-1193 签名、session/deadline/format、typed-data 校验。 |
| `/headless` | 私钥钱包、watcher、watch 状态、doctor。 |
| `/cli` | 执行者命令 wallet/doctor/watch/signal。 |

链原生执行者走 headless watcher + `chain-signal`；宿主应用走 browser 入口；两者共享 core 的构造与提交实现，不各自复制 transport。

## 共同边界

本节为执行面边界的唯一权威陈述。

两者最终都不能绕过：

- 订单级 signal 授权。
- EIP-712 business signature。
- payload hash。
- first-writer-wins signal 语义。
- chain event proof。
- active executor overlay。

Order App 不拥有订单状态；uvp-client 不拥有订单状态、会话或私钥。
