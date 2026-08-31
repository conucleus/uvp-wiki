---
title: Trigger
type: explanation
audience: 协议读者
preread: ../README.md
status: verified
---

# Trigger

> 前置阅读：[核心概念](../README.md)
Trigger 把一个 ready condition 变成可执行任务。它是一种特殊 hook 标记：某个 receive hook Ready 后，这个 stage 的任务可以打开，链上应发出 `HookReady`，Product/Store/executor-kit 才能把它投影成任务、通知或 adapter job。

第一遍可以把 `HookReady` 理解成“这个任务可以处理了”。它不表示业务已经完成；业务完成要等后续授权 `SignalSubmitted` 事件和证据指纹来证明。

Trigger 是 stage 的入口声明，来自秩序 stage 的 `trigger` 数组。每个 key 必须对应 `externalSignals` 或 `receiveSignals`：前者是 backend/executor 的直接输入，不生成 `HookReady`；后者才编译为 Hook 并在条件满足时产生 `HookReady`。Projection 以 `hookId` 为任务／proof 身份，因此多个 receive trigger key 可以形成多个可独立审计的 task。每个 Hook 使用 `~`、`&`、`|` 和显式 duration delay（例如 `+5s`），由 Hook DSL parser/compiler 校验。

`externalSignals` 只描述原始外部事实名称。backend/executor 负责验签、去重、落库和规范化；它不会因为声明了一个 `externalSignals` 就自动向 UVP 发送 signal 或触发 callback。

```yaml
trigger:
  - START
receiveSignals:
  START: buyer::order.confirm.cmp
```

编译后，`START` 这个 receive hook 会带上 `isTrigger=true`。如果它第一次变成 Ready，`UVPStateMachine` 会发出：

```text
HookReady(orderId, hookId, stageId, hookName)
```

## 谁使用

凝结核在 stage 上声明 trigger；编译器把它们绑定到 hook 并写入 Plan；Product task 创建、Store 通知 intent 和 executor-kit chain watcher 都跟随 `HookReady` 工作。

## 产生什么结果

一个 receive trigger 在合约里第一次 Ready 时发出一次 `HookReady`（`readyEmitted` 保证一次性），由此产生可领取的任务编号和工作流入口；external trigger 只打开 backend/executor 的直接输入契约，不上链发事件。

## 权威来自哪里

trigger 绑定关系来自编译产物和链上 `StoredHook.isTrigger`；`orderId` 来自 trigger order 入口；任务是否真的完成仍由后续 signal/proof 事件决定。

## 为什么必须指定 Trigger

一个 stage 可能有多个 hook：有的用于等待输入，有的用于 signalMap，有的用于失败路径或内部条件。Trigger 的作用是把“条件成立”提升为“这个 hook 对应的任务可以打开或领取”。

产品上可以把 Trigger 理解为：

- Product task 可以创建或变成 ready。
- Store 可以产生联系或通知 intent。
- executor-kit chain watcher 可以领取或路由 job。
- adapter 可以分配外部执行编号、工单号或linked Zhixu启动请求。

编号边界：链上 `orderId` 由 `triggerOrderFromOutsideFor` 或 `triggerOrderFromSignalFor` 这类 trigger order 入口创建。Trigger 还可以触发 Product task ID、Store docking session ID、外部工单号或 linked order 创建流程；这些都是工作流编号，local order 的身份和推进 proof 仍看链上 `orderId`、trigger link 和 signal/docking events。

## 编译和合约语义

当前 compiler 要求 `stage.trigger` 里的每个名字必须引用本 stage 已存在的 `externalSignals` 或 `receiveSignals` key。只有 receive key 会绑定到 Hook；external key 是直接输入入口。

```text
stage.externalSignals.START
  -> backend/executor direct input
  -> no compiled hook / no HookReady

stage.receiveSignals.START
  -> compiled hook isTrigger=true
  -> StoredHook.isTrigger=true
  -> HookStatus Ready
  -> HookReady emitted once
```

合约有 `readyEmitted` 标记，同一个 hook 的 `HookReady` 只会发出一次。`trigger=false` 的 hook 仍然可以变成 Ready，但不会发出 `HookReady`，也不应直接创建 Product task。

## 和 docked Zhixu 的关系

当 local order 某个 stage 由另一个秩序执行时，local stage 的 Trigger 表示“现在可以把这个 stage 交给 peer 秩序或 adapter 执行”。后续 linked 秩序的 `str`、`cmp`、`err` 通过 `signalMap` 和授权 submitter 或 docking events 映射回 local order；docking 事件语义见 [Docked Zhixu Runtime](../state-machine/docking.md)。

如果 Product、registrar 或 operator workflow 从订单外部打开这个对接阶段，直接入口应声明为 `externalSignals`。这里的 `LINK_READY` 是 backend/executor 的外部输入契约，用来打开本地 stage 的 docking workflow；它本身不会生成 `HookReady`：

```yaml
trigger: [LINK_READY]
externalSignals: [LINK_READY]
executor: { supplierType: zhixu, supplierID: "{{ .peer_zhixu_uid }}" }
```

完整 `zhixuExecutorConfig` 写法见 [Zhixu 作为 Executor](../apps/zhixu-as-executor.md)。如果需要等待另一个订单的 canonical signal，应改用空标头 wrapper：`::OUTSIDE@(source::task.stage.signal)`（分叉外部订单）、`::MERGE@(source::a.cmp, source::b.cmp)`（多源汇聚）或 `::ANCHOR@(task.stage.signal)`（锚定汇合回流）。三者中仅 `::OUTSIDE@` 可用于链上轨道生单（`UVPStateMachine.triggerOrderFromOutsideFor`）；`::MERGE@`/`::ANCHOR@` 仅 cloud runtime 支持，链上编译期拒绝。`signalMap` 负责解释 linked order 输出，不会自己发出 `HookReady`。

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
- 链上 orderId 来自 trigger order 入口。
- Trigger Ready 通常表示任务可领取或可处理，业务完成看后续 signal/proof。
- `signalMap` hook 当前不触发 `HookReady`；它用于 docked Zhixu 输出映射。
