# Indexer 与投影

Indexer 是非可信执行层的重放入口。它从链读取 `UVPDeploymentRegistry`、`UVPStateMachine` 和 `ZhixuTrustRegistry` 事件，把日志归一化成服务内部事件，再投影成 Product、Store、executor-kit 和 ops 能查询的视图。

它只能重放事实，不能创造事实。投影数据库可以让 UI 快速查询订单、任务、proof 和 trust，但擦掉数据库后必须能从配置的 deployment block 重新建立。

## 代码入口

| 文件 | 职责 |
| --- | --- |
| `src/indexer/viem-event-source.ts` | 从 EVM RPC 读取合约日志，保留 chain id、contract address、block、tx、log index。 |
| `src/indexer/events.ts` | 把原始合约日志归一化成 `ChainEvent`，包括 state-machine、trust registry、deployment registry 事件。 |
| `src/indexer/service.ts` | indexer 运行入口，支持普通同步和 `rebuild:indexer` 重建。 |
| `src/indexer/projections.ts` | 从 state-machine 事件重建 order、task、timeline、proof projection。 |
| `src/indexer/trust-projections.ts` | 从 trust registry 事件重建 plan/supplier trust projection。 |
| `src/storage/projection-store.ts` | projection store contract，供 memory/SQLite/PostgreSQL 实现。 |

## 输入事件

Indexer 至少要处理三类来源：

| 来源 | 代表事件 | 投影用途 |
| --- | --- | --- |
| `UVPDeploymentRegistry` | active deployment / cutover 事件。 | 知道当前 state-machine 地址、部署版本和 release context。 |
| `UVPStateMachine` | `OrderRegistered`、`SignalSubmitted`、`HookStatusChanged`、`HookReady`、`TimerPoked`、stage/resource patch events。 | 重建订单、任务、状态、timeline、proof rows。 |
| `ZhixuTrustRegistry` | `PlanAttested`、`PlanRevoked`、`SupplierAttested`、`SupplierRevoked`。 | 重建 plan/supplier trust、revoked history 和 official catalog 过滤。 |

## 输出投影

| 投影 | 消费方 | 注意事项 |
| --- | --- | --- |
| order projection | Product API、Store order search。 | 必须带 `chainId`、`stateMachineAddress`、`deploymentId`。 |
| task projection | Order App、executor-kit、Product `/me/tasks`。 | 来自 hook readiness 和 submitter authorization，不来自后台手工分配。 |
| timeline projection | Product proof、Store runtime proof。 | 每一行都要能回到 tx/block/event。 |
| proof projection | UI proof drawer、审计、release evidence。 | 保存 event proof，不保存证据明文。 |
| trust projection | Store catalog、Product catalog、supplier registry。 | revoked 不能被 fallback 重新包装成 active。 |
| sync status | readiness、diagnostics、reconcile。 | 要暴露 finality/reorg/sync lag，不把同步中状态写成已完成。 |

## Order ID 解析

同一个 `orderId` 可能出现在不同 `UVPStateMachine` deployment 里。因此 projection key 不能只用裸 `orderId`。服务可以在唯一时接受裸 id；如果出现多个 candidate，API 应返回 ambiguous candidates，而不是猜一个。

```text
projection key = chainId + stateMachineAddress + orderId
```

## 与 statemachine replay 的关系

`uvp-protocol/packages/statemachine/` 提供 reference reducer 和 replay tests，用来证明状态机语义没有漂移。Chain Services indexer 用真实链事件建立产品投影。二者都在链上事实之后工作，不能替代合约判断。

## 边界

- 不从数据库状态推断业务完成。
- 不因为某条 Store metadata 存在就生成 order/task。
- 不在 reorg/finality 未确认时把状态写成不可逆。
- 不把 trust projection 和 Store review 混成一个字段。
- 不丢弃 contract context；Product DTO 可以简化语言，但 proof 字段必须能回到链事件。
