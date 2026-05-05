# 状态机

状态机的链上实现是 `UVPStateMachine.sol`。它接收已授权的钱包提交的 signal，按计划里的依赖索引找到受影响的 hook，执行 stack machine 求值，然后发出 `HookStatusChanged`、`HookReady` 或 timer 相关事件。

```text
SignalSubmitted(orderId, sourceId, signalId)
  -> signalKey(orderId, sourceId, signalId)
  -> plan.dependencyIndex[signalKey]
  -> evaluate affected hooks
  -> HookStatusChanged / HookReady
```

## 本篇子项

| 子页 | 说明 |
| --- | --- |
| [Hook 求值](state-machine/evaluation.md) | `SIGNAL`、`NOT`、`AND`、`OR`、`DELAY` 如何在合约里求值。 |
| [计时器与状态](state-machine/timers-and-status.md) | hook 状态、`dueAt`、`pokeTimer()` 和一次性 `HookReady`。 |
| [Stage Overlay：Executor Patch 与 Resource Patch](state-machine/stage-overlay.md) | executor patch、resource patch 如何在订单级覆盖计划。 |
| [Docked Zhixu Runtime](state-machine/docking.md) | local order、linked order、docking link 和 mapped signal 如何落到状态机事件。 |
| [事件 Replay](state-machine/replay.md) | reference reducer 如何用链事件复算状态并校验合约输出。 |

## 合约保存什么

| 数据 | 含义 |
| --- | --- |
| `Plan` | 已注册计划的 `planHash`、hook、依赖索引、selector binding。 |
| `Order` | 某个计划的订单实例、创建者、hook runtime。 |
| `SignalRecord` | 某个订单内某个 `signalKey` 的首次提交记录。 |
| `StoredSignalAuthorization` | 某个订单允许哪个地址提交哪个 source/signal。 |
| `HookRuntime` | hook 当前状态、等待到期时间、是否已经发出 `HookReady`。 |
| stage overlay | 订单级 executor/resource patch，不改计划本身。 |
| docking link | local order 与 linked order 的对接关系、signal binding 和 mapped signal proof。 |

## 状态机边界

状态机只验证 plan/order/signal/hook/patch/authorization 的链上边界。以下内容由 Store、Product API、executor-kit 或 periphery adapter 处理：

- supplier 是否在 Store 中被运营审核；
- supplier capability tags 是否匹配某个行业；
- evidence 明文存储；
- 支付、托管、担保或结算；
- UI 任务文案；
- relayer retry 数据库；
- executor 内部工作流。

这些内容可以通过 signal、metadata hash、resource handle、adapter proof 或 Product DTO 与状态机连接。
