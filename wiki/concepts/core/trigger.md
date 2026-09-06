---
title: Ready 与订单入口
type: explanation
audience: 协议读者
preread: ../README.md
status: verified
---

# Ready 与订单入口

> 前置阅读：[核心概念](../README.md)

当前 DSL 不再有 stage 级 `trigger` 或 `externalSignals` 字段。每个
`receiveSignals` 条目都是一个 Hook；编译器通过 `orderTriggerKind` 和
`emitReady` 标记该 Hook 的订单入口角色。

## 三种入口角色

| `orderTriggerKind` | 语义 |
| --- | --- |
| `none` | 普通订单内 Hook；Ready 只更新状态并可被后续流程消费。 |
| `mint` | 出生阶段入口；`mint: per-fact` 从每条 `ANCHOR(@...)` 订阅事实按纯函数代铸一个订单。 |
| `dock` | 对接阶段入口；Ready 后可按已提交的 dock route/interface commitments 打开 linked order。 |

`emitReady=true` 的 Hook 第一次变成 Ready 时发出一次 `HookReady`。事件固定
携带 `(planId, orderId, hookId, stageId, hookName)`；`planId` 必须和订单一起
保留，不能从 bare `orderId` 推导。`emitReady=false` 的内部 Hook 仍可求值，
但不会产生 `HookReady`。

## 普通阶段与出生阶段

普通阶段使用订单内表达式：

```yaml
- name: review
  source: buyer
  receiveSignals:
    READY: seller::purchase.submit.cmp
  sendSignals: [str, cmp, err]
```

出生阶段显式声明 `mint: per-fact`，并且只能以跨源订阅作为入口：

```yaml
- name: intake
  source: customer
  mint: per-fact
  receiveSignals:
    REQUESTED: "::ANCHOR(@customer::request.submit.requested)"
  sendSignals: [str, cmp, err]
```

`mint` 目前只有 `per-fact` 一个取值。出生阶段必须使用静态的
`individual`/`organization` executor；编译器拒绝自环和无界的跨源代铸环。
同一事实重复投递只会命中同一派生订单，不会产生第二个订单。

## Dock 入口

`supplierType: zhixu` 阶段通过 `zhixuExecutorConfig` 描述 dock，不使用
`supplierID`、`triggerEntrance` 或 Hook DSL 形式的 `signalMap`：

```yaml
executor:
  supplierType: zhixu
  zhixuExecutorConfig:
    schemaVersion: uvp.dock.v1
    target:
      zhixu: customs-clearance
      version: "1"
    order:
      idPolicy: derived-v1
    inputMap:
      READY: entrance
    signalMap:
      str: started
      cmp: completed
      err: failed
```

`inputMap` 的 key 必须是本地 `receiveSignals` hook，value 必须是目标入口端口
名；`signalMap` 的 key 必须是本地 `sendSignals`，value 必须是目标输出端口名。
目标 UID/version、端口方向、接口 root、route root 和入口数量都在编译期验证。

## 旧字段迁移

以下写法已退役并由编译器明确拒绝：

- `stage.trigger` 和 `stage.externalSignals`；
- executor 的 `triggerEntrance`；
- `supplierType: zhixu` 与 `supplierID` 并用；
- 把 `signalMap` value 写成 `source::task.stage.signal` Hook DSL；
- `::OUTSIDE@(...)`、`::MERGE@(...)`、旧 `::ANCHOR@(…)` wrapper。

需要跨源事实时，改用 `::ANCHOR(@source::task.stage.signal)`；需要从事实出生
订单时，再在阶段上声明 `mint: per-fact`。

## 运行与证明

```text
receive hook evaluates
  -> HookStatusChanged
  -> (if emitReady) HookReady(planId, orderId, hookId, stageId, hookName)
  -> Product/Store projects a task or dock workflow
  -> authorized signal / dock event supplies the next fact
```

`HookReady` 只表示任务或对接入口可处理，不表示业务完成。完成、失败和取消
必须通过授权 `SignalSubmitted` 或 docking module 的 proof 事件表达；未知或
重试状态不得被 UI 当成成功。
