---
title: 事件投影
type: reference
audience: 服务工程师
preread: ../services/indexer-projections.md
status: verified
---

# 事件投影

> 前置阅读：[Indexer 与投影](../services/indexer-projections.md)
事件投影把链上事件变成产品可读状态。它是可重建 view；删除 indexer 数据库后，理论上应能从链事件重建同样的 projection。

## ChainEvent

每条 indexed event 都带 provenance：

```text
chainId
contractAddress
blockNumber
transactionHash
logIndex
eventName
args
removed
```

事件 key：

```text
chainId:contractAddress:blockNumber:transactionHash:logIndex
```

这个 key 会进入 Product proof rows，帮助用户确认“这个状态来自哪条链上的哪条事件”。

## Order Projection

`StateMachineOrderProjection` 包括：

| 字段 | 含义 |
| --- | --- |
| `orderId` | 订单 ID。 |
| `chainId` | 链 ID。 |
| `contractAddress` | state-machine 合约地址。 |
| `deploymentId` | 部署标识。 |
| `planId` / `planHash` | 订单绑定的计划。 |
| `status` | Order 注册状态；不从 hook/task 推导生命周期。 |
| `authorizations` | 订单级 signal 授权视图。 |
| `signals` | 已接受 signal。 |
| `hooks` | hook 状态和 dueAt。 |
| `tasks` | 由 `HookReady` 等事件生成的任务。 |
| `timeline` | 用户可读时间线。 |
| `proof` | 可验证事件行。 |

## 事件效果

| 事件 | 投影效果 |
| --- | --- |
| `PlanRegistered` | 创建或更新计划证明，并附着到匹配订单。 |
| `OrderRegistered` | 创建订单投影，初始状态为 registered。 |
| `SignalSubmitterAuthorized` | 保存授权，并把匹配任务标记为可分配。 |
| `SignalSubmitted` | 保存 signal，把匹配任务标记为 submitted。 |
| `StageExecutorPatchApplied` | 保存 executor overlay，并更新目标 stage 任务 assignee。 |
| `StageResourcePatchApplied` | 保存 resource overlay。 |
| `StageExecutorActivated` | 增加 executor activation proof。 |
| `HookStatusChanged` | 更新 hook 状态和 `dueAt`；取消时取消任务。 |
| `HookReady` | 创建或打开任务；Order 仍保持 registered。 |
| `TimerPoked` | 记录 timer proof 和 timeline。 |

任务创建由 `HookReady` 驱动；后端草稿或 UI 状态只做辅助 workflow。

## 相关页面

- [Indexer 与投影](../services/indexer-projections.md)：indexer 如何从链事件建立这些投影。
- [数据流与事实源](../data-flow-and-truth.md)：投影在整体数据流中的位置与事实边界。
