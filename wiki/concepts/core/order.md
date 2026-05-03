# Order

Order 是某个 Plan 的一次动态运行实例。它记录这个订单里哪些 signal 被接受、哪些 hook ready 或 cancelled、哪些 executor/resource overlay 被应用，以及这些事实对应的链上 proof。

## Order 注册

订单注册绑定一个已注册 Plan：

```text
registerOrder(orderId, planId, creator, authorizations)
```

注册时合约会：

- 检查 registrar 是否被允许。
- 检查 plan 是否存在且仍被官方域认可。
- 初始化每个 hook 的 runtime。
- 写入订单级 signal 授权。
- 发出 `OrderRegistered` 和 `SignalSubmitterAuthorized`。

## Order 里的动态状态

| 状态 | 来源 |
| --- | --- |
| signal records | `SignalSubmitted`。 |
| hook runtime | `HookStatusChanged`、`HookReady`、`TimerPoked`。 |
| executor overlay | `StageExecutorPatchApplied`、`StageExecutorActivated`。 |
| resource overlay | `StageResourcePatchApplied`。 |
| task projection | chain-services 从 `HookReady` 和授权事件重建。 |
| proof rows | event provenance。 |
| docking relation | Store/Product/adapter 保存父子订单关联，并用链上 signal/proof 校验，不能替代两个订单各自事件。 |

## Order 和 Product Order

链上 Order 是协议状态。`ProductOrderDTO` 是产品视图。Product Order 会把链上字段翻译成阶段、任务、参与方、证明和普通语言，但不能改变 Order 的事实。

Product task ID、Store docking session ID、adapter job ID 都是工作流索引。链上 Order 的身份仍是 `orderId`，链上状态仍来自 `UVPStateMachine` 事件。

## Order 可以分叉和交汇

一个 Order 内部可以有多条 source 因果链。比如 Africa MRO master 里，供应、支付、物流、现场安装和买方验收各自推进，在特定 hook 处交汇。Order 的动态性不在于数据库随便改状态，而在于不同授权 signal 按合约规则不断写入同一条可重放事件流。

如果某个 stage 由另一条 Zhixu 承接，通常会形成父 Order + 子 Order：

```text
parent order
  -> trigger hook ready
  -> child zhixu order executes
  -> child proof checked
  -> authorized mapped signal submitted to parent order
```

父子关系可以由 Store/Product 保存和展示，但跨订单推进必须最终落成父订单上的授权 signal；否则父订单状态机不会因为子订单数据库状态变化而改变。
