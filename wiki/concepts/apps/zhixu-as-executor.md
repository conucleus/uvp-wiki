---
title: Dock 协作
type: explanation
audience: 协议读者、集成工程师
preread: ../state-machine/docking.md
status: verified
---

# Dock 协作

> 前置阅读：[Dock 与 Binding](../state-machine/docking.md)

跨秩序协作的唯一形态是 Dock：B 侧发布独立 `kind: Dock` 文档声明 A→B 发射条件；B 订单在挂接 stage 一次性选定 dock supplier，写入 `dock_link`（A 单号）建立 binding，poke 求 A/B 窗口并把满足的 B 输出信号发射到 B 订单。A 侧保持自己的订单、授权与生命周期。

## 核心模型

```text
B 侧发布 Dock 文档：
  spec.from = A 秩序的内容派生 uid + source
  spec.to   = B 秩序的内容派生 uid + stage（该 stage 声明 supplierType: dock）
  spec.signalMap：B 输出信号名 -> A 侧 validWhen 表达式

B 订单运行期：
  1. 挂接 stage 一次性选定 dock 执行者（stage patch；选中后固定）
  2. 文件映射写入 dock_link = A 单号 -> binding
  3. poke：A 窗口（A 订单事实）与 B 窗口（发射适格）交集时，把 B 输出信号写入 B 订单
  4. B 阶段 hooks 消费这些信号，继续推进本地流程

A 订单：事实照常产生，订单号与生命周期保持原身份
```

两侧订单都是独立的 `UVPStateMachine` 订单，身份为复合键 `(planId, orderId)`；跨 plan 引用必须携带 `planId`。Dock 只做事实到发射条件的映射，订单创建由各自秩序的出生通道完成（见 [出生信号与订单入口](../core/trigger.md)）。

## YAML 形态

B 侧目标 stage 声明 dock 执行者与绑定面：

```yaml
- name: packing
  source: seller
  executor:
    supplierType: dock
  receiveSignals:
    START: "seller::packing.start"
  sendSignals: [{name: start}, {name: cmp}]
```

B 侧发布独立 Dock 文档（`uvp.dock.v1`）：

```yaml
apiVersion: uvp/v0
kind: Dock
metadata:
  name: packing_service
spec:
  from:
    zhixu: zx-9c41f0d27a3e5b86c4d1af0b7e285c36   # A 侧定义的内容派生 uid
    source: seller
  to:
    zhixu: zx-2f7a1c9b4e6d8053a1c2b3d4e5f60718     # B 侧定义的内容派生 uid
    stage: packing
  signalMap:
    cmp: "seller::washing.cmp"
```

| 字段 | 约束 |
| --- | --- |
| `spec.from.zhixu` / `.source` | 已发布定义的内容派生 uid；source 由该定义的某个 stage 声明。 |
| `spec.to.zhixu` / `.stage` | 已发布定义的内容派生 uid；stage 以 `supplierType: dock` 承接，输出信号由 `sendSignals` 声明。 |
| `spec.signalMap` | key 是 B 侧输出信号名（∈ `to.stage.sendSignals`）；value 是 A 侧 Filter 表达式，header source = `from.source`，atoms 落在 `from.source` 的阶段已声明信号上。 |

## 为什么这样设计

- **B 侧声明静态订阅**：契约在编译期固定（`uvp.dock.v1`），运行期只做身份与窗口求值，Dock 文档内容变即新 `dkid`。
- **A/B 对等、独立治理**：两侧各自有 plan、授权、订单与证明；B 侧自主决定接收哪些 A 事实、发哪些输出信号。
- **dock supplier 一次性选择**：责任在订单内固定，换选有具名拒绝；selector 必须是 selector stage 的 assigned supplier account，选中 SID 必须 active。
- **binding 以 A 单号表达**：同一 A 单回到同一 binding，能力可回放；binding 身份是 7 word 的 `bindingId`。

## 运行时路径

```text
A 订单事实提交
  -> pokeDockBinding（permissionless：读 dock_link、校验内容哈希、求 A 窗口）
  -> B 侧 sendSignals.validWhen 适格复核
  -> 满足的 output 写入 B 订单（逐 output first-win，provenance 携带 bindingId）
  -> B 阶段 hooks 求值 / 后续阶段推进
  -> 事件进入 chain read 投影（uvp.dockBinding.v1）
```

## 证明与读面

| 问题 | 证明来源 |
| --- | --- |
| Dock 声明是否已注册 | `DockRegistered` 与 `getDock(dkid)`。 |
| 谁承接 B 阶段 | `StageDockSupplierSelected`、`stageSupplierAssignment` 与 `getStageDockBinding`。 |
| binding 身份是什么 | 7 word 的 `bindingId` 与 `dock_link` 文件记录。 |
| A/B 窗口当前状态 | `dockOutputWindow` / `getStageDockBinding` 与 `uvp.dockBinding.v1` 读面（相对 `dueInSeconds`，无持久窗口历史）。 |
| B 输出是否发射 | `DockOutputSubmitted` 与 B 订单上的 `SignalSubmitted`。 |
| 如何回放 | 选择记录 + `dock_link` + `DockBindingPoked` / `DockOutputSubmitted` 事件重建。 |

## Store 工作流

```text
选择 B 订单与挂接 stage
  -> 发布或选择 Dock 声明（得到 dkid）
  -> 一次性选定 dock 执行者
  -> 写入 dock_link（A 单号）
  -> poke 并监控窗口 / pending / emitted 读面
  -> operator 审批属于链下 workflow；正式事实看链事件
```

试拼、审核与 dock 会话是链下 workflow 材料；正式运行以 Dock 注册、执行者选择、binding 与发射事件为准。

## 边界

- A/B 订单独立，身份是 `(planId, orderId)`；跨 plan 引用带 `planId`，关联两侧一律使用复合身份。
- Dock 在既有 B 订单上建立 binding 并发射输出信号；订单由所属秩序的出生通道创建。
- 终态只由本地阶段/订单结束驱动；输出信号表达的是映射自 A 窗口的 B 事实。
- store 记录与链上事实分工见 [协议边界](../protocol-boundaries.md)：链上事件是事实源，链下只做投影与 workflow 状态。

执行者视角的绑定细节见 [Dock 与 Binding](../state-machine/docking.md)。
