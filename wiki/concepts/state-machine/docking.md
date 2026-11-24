---
title: Dock 与 Binding
type: explanation
audience: 工程贡献者
preread: ../core/trigger.md
status: verified
---

# Dock 与 Binding

> 前置阅读：[出生信号与订单入口](../core/trigger.md)

Dock 是跨秩序协作的唯一通道：一条秩序（B 侧）以独立 `kind: Dock` 文档声明“它的哪个阶段的哪条输出信号，在另一条秩序（A 侧）的哪条 source 上满足什么事实条件时发射”。运行期在 B 订单的挂接阶段选定 dock 执行者、写入 A 单号并 poke 求窗口，A/B 窗口交集时把 B 输出信号发射到 B 订单。

两侧订单都是独立的 `UVPStateMachine` 订单，身份是复合键 `(planId, orderId)`；Dock 把 A 订单里已发生的事实映射成 B 订单的发射条件，订单创建仍由各自秩序的出生通道完成。协议不变量总纲见 [协议边界](../protocol-boundaries.md)。

## 状态机对象

| 对象 | 含义 |
| --- | --- |
| Dock 文档 | B 侧发布的 `kind: Dock` 定义：`spec.from{zhixu,source}` / `spec.to{zhixu,stage}` / `spec.signalMap`；编译产物为 `uvp.dock.v1`，身份 `dkid = zd-<32hex>`。 |
| dock 阶段 | B 侧目标 stage，声明 `executor.supplierType: dock` 与 `receiveSignals`；其 hooks 带 `HOOK_FLAG_DOCK_EXECUTOR` 标记。 |
| dock supplier 选择 | 某个 B 订单在挂接 stage 上一次性选定 dock supplier 的订单级 stage patch；选中后固定。 |
| binding | 由 `dock_link` 文件项（A 单号）确定的 A→B 关系；链上身份为 7 个 32-byte word 的 `bindingId`。 |
| output 窗口 | 每个 B 输出信号一行：A 窗口（A 侧 `validWhen` 程序）+ B 窗口（B 侧 `sendSignals.validWhen` 适格）。 |

## 注册：B 侧声明 Dock

`UVPDockRegistry`（ABI 0.1）持有静态 Dock 注册表。`registerDock` 写入 from/to plan、`from.source`、`to.stage`、docHash 与每个 output 的窗口指令计划（atoms + `SIGNAL` / `NOT` / `AND` / `OR` / `DELAY`）；注册 permissionless，每个 output 与 atom 都要通过对应 plan 的 `capabilitiesRoot` 成员证明，因此 Dock 只引用已声明的信号。

- 身份：`dkid = bytes32(bytes16(docHash))`；`docHash` 由 Dock 文档内容派生（domain `uvp:dock-uid:v1`，剔除 `metadata.name` / `metadata.annotations`）。
- 读面：`getDock(dkid)` / `dockOutputCount(dkid)` / `getDockOutput(dkid, outputIndex)`，入参是 **dkid word**（artifact `dkid` 右补零）。
- 事件：`DockRegistered` 携带完整 outputs、atoms 与 A 窗口程序。
- 云轨注册入口与错误码见 `uvp-cloud.md` 的 Dock 端点；两轨接受域差异见 `uvp-eth` 仓 `uvp-chain.md` 附录 B。

## Supplier 选择：B 订单的一次性决定

挂接 stage 的 dock supplier 由订单级 stage supplier patch 选定：`UVPStagePatchModule`（ABI 0.1）的 `selectStageDockSupplier` / `selectStageDockSupplierFor` 接收 `StageDockSupplierSelection`，selector 阶段用 EIP-712 签名（域 `stageSupplierPatch` 1；直接调用路径以 `msg.sender` 为 selector，且必须是 selector stage 的 assigned supplier account）。

合约校验：该 stage 的 hooks 带 `HOOK_FLAG_DOCK_EXECUTOR`、selector 的 binding 关系、supplier SID 必须 active。同 dkid + supplier 的重放幂等吸收，换选响亮拒绝（`StageDockSupplierAlreadySelected`）；事件 `StageDockSupplierSelected` 记录 targetStageId、dockId、supplierId 与 patchNonce。选中后固定，dock 阶段的 supplier 只走这条一次性选择路径（通用 stage supplier patch 由 `StageSupplierPatchForbiddenOnDockStage` 拒绝）。

## Binding：A 单号即关系

binding 由挂接 stage 的文件映射项 `dock_link` 确定：key 为 `keccak("dock_link")`，value 是 canonical A 订单号（`0x` + 64 hex）。写入即建立、改写即切换；同一 A 单回到同一 binding。

链上 binding 身份为 7 个 32-byte word：

```text
bindingId = keccak256(abi.encode("uvp.dock.binding_id.v1",
  dkid, toPlanId, toOrderId, toStageId, fromPlanId, fromOrderId))
```

`dock_link` 文件记录的 `contentHash` 只在 poke 时认证载荷正文：正文与记录不一致即 `DockBindingContentHashMismatch`。binding 身份、事件、view 与事实 provenance 都只使用 `bindingId`。

## 窗口与发射：poke

`pokeDockBinding(planId, orderId, targetStageId, payloadContent, fromOrderId, outputCapabilityProofs[])` 是 permissionless 的求值入口：

1. 校验 `dock_link` 载荷与内容哈希，确认 A 订单属于 Dock 的 from plan；
2. 用 `evaluateDockWindow` 在 A 订单事实上求 A 窗口（与 hook 同一求值器；`~` 在事实到达时关闭、`+T` 延迟锚点）；
3. 对每个 output 复核 B 侧 `sendSignals.validWhen` 适格（pre-state 判 Ready）；
4. 已满足的 output 通过 `submitDockOutputSignalFromModule` 写入 B 订单，逐 output first-win；A/B 窗口尚未交集时该 output 保持待发射。

事件：`DockBindingPoked`（每笔一次，含 bindingId、fromOrderId、supplierId 与 emittedCount）与 `DockOutputSubmitted`（每 output 一次，含 bindingId、outputIndex、signalId、supplierId）。B 事实的 provenance 携带 `bindingId`。

## 读面与回放

- 链上读面：`getStageDockBinding(planId, orderId, targetStageId, fromOrderId)` 报告当前 binding（dock、supplierId、supplierAccount、fromPlanId、bindingId）；`dockOutputWindow(...)` 给出当前 A/B 窗口是否满足、相对 `dueInSeconds` 与 emitted 状态。历史窗口时间以上链事件为准。
- 链读 DTO：`uvp.dockBinding.v1`（`binding_id`、`dkid`、from/to 身份、outputs 窗口与 emitted、`pending`），由 chain-services 从事件与读面组合；投影要能从事件重建。
- 回放：binding 状态由（dock supplier 选择记录、`dock_link` 文件项、poke/发射事件）重建；回放收敛到同一 binding 集合与同一 B 事实集合。

## 边界

- 两侧订单独立：`(planId, orderId)` 复合身份，跨 plan 引用必须携带 `planId`；关联两侧一律使用复合身份。
- 终态只由本地阶段/订单结束驱动，Dock 输出只表达 A 窗口事实映射出的 B 信号。
- 目标侧 `to.stage` 以 `receiveSignals` 声明绑定面；出生只由出生信号承载（[出生信号与订单入口](../core/trigger.md)）。
- Store 的试拼、审核与 dock 会话属于链下 workflow 材料；正式事实看 `DockRegistered`、`StageDockSupplierSelected`、`DockBindingPoked`、`DockOutputSubmitted` 与两侧订单事件。
- 未知、pending、reverted、retryable 状态分别表达为不同结果。

执行者视角的协作叙事见 [Dock 协作](../apps/zhixu-as-executor.md)。
