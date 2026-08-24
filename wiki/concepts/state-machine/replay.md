---
title: 事件 Replay
type: explanation
audience: 工程贡献者
status: verified
---

# 事件 Replay

`uvp-protocol/packages/statemachine` 提供平台中立的 reference reducer。它用链事件重放订单状态，验证合约事件和本地语义是否一致。

## 输入事件

链事件会被映射成 reducer 能理解的输入：

| 链事件 | reducer 事件 |
| --- | --- |
| `PlanRegistered` | `PlanRegistered` |
| `OrderRegistered` | `OrderRegistered` |
| `SignalSubmitted` | `SignalReceived` |
| `TimerPoked` | `TimerDue` |

`HookStatusChanged` 和 `HookReady` 不作为状态来源直接写入 reducer，而是作为合约输出观察值，用来和 reference reducer 推导结果对比。

## Reducer 状态

Reference runtime 使用的状态包括：

| 状态 | 含义 |
| --- | --- |
| `init` | 初始。 |
| `wait` | 等待依赖或 timer。 |
| `reg` | hook 已就绪。 |
| `dispatched` | 已调度执行。 |
| `fail` | 执行失败。 |
| `cxl` | 已取消。 |

## 为什么需要 Replay

Replay 解决三个问题：

- 合约升级或编译器改动后，确认同一事件序列仍能得到预期状态。
- Indexer 数据库损坏或迁移时，可以从链事件重建投影。
- Product proof 可以把用户看到的订单状态追溯回具体事件。

## First Writer Wins

Reference reducer 也按 signal key 处理 first-writer-wins。重复 signal 不应改变状态。这样它和合约的 `_signals[orderId][signalKey]` 语义保持一致。

## Projection 与 authority

Chain Services projection 从同一事件流重建 signal truth 和 hook truth；indexer 数据库可以随时丢弃后重建。Chain replay oracle 只校验事件语义，ETH runtime authority 是部署的合约——本地模型、reducer 或投影与合约行为不一致时，以合约为准并修正模型。

稳定事件清单见 [合约与事件](../../reference/contracts-and-events.md)。
