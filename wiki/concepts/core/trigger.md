# Trigger

Trigger 把一个 ready condition 变成可执行任务。它是一种特殊 hook 标记：某个 receive hook Ready 后，这个 stage 的执行入口正式打开，链上应发出 `HookReady`，Product/Store/executor-kit 才能把它投影成任务、通知或 adapter job。

Trigger 是 Hook 的一个编译标记，来自秩序 stage 的 `trigger` 数组：

```yaml
trigger:
  - START
receiveSignals:
  START: buyer::order.confirm.cmp
```

编译后，`START` 这个 receive hook 会带上 `trigger=true`。如果它第一次变成 Ready，`UVPStateMachine` 会发出：

```text
HookReady(orderId, hookId, stageId, hookName)
```

## 为什么必须指定 Trigger

一个 stage 可能有多个 hook：有的用于等待输入，有的用于 signalMap，有的用于失败路径或内部条件。Trigger 的作用是把“条件成立”提升为“这个执行环节正式开始”。

产品上可以把 Trigger 理解为：

- Product task 可以创建或变成 ready。
- Store 可以产生联系或通知 intent。
- executor-kit chain watcher 可以领取或路由 job。
- adapter 可以分配外部执行编号、工单号或linked Zhixu启动请求。

编号边界：链上 `orderId` 由 `registerOrder()` 绑定。Trigger 可以触发 Product task ID、Store docking session ID、外部工单号或 linked order 创建流程；这些都是工作流编号，local order 的身份和推进 proof 仍看链上 `orderId` 和 signal/docking events。

## 编译和合约语义

当前 compiler 要求 `stage.trigger` 里的每个名字必须引用本 stage 已存在的 `receiveSignals` key。也就是说，Trigger 必须绑定在一个 receive hook 上。

```text
stage.receiveSignals.START
  -> compiled hook trigger=true
  -> StoredHook.trigger=true
  -> HookStatus Ready
  -> HookReady emitted once
```

合约有 `readyEmitted` 标记，同一个 hook 的 `HookReady` 只会发出一次。`trigger=false` 的 hook 仍然可以变成 Ready，但不会发出 `HookReady`，也不应直接创建 Product task。

## 和 docked Zhixu 的关系

当 local order 某个 stage 由另一个秩序执行时，local stage 的 Trigger 表示“现在可以把这个 stage 交给 peer 秩序或 adapter 执行”。后续 linked 秩序的 `str`、`cmp`、`err` 通过 `signalMap` 和授权 submitter 或 docking events 映射回 local order。

如果 Product、registrar 或 operator workflow 从订单外部打开这个对接阶段，建议给这个 link stage 一个显式入口：

```yaml
trigger:
  - LINK_READY
receiveSignals:
  LINK_READY: ::OUTSIDE
executor:
  supplierType: zhixu
  supplierID: "{{ .peer_zhixu_uid }}"
  zhixuExecutorConfig:
    signalMap:
      str: peer::task.start.str
      cmp: peer::task.close.cmp
      err: peer::task.close.err
```

这里的 `::OUTSIDE` 是空 source 上的外部入口 signal，用来打开本地 stage 的 docking workflow。它仍然需要订单级授权；常见提交方是 registrar 或被 Product workflow 授权的系统账户。`signalMap` 负责解释 linked order 输出，不会自己发出 `HookReady`。

```text
local stage trigger Ready
  -> Store/Product 启动 docking workflow
  -> linked order 执行
  -> linked order proof 被校验
  -> submitDockedSignal 或授权 submitter 向 local order 提交映射 signal
```

每一次跨秩序推进都要回到链上 signal、proof 和可重放事件。

## 边界检查

- Trigger 是编译到 HookPlan 和合约里的 hook 标记，不是 UI 手动按钮。
- 链上 orderId 来自 `registerOrder()`。
- Trigger Ready 通常表示执行开始或任务可领取，业务完成看后续 signal/proof。
- `signalMap` hook 当前不触发 `HookReady`；它用于 docked Zhixu 输出映射。
