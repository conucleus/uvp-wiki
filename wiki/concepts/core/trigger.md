---
title: Ready 与订单入口
type: explanation
audience: 协议读者
preread: ../README.md
status: verified
---

# Ready 与订单入口

> 前置阅读：[核心概念](../README.md)

stage 级 `trigger` 是显式出生入口：它声明本 stage 的 `sendSignals` 子集，
每个 trigger 信号合成一条 order-trigger hook。`receiveSignals` 的每一项仍然是
同单 Hook；编译器用 `orderTriggerKind` 与 `emitReady` 标记 Hook 的入口角色，
编译产物再用 `triggers[]` 枚举全部 order-trigger hook。

## 三种入口角色

| `orderTriggerKind` | 语义 |
| --- | --- |
| `none` | 普通订单内 Hook；Ready 只更新状态并可被后续流程消费。 |
| `trigger` | 出生入口；绑定本 stage 的一个 trigger 信号，空 `orderId` 提交时建单。 |
| `dock` | 对接入口；Ready 后可按已提交的 dock route/interface commitments 打开或挂接 linked order。 |

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
    READY: seller::submit.cmp
  sendSignals: [{name: str}, {name: cmp}, {name: err}]
```

出生阶段用 `trigger` 显式声明可建单的信号；trigger 条目必须是本 stage
`sendSignals` 的子集：

```yaml
- name: intake
  source: customer
  trigger: [requested]
  sendSignals: [{name: requested}, {name: str}, {name: cmp}, {name: err}]
```

- `trigger` 可省略或为空：该 stage 不能建单；非空：每个信号合成一条
  order-trigger hook。一个 stage 可以有多个 trigger 信号，一个 plan 可以有多个
  trigger stage，trigger stage 不必是首个 stage。
- 提交 `(stage, signal, orderId?)`：带 `orderId` 时信号是普通订单内信号，
  trigger 身份无关；空 `orderId` 时信号必须命中该 stage 的 `trigger` 集合，
  否则用未命中 trigger 的类型化错误拒绝。
- 命中 trigger 时，先以空订单上下文求值该信号的 `validWhen`（无 facts/files、
  负条件为真、存在/延时条件为假）；不通过即拒绝 `SignalAdmissionRejected`。
  通过后按出生事实派生 oid、登记/创建订单，并把该信号写为首事实。
- 同一出生事实重试幂等：同一 oid，不重复建单。`birthKey`/`factKey` 的幂等语义
  由提交侧保留。
- trigger stage 必须使用静态的 `individual`/`organization` executor（带
  `supplierID`），不能是 `zhixu` executor，也不能是 executor patch 目标。

## Dock 入口

`supplierType: zhixu` 阶段通过 `zhixuExecutorConfig` 描述 dock，不使用
`supplierID`、`triggerEntrance` 或 Hook DSL 形式的 `signalMap`：

```yaml
executor:
  supplierType: zhixu
  zhixuExecutorConfig:
    target:
      zhixu: customs-clearance
    interface: clearance_service
    order:
      mode: new
    inputMap:
      READY: execute        # mode=new：恰好一条 input 绑定（出生锚）
    signalMap:
      str: started
      cmp: completed
      err: failed
```

`inputMap` 的 key 必须是本地 `receiveSignals` 通道，value 必须是目标接口
input 端口名；`signalMap` 的 key 必须是本地 `sendSignals`，value 必须是目标
接口 output 端口名。两张 map 至少一张非空。目标 name（slug 形态，与
`metadata.name` 同规则）、接口存在、端口方向、`order.mode ∈ 目标接口 orderModes`、
接口 root、route root 和 `mode=new` 的唯一 input 绑定都在编译期验证。
`mode=existing` 不创建子订单，
只对等挂接既有目标订单——两轨均承接，链上经 `attachDockedOrder`
（`UVPDockingModule` 4.8）挂接，挂接后与 `new` 同一交付面
（见 [Docked Zhixu Runtime](../state-machine/docking.md)）。

## 编译器显式拒绝的形态

以下写法不是合法 DSL，由编译器明确拒绝：

- stage 闭集外的字段与 executor 的 `triggerEntrance`；
- `trigger` 条目不在本 stage `sendSignals` 内、条目重复，或 trigger stage 的
  executor 不是静态 plain executor；
- `supplierType: zhixu` 与 `supplierID` 并用；
- 把 `signalMap` value 写成 `source::stage.signal` Hook DSL；
- 跨秩序订阅 wrapper 形态——同单条件只使用 `source::condition` 表达式。

同秩序的普通事实连接使用 `receiveSignals`；跨秩序使用 `spec.dockInterface` 与
`executor.zhixuExecutorConfig`；trigger 是显式出生入口。

## 运行与证明

```text
trigger signal submitted with empty orderId
  -> admission (validWhen) in the empty-order context
  -> OrderRegistered + first fact
  -> order-trigger HookReady

receive hook evaluates
  -> HookStatusChanged
  -> (if emitReady) HookReady(planId, orderId, hookId, stageId, hookName)
  -> Product/Store projects a task or dock workflow
  -> authorized signal / dock event supplies the next fact
```

`HookReady` 只表示任务或对接入口可处理，不表示业务完成。完成、失败和取消
必须通过授权 `SignalSubmitted` 或 docking module 的 proof 事件表达；未知或
重试状态不得被 UI 当成成功。
