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
`UVPDockingModule`（abiVersion 3.0，preimage v2）的事件和 proof 上；合约只接受
已经通过 `dockRoutesRoot`、`dockInterfaceRoot` 和各自 Merkle proof 的
route/interface，绑定与路由哈希都带 `interfaceNameId`（keccak(接口名)）维度。

## 状态机对象

| 对象 | 含义 |
| --- | --- |
| local order | 当前订单，身份是 `(localPlanId, localOrderId)`，等待 peer Zhixu 的输出推动本地阶段。 |
| linked order | 被 dock 进来的另一条 Zhixu order，身份是 `(targetPlanId, linkedOrderId)`，有自己的 plan、授权、signal 和 proof。 |
| dock instance | 一次具体对接，绑定 local stage、route、target plan/order、interface、mode、source seam、inputs/outputs roots 和 depth。 |
| input binding | local Hook 到目标接口 input 端口的绑定，按 `inputBindingHash` 去重。 |
| output binding | 目标接口 output 端口到 local source/signal 的映射，按 `outputBindingHash` 去重。 |

## 链上事件

| 事件 | 说明 |
| --- | --- |
| `DockOpened` | 原子记录 dock instance、local/target plan/order、`interfaceNameId`、route、depth 和 opener。 |
| `DockInputSubmitted` | 记录 input binding 已按绑定投递到 linked order。 |
| `DockOutputSubmitted` | 记录 linked output 已按 binding 映射回 local order。 |

接口输出没有终态语义：不存在 dock 级 terminal 事件，本地阶段是否结束只由本地
阶段/订单的结束语义驱动。

`UVPStateMachineLens.getActiveDock`、`dockInputDelivered`、
`dockOutputDelivered`、`dockByLocalRoute` 和 `dockByTargetOrder` 是读取当前
对接状态的权威 view；旧的 `getActiveDockedOrderLink`、
`getActiveDockedSignalBinding` 已删除。

## 运行路径

```text
local stage HookReady(planId, orderId, hookId, ...)
  -> Store/Product 或 adapter 按定义 name 选定已发布的 target Zhixu
  -> openDockedOrder（OpenDockRequestV2）校验 route/interface roots、permit、身份和 depth
  -> 原子创建 linked order 并提交出生锚 input（mode=new 的唯一 input 绑定）
  -> linked order 按自己的 Plan、授权和 executor 运行
  -> submitDockedInput 投递后续 local signal input（按需）
  -> linked SignalSubmitted 出现
  -> submitDockedSignal 提交 output binding
  -> local order 出现映射 SignalSubmitted 和 DockOutputSubmitted proof
  -> local hooks 继续求值
```

跨 plan 的每个引用都必须保留 `planId`。`orderId` 不是全局键，不能用 bare
`orderId` 查找或合并 dock、signal、proof。`dockInstanceId` 的 preimage 也
包含 local plan namespace、modeWord 和 `interfaceNameId`；`linkedOrderId` 从
dock instance 和 target definition 身份派生，防止跨 plan 抢占。

## 模式边界：new / existing / 动态选择

- `order.mode=new`：链上完整支持。每条 route 恰好一条 input 绑定（出生锚），
  `openDockedOrder` 在一笔交易内创建子订单、登记 link 并写入出生锚事实；
  entrance permit 的 typed-data 是 `UVPDockEntrancePermitV2`（含
  `interfaceNameId`，EIP-712 域 version "3"）。
- `order.mode=existing`：链上不支持。on-chain 编译边界显式拒绝（错误说明
  on-chain target 不支持 existing，需由云轨承接或改用 new 接口），不静默降级。
- `target: null`（动态选择）：编译产物以 `unresolvedDockRoutes`
  （`uvp.dockRoute.unresolved.v1`）携带本地声明面，on-chain 编译/反序列化边界
  按 `UNRESOLVED_DOCK_TARGET` 响亮拒绝；云轨运行时读取 dock route selection
  记录补齐目标（按 name 解析，校验接口/端口满足本地声明，DB 自然键建立实例）。

## 订阅与入口

local stage 的入口由 `receiveSignals` Hook 产生；跨源事实使用
`::ANCHOR(@source::task.stage.signal)`，出生阶段另声明 `mint: per-fact`。
旧的 `stage.trigger`、`externalSignals`、`triggerEntrance`，以及
`::OUTSIDE@(...)`、`::MERGE@(...)`、旧 `::ANCHOR@(…)` wrapper 不属于当前
DSL，编译器会拒绝。

linked Zhixu 的 `supplierType: zhixu` 配置声明目标接口名、`order.mode`，并将
`inputMap` 和 `signalMap` 写成目标接口端口名；两张 map 至少一张非空。解析分两层：
core linker 按 `uvp.dock.resolution.v2` manifest 的 name 目录查找并做结构性校验；
链轨发布面的 manifest 在同一 schema 上内嵌目标定义全文，由 TS 编译器重算内容
派生身份（zx-<32hex>）与 artifact/interface roots 做内容寻址（链轨内幕）。
`signalMap` 不承载 Hook DSL，也不会凭配置自动完成 local 业务。

## 深度与幂等

父订单的真实 dock depth 是唯一权威，新 instance 的 depth 为
`parentDepth + 1`，且不得超过冻结的 `MAX_DOCK_DEPTH=8`。open、出生锚
input、linked-order registration 和 `DockOpened` 在一笔 EVM 事务中完成；任一
步骤失败全部回滚。重复 open 在 dock 身份、route、endpoint 和 permit 校验
通过后返回 `false`，不会再次消耗 permit nonce；重复 input/output 同样返回
幂等结果或明确冲突。

## 边界

- local order 和 linked order 都是独立链上订单，各自有 `(planId, orderId)`、授权、事件和生命周期。
- linked Zhixu 的 plan publication、order registration、signal authorization 和 proof 独立存在。
- Store docking session 只是试拼和审核材料；正式 proof 看 `DockOpened`、`DockInputSubmitted`、`DockOutputSubmitted` 及两边订单事件。
- `submitDockedSignal` 只映射 linked order 已存在且满足 binding 的 signal，不替 linked order 生成业务事实，也不会把任何一方自动置为终态。
- unknown、pending、reverted 和 retryable 状态必须由 adapter/Store 分别表达，不能渲染成成功或静默空结果。

执行者视角的 canonical 叙事见 [Docked Zhixu / Zhixu 作为 Executor](../apps/zhixu-as-executor.md)。
