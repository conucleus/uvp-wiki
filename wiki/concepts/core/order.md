# 订单 (Order)

Order 是“订单”。在协议里，它是某个 Plan 的一次动态运行实例。它记录这个订单里哪些 signal 被接受、哪些 hook ready 或 cancelled、哪些 executor/resource overlay 被应用，以及这些事实对应的链上 proof。

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
| docking relation | `DockedOrderLinked`、`DockedSignalMapped`、`DockedSignalSubmitted`，以及两边订单各自的 signal/proof。 |

## Order 和 Product Order

链上 Order 是协议状态。`ProductOrderDTO` 是产品视图。Product Order 会把链上字段翻译成阶段、任务、参与方、证明和普通语言。事实仍来自 `UVPStateMachine` 事件。

Product task ID、Store docking session ID、adapter job ID 都是工作流索引。链上 Order 的身份仍是 `orderId`，链上状态仍来自 `UVPStateMachine` 事件。

## Order 可以分叉和交汇

一个 Order 内部可以有多条 source 因果链。比如跨境供货里，供应、支付、物流、现场交付和买方验收各自推进，在特定 hook 处交汇。Order 的动态性不在于数据库随便改状态，而在于不同授权 signal 按合约规则不断写入同一条可重放事件流。

如果某个 stage 由另一条 Zhixu 承接，通常会形成 local order 和 linked order
之间的信号绑定：

```text
local order
  -> trigger hook ready
  -> linked Zhixu order executes
  -> linked proof checked
  -> authorized mapped signal submitted to local order
```

当前合约已经把运行时 docking 作为公共事件面暴露：`linkDockedOrder` 记录 local/linked order 关系和 signal binding，`submitDockedSignal` 把 linked order 中已经存在的 signal 映射成本地订单的 signal。Store/Product 可以保存 sandbox、contact、operator review 和展示状态；运行态 proof 以两边订单的链上事件为准。
