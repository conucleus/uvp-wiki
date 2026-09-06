---
title: Indexer 与投影
type: reference
audience: 工程贡献者
status: verified
---

# Indexer 与投影

Indexer 是可重建服务层的重放入口。它从链读取 `UVPDeploymentRegistry`、`UVPStateMachine` 和 `UVPIdentityRegistry` 事件，把日志归一化成服务内部事件，再投影成 Product、Store、executor-kit 和 ops 能查询的视图。

它负责重放事实、建立读模型。投影数据库可以让 UI 快速查询订单、任务、proof 和 trust；擦掉数据库后必须能从配置的 deployment block 重新建立。

## 代码入口

| 文件 | 职责 |
| --- | --- |
| `src/indexer/viem-event-source.ts` | 从 EVM RPC 读取合约日志，保留 chain id、contract address、block、tx、log index。 |
| `src/indexer/events.ts` | 把原始合约日志归一化成 `ChainEvent`，包括 state-machine、Identity Registry、deployment registry 事件。 |
| `src/indexer/service.ts` | indexer 运行入口，支持普通同步和 `rebuild:indexer` 重建。 |
| `src/indexer/projections.ts` | 从 state-machine 事件重建 order、task、timeline、proof projection。 |
| `src/indexer/identity-projections.ts` | 从 Identity Registry 事件重建 subject/account identity projection。 |
| `src/storage/projection-store.ts` | projection store contract，供 memory/SQLite/PostgreSQL 实现。 |

## 输入事件

Indexer 至少要处理三类来源：

| 来源 | 代表事件 | 投影用途 |
| --- | --- | --- |
| `UVPDeploymentRegistry` | active deployment / cutover 事件。 | 知道当前 state-machine 地址、部署版本和 release context。 |
| `UVPStateMachine` | `OrderRegistered`、`SignalSubmitted`、`HookStatusChanged`、`HookReady`、`TimerPoked`、stage/resource patch events。 | 重建订单、任务、状态、timeline、proof rows。 |
| `UVPIdentityRegistry` | `IdentityBindingRegistered`、`IdentityBindingRevoked`。 | 重建 subject/account 身份目录及撤销历史；不做 Plan 或能力过滤。 |

## 输出投影

| 投影 | 消费方 | 注意事项 |
| --- | --- | --- |
| order projection | Product API、Store order search。 | 必须带 `chainId`、`stateMachineAddress`、`deploymentId`。 |
| task projection | Order App、executor-kit、Product `/me/tasks`。 | 来自 hook readiness 和 submitter authorization，不来自后台手工分配。 |
| timeline projection | Product proof、Store runtime proof。 | 每一行都要能回到 tx/block/event。 |
| proof projection | UI proof drawer、审计、release evidence。 | 保存 event proof，不保存证据明文。 |
| identity projection | Store catalog、Product catalog、supplier directory。 | revoked 保持 revoked/blocked 展示。 |
| sync status | readiness、diagnostics、reconcile。 | 暴露 finality/reorg/sync lag，同步中状态保持 pending。 |

DTO 字段定义见 [Product DTO](../product/dto.md)。

## Order ID 解析

同一个 `orderId` 可能出现在不同 `UVPStateMachine` deployment 里。因此 projection key 需要包含 contract context。服务可以在唯一时接受裸 id；如果出现多个 candidate，API 应返回 ambiguous candidates。

规范性来源：projection key 的组成以 `uvp-chain-services/service/src/indexer` 实现为准。

```text
projection key = chainId + stateMachineAddress + orderId
```

## 与 statemachine replay 的关系

`uvp-protocol/packages/statemachine/` 提供 reference reducer 和 replay tests（详见[事件 Replay](../state-machine/replay.md)），用来证明状态机语义没有漂移。Chain Services indexer 用真实链事件建立产品投影。二者都在链上事实之后工作，合约仍是运行时判断来源。

## 边界

- 业务完成来自 signal/proof，不从数据库状态推断。
- order/task 来自 state-machine event，不从 Store metadata 生成。
- reorg/finality 未确认时状态保持 pending 或 syncing。
- identity projection 和 Store review 使用不同字段。
- 保留 contract context；Product DTO 可以简化语言，但 proof 字段必须能回到链事件。
