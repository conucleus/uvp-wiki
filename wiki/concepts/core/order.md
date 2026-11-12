---
title: 订单 (Order)
type: explanation
audience: 协议读者
preread: ../README.md
status: verified
---

# 订单 (Order)

> 前置阅读：[核心概念](../README.md)
Order 是“订单”。在协议里，它是从某个已注册 [Plan](plan.md) 分出的一条独立事实流。Order 一旦开启并取得 `orderId`，协议只承诺它已经注册并可继续接收符合规则的事实；核心协议不为 Order 定义 `running`、`completed`、`cancelled` 等生命周期状态。

## 谁使用

授权参与者经各出生通道创建订单（DSL 声明面是 `sendSignals[].trigger: true`；链轨运行期通道见下）；参与方、executor 和 adapter 向它提交授权 signal；Product/Store/uvp-client 把它投影成任务、通知和 proof 视图。

## 产生什么结果

创建时发出 `OrderRegistered`、`OrderTriggered`、`OrderMaterialized`、`StageMaterialized` 等事件；运行中持续产生 signal record、hook runtime、executor patch、阶段文件 patch、dock binding 和 proof row，构成一条可重放的事件流。治理分叉另发 `OrderForked`。

## 权威来自哪里

Order 的全部事实来自 `UVPStateMachine` 事件：signal 是否有效、hook 是否 ready、执行者选择与文件映射是否生效，都以链上事件为准；Product DTO 只是读模型。

## Order 创建

订单创建在 DSL 声明面只有一条通道：`sendSignals` 条目标记 `trigger: true` 的出生信号，以空订单号提交即出生。链轨运行期入口由此派生为三条通道：

1. outside-trigger 开放提交：计划承诺的 `birthAuthorizer` 以 EIP-712 签名调用 `triggerOrderFromOutsideFor`；`birthAuthorizer` 为合约时由它直接调用无签名入口 `triggerOrderFromOutsideByAuthorizer`。每条出生信号一条 birth hook，提交方用 `triggerHookId` + `triggerStageId` 显式选择出生线。
2. order-link 派生建单：`UVPOrderLinkModule` 上的 `triggerOrderFromSignalFor`（状态机内部只有模块可调的 `triggerOrderFromSignalFromModule`）。
3. 治理分叉 `forkOrder`：从父单历史逐条核验后重放出带血缘的新单，单号由父单信息与 fork 载荷纯函数派生，同载荷幂等。

订单号一律由合约从出生事实纯函数派生、调用方不可自报。Dock 在既有订单上以 binding 承载发射，不创建订单。

创建时合约会：

- 校验 deadline、submitter 与 plan 状态（只有 finalized Plan 可以出生）。
- 校验所选出生 hook 带 `ORDER_TRIGGER_MINT` 标记且属于该 stage。
- 在空订单上下文中求值出生信号的 `validWhen`；不通过 revert `SignalAdmissionRejected`，订单不存在、零事实行。
- 校验提交者授权与（词表计划下的）事实归属证明。
- 派生 `orderId`、写入订单级 signal 授权、记录出生事实、materialize ready 的出生阶段。
- 发出 `OrderRegistered`、`OrderTriggered`、`OrderMaterialized`、`StageMaterialized` 和 `SignalSubmitterAuthorized`。

## Order 里的动态事实

| 事实 | 来源 |
| --- | --- |
| signal records | `SignalSubmitted`。 |
| hook runtime | `HookStatusChanged`、`HookReady`、`TimerPoked`。 |
| executor patch | `StageExecutorPatchApplied`、`StageExecutorActivated`。 |
| 阶段文件 patch | `StageFilePatchApplied`、`StageFileOpApplied`。 |
| dock 执行者选择与 binding | `StageDockExecutorSelected`、`DockBindingPoked`、`DockOutputSubmitted`。 |
| task projection | chain-services 从 `HookReady` 和授权事件重建。 |
| proof rows | event provenance。 |

## Order 和 Product Order

链上 Order 是协议事实容器。`ProductOrderDTO` 是产品视图。它的 Order 状态只表达 `registered`；阶段是否 ready、任务是否待办、某个业务目标是否完成，分别由 hook、task 和 signal 表达，不能上卷成 Order 终态。

Product task ID、Store 的 Dock 试配记录 ID、adapter job ID 都是工作流索引。链上 Order 的身份是复合键 `(planId, orderId)`；具体事实来自 `UVPStateMachine` 事件。

## Order 可以分叉和交汇

一个 Order 内部可以有多条 [source 因果链](source.md)。比如跨境供货里，供应、支付、物流、现场交付和买方验收各自推进，在特定 hook 处交汇。Order 的动态性不来自一个可变的总状态，而来自不同授权 signal 按合约规则写入同一条可重放事件流。

## 不设关闭与纠错入口

Order 不需要被“关闭”才能保持一致性。业务方可以停止继续写入，也可以从同一个 Zhixu 重新创建新的 Order。Signal 采用 first-writer-wins，去重与不可覆盖语义见 [Signal](signal.md)；如果首次写入的业务事实有误，核心协议不覆盖或删除旧事实，而是创建新的 Order 重新执行，并由上层产品把两条事实流的业务关系展示清楚。非协作换人走治理分叉：父单留档、新单承继（见 `uvp-chain.md`）。

如果某个 stage 由另一条 Zhixu 承接，会形成 B 订单上的 dock binding：目标阶段以 `supplierType: dock` 声明，订单在挂接 stage 一次性选定 dock 执行者，并把 A 订单号写入 `dock_link` 文件项即建立 binding；`pokeDockBinding` 在 A/B 时间窗交集时把 B 侧输出信号发射为本订单事实，逐 output first-win。binding 只作用于既有 B 订单——B 订单由 B 秩序自己的出生通道创建（见 [阶段文件 Patch](../state-machine/file-patch.md) 与 [Zhixu 作为 Executor](../apps/zhixu-as-executor.md)）。Store/Product 只保存试配、contact、review 和展示状态，运行态 proof 以订单的链上事件为准。
