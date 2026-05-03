# 计时器与状态

Hook runtime 保存在订单内部。每个订单对计划里的每个 hook 都有自己的状态。

## HookRuntime

```solidity
struct HookRuntime {
    HookStatus status;
    uint64 dueAt;
    bool readyEmitted;
}
```

状态枚举：

| 状态 | 含义 |
| --- | --- |
| `Init` | 尚未满足，也没有进入明确等待。 |
| `Wait` | 有正向锚点，正在等待 timer 或后续条件。 |
| `Ready` | hook 条件满足。 |
| `Cancelled` | hook 被缺席条件或取消路径终止。 |

## 状态变化事件

合约评估 hook 后，如果状态发生变化，会发出：

```text
HookStatusChanged(orderId, hookId, previousStatus, nextStatus, dueAt)
```

如果 hook 变成 `Ready`，并且它是 `trigger=true`，合约还会发出一次：

```text
HookReady(orderId, hookId, stageId, hookName)
```

`readyEmitted` 确保同一个订单里的同一个 hook 不会重复创建任务。

## Timer 不会自动执行

EVM 合约不能自己在未来某个时间自动运行。进入 `Wait` 后，需要外部 keeper、executor 或脚本在到期后调用：

```solidity
pokeTimer(orderId, hookId)
```

合约会检查：

- 订单存在。
- hook 存在。
- 当前状态是 `Wait`。
- 当前区块时间已经达到 `dueAt`。

检查通过后，合约发出 `TimerPoked` 并重新评估 hook。

## 产品层应该怎么展示

Product DTO 可以把 `Wait + dueAt` 显示为“等待到某个时间后自动/可手动继续检查”。但真实推进仍需要链上交易。前端不能只因为本地时间到了就把任务改成 ready，必须等待 `HookReady` 或新的 `HookStatusChanged`。
