---
title: Docked Zhixu Runtime
type: explanation
audience: 工程贡献者
status: verified
---

# Docked Zhixu Runtime

Docked Zhixu 是状态机运行时里的 order-to-order 对接能力。它允许一条
local order 把某个 stage 交给另一条 linked Zhixu / linked order 执行，再把
linked order 中已经发生的 signal 映射回 local order。

这不是 Store sandbox 草稿，也不是普通后端联动。正式运行态要落到
`UVPDockingModule` 的 v2.1 事件和 proof 上；合约只接受已经通过
`dockRoutesRoot`、`dockInterfaceRoot` 和各自 Merkle proof 的 route/interface。

## 状态机对象

| 对象 | 含义 |
| --- | --- |
| local order | 当前订单，身份是 `(localPlanId, localOrderId)`，等待 peer Zhixu 的输出推动本地阶段。 |
| linked order | 被 dock 进来的另一条 Zhixu order，身份是 `(targetPlanId, linkedOrderId)`，有自己的 plan、授权、signal 和 proof。 |
| dock instance | 一次具体对接，绑定 local stage、route、target plan/order、source seam、inputs/outputs roots 和 depth。 |
| input binding | local Hook 到 target entrance/signal port 的绑定，按 `inputBindingHash` 去重。 |
| output binding | target output port 到 local source/signal 的映射，按 `outputBindingHash` 去重。 |

## 链上事件

| 事件 | 说明 |
| --- | --- |
| `DockOpened` | 原子记录 dock instance、local/target plan/order、route、depth 和 opener。 |
| `DockInputSubmitted` | 记录 entrance 或 signal input 已按 binding 投递到 linked order。 |
| `DockOutputSubmitted` | 记录 linked output 已按 binding 映射回 local order。 |
| `DockTerminal` | 记录 dock 进入 success/failure/cancelled 终态。 |

`UVPStateMachineLens.getActiveDock`、`dockInputDelivered`、
`dockOutputDelivered`、`dockByLocalRoute` 和 `dockByTargetOrder` 是读取当前
对接状态的权威 view；旧的 `getActiveDockedOrderLink`、
`getActiveDockedSignalBinding` 已删除。

## 运行路径

```text
local stage HookReady(planId, orderId, hookId, ...)
  -> Store/Product 或 adapter 选择已发布的 target Zhixu/version
  -> openDockedOrder 校验 route/interface roots、permit、身份和 depth
  -> 原子创建 linked order 并提交 entrance input
  -> linked order 按自己的 Plan、授权和 executor 运行
  -> submitDockedInput 投递后续 local signal input（按需）
  -> linked SignalSubmitted 出现
  -> submitDockedSignal 提交 output binding
  -> local order 出现映射 SignalSubmitted 和 DockOutputSubmitted proof
  -> local hooks 继续求值；终态 output 发出 DockTerminal
```

跨 plan 的每个引用都必须保留 `planId`。`orderId` 不是全局键，不能用 bare
`orderId` 查找或合并 dock、signal、proof。`dockInstanceId` 的 preimage 也
包含 local plan namespace；`linkedOrderId` 从 dock instance 和 target
definition 身份派生，防止跨 plan 抢占。

## 订阅与入口

local stage 的入口由 `receiveSignals` Hook 产生；跨源事实使用
`::ANCHOR(@source::task.stage.signal)`，出生阶段另声明 `mint: per-fact`。
旧的 `stage.trigger`、`externalSignals`、`triggerEntrance`，以及
`::OUTSIDE@(...)`、`::MERGE@(...)`、旧 `::ANCHOR@(…)` wrapper 不属于当前
DSL，编译器会拒绝。

linked Zhixu 的 `supplierType: zhixu` 配置必须将 `inputMap` 和 `signalMap`
写成目标端口名，并由 `uvp.dock.resolution.v1` manifest 解析目标 UID/version、
artifact/interface roots。`signalMap` 不再承载 Hook DSL，也不会凭配置自动
完成 local 业务。

## 深度与幂等

父订单的真实 dock depth 是唯一权威，新 instance 的 depth 为
`parentDepth + 1`，且不得超过冻结的 `MAX_DOCK_DEPTH=8`。open、entrance
input、linked-order registration 和 `DockOpened` 在一笔 EVM 事务中完成；任一
步骤失败全部回滚。重复 open 在 dock 身份、route、endpoint 和 permit 校验
通过后返回 `false`，不会再次消耗 permit nonce；重复 input/output 同样返回
幂等结果或明确冲突。

## 边界

- local order 和 linked order 都是独立链上订单，各自有 `(planId, orderId)`、授权、事件和生命周期。
- linked Zhixu 的 plan publication、order registration、signal authorization 和 proof 独立存在。
- Store docking session 只是试拼和审核材料；正式 proof 看 `DockOpened`、`DockInputSubmitted`、`DockOutputSubmitted`、`DockTerminal` 及两边订单事件。
- `submitDockedSignal` 只映射 linked order 已存在且满足 binding 的 signal，不替 linked order 生成业务事实。
- unknown、pending、reverted 和 retryable 状态必须由 adapter/Store 分别表达，不能渲染成成功或静默空结果。

执行者视角的 canonical 叙事见 [Docked Zhixu / Zhixu 作为 Executor](../apps/zhixu-as-executor.md)。
