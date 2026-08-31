---
title: 订单 (Order)
type: explanation
audience: 协议读者
preread: ../README.md
status: verified
---

# 订单 (Order)

> 前置阅读：[核心概念](../README.md)
Order 是“订单”。在协议里，它是从某个已注册 [Plan](plan.md) 分叉出来的一条独立事实流。Order 一旦开启并取得 `orderId`，协议只承诺它已经注册并可继续接收符合规则的事实；核心协议不为 Order 定义 `running`、`completed`、`cancelled` 等生命周期状态。

## 谁使用

registrar 用 trigger order 入口创建订单；参与方、executor 和 adapter 向它提交授权 signal；Product/Store/executor-kit 把它投影成任务、通知和 proof 视图。

## 产生什么结果

创建时发出 `OrderRegistered`、`OrderTriggered`、`OrderMaterialized`、`StageMaterialized` 等事件；运行中持续产生 signal record、hook runtime、executor/resource overlay 和 proof row，构成一条可重放的事件流。

## 权威来自哪里

Order 的全部事实来自 `UVPStateMachine` 事件：signal 是否有效、hook 是否 ready、executor overlay 是否生效，都以链上事件为准；Product DTO 只是读模型。

## Order 创建

订单通过 trigger order 入口绑定一个已注册 Plan：

```text
triggerOrderFromOutsideFor(trigger, authorizations, signature)
triggerOrderFromSignalFor(trigger, authorizations, signature)
```

创建时合约会：

- 检查 registrar 交易发送者是否被允许。
- 校验 trigger typed data 签名并恢复业务 submitter。
- 检查 plan 是否存在且仍被官方域认可。
- 写入订单级 signal 授权。
- 记录 trigger fact 或 trigger-origin link。
- materialize ready 的 trigger stage。
- 发出 `OrderRegistered`、`OrderTriggered`、`OrderMaterialized`、`StageMaterialized` 和 `SignalSubmitterAuthorized`。

## Order 里的动态事实

| 事实 | 来源 |
| --- | --- |
| signal records | `SignalSubmitted`。 |
| hook runtime | `HookStatusChanged`、`HookReady`、`TimerPoked`。 |
| executor overlay | `StageExecutorPatchApplied`、`StageExecutorActivated`。 |
| resource overlay | `StageResourcePatchApplied`。 |
| task projection | chain-services 从 `HookReady` 和授权事件重建。 |
| proof rows | event provenance。 |
| docking relation | `DockedOrderLinked`、`DockedSignalMapped`、`DockedSignalSubmitted`，以及两边订单各自的 signal/proof。 |

## Order 和 Product Order

链上 Order 是协议事实容器。`ProductOrderDTO` 是产品视图。它的 Order 状态只表达 `registered`；阶段是否 ready、任务是否待办、某个业务目标是否完成，分别由 hook、task 和 signal 表达，不能上卷成 Order 终态。

Product task ID、Store docking session ID、adapter job ID 都是工作流索引。链上 Order 的身份仍是 `orderId`，具体事实来自 `UVPStateMachine` 事件。

## Order 可以分叉和交汇

一个 Order 内部可以有多条 [source 因果链](source.md)。比如跨境供货里，供应、支付、物流、现场交付和买方验收各自推进，在特定 hook 处交汇。Order 的动态性不来自一个可变的总状态，而来自不同授权 signal 按合约规则写入同一条可重放事件流。

## 不设关闭与纠错入口

Order 不需要被“关闭”才能保持一致性。业务方可以停止继续写入，也可以从同一个 Zhixu 重新创建新的 Order。Signal 采用 first-writer-wins，去重与不可覆盖语义见 [Signal](signal.md)；如果首次写入的业务事实有误，核心协议不覆盖或删除旧事实，而是创建新的 Order 重新执行，并由上层产品把两条事实流的业务关系展示清楚。

如果某个 stage 由另一条 Zhixu 承接，通常会形成 local order 和 linked order 之间的信号绑定：`linkDockedOrder` 记录对接关系与 signal binding，linked proof 校验通过后由 `submitDockedSignal` 或授权 submitter 把 linked signal 映射进本地订单。完整运行时路径见 [Zhixu 作为 Executor](../apps/zhixu-as-executor.md)；Store/Product 只保存 sandbox、contact、review 和展示状态，运行态 proof 以两边订单的链上事件为准。
