---
title: 数据流与事实源
type: explanation
audience: 工程贡献者
status: verified
---

# 数据流与事实源

`uvp-eth` 的关键设计是：链上合约和链事件是事实源，其他层都是可重建视图或操作辅助。

## 主数据流

主数据流沿「编译产物 -> Plan 注册 -> 订单注册与授权 -> 参与方提交 signal -> 合约事件 -> indexer 归一化 -> projection 重建 -> Product DTO」推进，完整流程图见 [架构](architecture.md)。

## 必须来自链上

| 状态 | 来源 |
| --- | --- |
| plan 是否注册 | `PlanRegistered`。 |
| order 是否注册 | `OrderRegistered`。 |
| signal 是否被接受 | `SignalSubmitted`。 |
| hook 是否等待、就绪、取消 | `HookStatusChanged` 和 `HookReady`。 |
| timer 是否被 poke | `TimerPoked`。 |
| Plan 是否可用 | publisher 签名及 `PlanCommitted` / `PlanFinalized`。 |
| 钱包对应哪个现实主体 | `UVPIdentityRegistry` 的 binding/revocation 事件；能力判断仍属 Store。 |
| 部署版本是否 active | `UVPDeploymentRegistry` 的 cutover 事件。 |
| stage executor overlay 是否应用 | Stage Patch Module 的 `StageExecutorPatchApplied` 与 StateMachine 的 `StageExecutorActivated`。 |
| stage resource manifest 是否更新 | `StageResourcePatchApplied`。 |
| linked Zhixu 关系是否存在 | Docking Module 的 `DockedOrderLinked`。 |
| docked signal 是否映射、提交 | `DockedSignalMapped` / `DockedSignalSubmitted`。 |

## 可以缓存但必须可重建

| 数据 | 规则 |
| --- | --- |
| `StateMachineOrderProjection` | 从 state-machine 事件重建。 |
| `StateMachineTaskProjection` | 从 `HookReady`、授权、stage overlay、signal 事件重建。 |
| Product proof rows | 从事件 provenance 生成。 |
| supplier identity projection | 从 Identity Registry 事件重建。 |
| stage patch 与 docking projection | 从 `StageExecutorPatchApplied`、`StageResourcePatchApplied`、`DockedOrderLinked`、`DockedSignalMapped`、`DockedSignalSubmitted` 事件族重建。 |
| Store catalog 状态 | 可以合并 metadata；Plan 发布与身份绑定状态必须来自链事件。 |

## 只能作为操作辅助

Relayer retry 状态、notification delivery 状态、Store draft 都只能帮助操作。它们不能改变 Plan 发布状态、Order 是否存在、Signal 是否被接受或 Hook 是否 ready。governance 台账中 `executionMode: "simulated"` 的条目同样如此：reconcile 会跳过这些条目，staging-readiness 也将其视为未满足。

## Reorg 处理

Indexer 事件里包含 `removed` 标志。`filterActiveChainEvents()` 会过滤被 reorg 移除的 log。事件主键使用：

```text
chainId:contractAddress:blockNumber:transactionHash:logIndex
```

这个 key 也会进入 Product proof，告诉用户“这个视图来自哪条链上的哪条事件”。
