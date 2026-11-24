---
title: 出生信号与订单入口
type: explanation
audience: 协议读者
preread: ../README.md
status: verified
---

# 出生信号与订单入口

> 前置阅读：[核心概念](../README.md)

本页回答两件事：订单从哪里来、阶段如何被物化。出生由 `sendSignals` 条目上的 `trigger: true` 表达：编译器为每条出生信号合成一条 order-trigger hook；`receiveSignals` 的每一项仍是同单 Hook。

## 出生声明

```yaml
- name: intake
  source: customer
  sendSignals:
    - name: requested
      trigger: true
    - name: str
    - name: cmp
    - name: err
  executor: { supplierType: organization, supplierID: 7c1d3f52-9a4b-4e68-8f20-3b5d7a9c1e40 }
```

- 出生信号条目属于本阶段 `sendSignals`、同阶段内唯一，编译期固定并进入 plan 承诺面。
- 一个阶段可声明多条出生信号，一个 plan 可有多个出生阶段；出生阶段不必是首个 stage。
- 出生阶段的执行者是静态 plain（`individual`/`organization` 且 `supplierID` 非空）；出生权不随 dock 绑定或运行时 patch 漂移。
- 编译器产物以 `triggers[]` 枚举出生入口；`orderTriggerKind` 闭集为 `none | trigger`，`emitReady` 标记 hook 首次 Ready 是否发出 `HookReady`。

## 提交与出生判定

- 链轨只有一条入口：`UVPStateMachine.submitSignal(submission, signature)`，`orderId == bytes32(0)` 且 `(sourceId, signalId)` 命中带 `ORDER_TRIGGER_MINT` 的 trigger hook 时出生。
- 提交者必须是该出生阶段当前生效的 assigned supplier account（SID 必须 `active`）。
- 先按空订单上下文求值 `validWhen`（无 facts/files；否定条件为真、存在与延时成熟条件为假），不通过即 `SignalAdmissionRejected`；通过后校验 `(submitter, idempotencyKey)` 未被使用，再由 `_newOrderId` 运行期生成订单号、登记/创建订单，并把该信号写为首条事实。
- 空 `orderId` + 非出生信号 → 具名拒绝（`NotTriggerSignal` 一类入口错误）。
- 带 `orderId` 的出生信号按普通订单内信号处理，出生身份只用于空 `orderId` 提交。
- 同一出生事实重试幂等：同一 `(submitter, idempotencyKey)` 重试会 revert `DuplicateTriggerKey` 并携带 `existingOrderId`；载荷不参与订单号派生。
- 出生事实自身即该订单首条事实，first-win 落定。

## 唯一出生入口

| 入口 | 摘要 |
| --- | --- |
| `submitSignal(orderId=0)` | 出生阶段 assigned supplier account 签名提交出生信号；签名可直连（`msg.sender == submitter`）或由 relayer 转发。合约按 `(planId, sourceId, signalId)` 解析 trigger hook，校验 birth admission 与 `usedTriggerKeys`。 |

Dock 在既有订单上建立 binding 并发射 B 输出信号，订单始终由上述出生入口创建。

## 物化门

链上阶段只能由本阶段 order-trigger hook 或 EMIT_READY hook 物化，每个阶段至少具备一个物化路径：

- 出生阶段：每条出生信号合成一条 order-trigger hook，即使没有 `receiveSignals` 也能物化。
- 其余阶段：带静态执行者（plain 或 dock）的 receive hook 编译为 EMIT_READY；无 `executor` 块的 dynamic 阶段由自身 receive hook 的 EMIT_READY 物化，并带 `HOOK_FLAG_DYNAMIC_EXECUTOR`（flags 位 32），运行期由 selector 在首信号前指派 supplierId。
- 既无出生信号又无 `receiveSignals` 的阶段编译为零 hook、永不可物化，`uvp-core analyze` 在编译期整体拒绝。
- dock 阶段：receive hooks 带 `HOOK_FLAG_DOCK_EXECUTOR` 标记（flags 位 16），supplier 由订单级一次性选择写入；dock 阶段没有 order-trigger 钩子。

hook flags 全集：`1 = ORDER_TRIGGER_MINT`、`4 = EMIT_READY`、`8 = ADMISSION`、`16 = DOCK_EXECUTOR`、`32 = DYNAMIC_EXECUTOR`。

## 运行与证明

```text
出生信号 submitted with empty orderId
  -> admission（validWhen 在空订单上下文求值）
  -> _newOrderId + OrderTriggered + first fact
  -> order-trigger HookReady

receive hook evaluates
  -> HookStatusChanged
  -> (if emitReady) HookReady(planId, orderId, hookId, stageId, hookName)
  -> 后续 fact 由 assigned supplier signal 或 Dock 发射写入
```

`HookReady` 只表示任务或入口可处理，不表示业务完成。完成、失败与取消由授权的 `SignalSubmitted` 或 Dock 发射事件表达；未知或重试状态以显式状态呈现。

## 接受域

- stage 字段闭集：`name`、`source`、`executor`、`selectedStages`、`sendSignals`、`receiveSignals`、`fileResources`、`fileWriters`。
- 出生条目在本阶段 `sendSignals` 内且唯一；出生阶段使用静态 plain 执行者。
- 同单事实连接只用 `receiveSignals` 的 `source::condition` 表达式；跨秩序协作使用独立 `kind: Dock` 文档 + 目标阶段 `executor.supplierType: dock`，见 [Dock 与 Binding](../state-machine/docking.md) 与 [Dock 协作](../apps/zhixu-as-executor.md)。
- 环节定义、字段级校验与两轨接受域以 `uvp-core` 语言正本与 `uvp-eth` 仓 `uvp-chain.md` 附录 B 为准。
