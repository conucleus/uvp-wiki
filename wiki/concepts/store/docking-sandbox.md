---
title: Dock 声明与试配
type: explanation
audience: 凝结核成员、Dock 接入方
preread: README.md
status: verified
---

# Dock 声明与试配

> 前置阅读：[秩序商店（Store）](README.md)

跨秩序协作由 B 侧独立发布的 `kind: Dock` 静态文档声明；挂接 stage 只声明 `executor.supplierType: dock` 承接。Store 侧承载 Dock 声明的编辑、试配与审核材料组织，并展示链上事实的投影；Dock 是否注册、binding 是否建立、output 是否发射，以 `UVPDockRegistry` / `UVPStagePatchModule` 事件与对应读面为准（总纲见 [协议边界](../protocol-boundaries.md)）。

## Dock 声明

Dock 是与 `kind: Zhixu` 并列发布的独立文档，不在 `Zhixu.spec` 内，声明一条 A→B 的静态时间窗订阅：

```yaml
apiVersion: uvp/v0
kind: Dock
metadata:
  name: packing_service
spec:
  from:
    zhixu: zx-9c41f0d27a3e5b86c4d1af0b7e285c36   # A 秩序的内容派生 uid（zx-<32hex>）
    source: seller
  to:
    zhixu: zx-2f7a1c9b4e6d8053a1c2b3d4e5f60718   # B 秩序的内容派生 uid
    stage: packing                                # B 侧 dock 执行者阶段
  signalMap:
    cmp: "seller::packing.str & ~seller::packing.cmp"
```

- `spec.from.zhixu` / `spec.from.source`：A 侧定义的内容派生 uid 与 A 侧 source；`signalMap` 表达式的 atoms 来自该 source 的 stage 已声明的 `sendSignals`。
- `spec.to.zhixu` / `spec.to.stage`：B 侧定义 uid 与目标阶段；该阶段以 `executor.supplierType: dock` 承接，输出信号名已在 `sendSignals` 中声明。
- `spec.signalMap`：B 侧输出信号名 → A 侧 `validWhen` 表达式；header source 固定为 `spec.from.source`，按 Hook DSL 过滤档解析。

Dock 的编译产物为 `uvp.dock.v1`，身份 `dkid = zd-<32hex>`：由文档内容派生（剔除 `metadata.name` / `metadata.annotations` 后的 canonical 文档算 `docHash`），内容一变即新 dkid，重复发布幂等。对接面完全由两侧 stage 的声明表达：A 侧事实面是 `from.source` 阶段 `sendSignals` 声明的信号，B 侧输出面是 `to.stage` 的 `sendSignals`，B 侧绑定面是 `to.stage` 的 `receiveSignals`（dock 阶段接收 hook）。

## Store 侧承载什么

Store 侧组织的是试配记录、审核材料与链上事实投影，属于链下 workflow（边界见 [协议边界](../protocol-boundaries.md)「读模型边界」）：

- 编辑 Dock 声明草稿，并按 `kind: Dock` 的字段闭集校验：`from` / `to` 定义 uid 的内容派生身份、`from.source` 与 `to.stage` 存在性、`to.stage` 的 dock 执行者声明、`signalMap` 输出名属于 `to.stage.sendSignals`、表达式 atoms 属于 `from.source` 的 `sendSignals`。
- 试配检查 A/B 两侧 plan 的 capability 词表是否覆盖 `signalMap` 的 atoms 与 outputs（`UVPDockRegistry.registerDock` 会逐 atom / 逐 output 验证 capability proof），以及目标 stage 的 `sendSignals.validWhen` 是否表达 B 窗口。
- 生成 operator review 材料与 proof checklist：声明原文、编译产物 `dkid` / `docHash`、capability 材料、两侧 Plan 身份。
- 展示链上事实投影：`DockRegistered`（静态登记）、`StageDockSupplierSelected`（dock 执行者一次性选择）、`DockBindingPoked` / `DockOutputSubmitted`（binding poke 与 output 发射），以及 chain-services 的 `uvp.dock.v1` / `uvp.dockBinding.v1` 读面。A/B 窗口当前值读 `getStageDockBinding` / `dockOutputWindow` 的 live 值，窗口历史不在链上。

试配通过说明声明形状与材料齐备；协议事实仍由链上注册、执行者选择、binding 与 poke 产生。

## 正式路径

```text
B 侧发布 kind: Dock 文档
  -> 两侧 Plan 经 publisher 签名 commit 并 finalize（capabilitiesRoot 承诺 atoms 与 outputs）
  -> UVPDockRegistry.registerDock（permissionless；逐 atom / 逐 output capability proof）
  -> B 订单经出生通道创建（Dock 不建单）
  -> selectStageDockSupplier / selectStageDockSupplierFor：selector 以 EIP-712 签名一次性选定 dock 执行者
  -> 阶段文件 patch 写入 dock_link = A 单号，建立 binding
  -> pokeDockBinding：按 block.timestamp 求 A 窗口并复核 B 侧 validWhen，逐 output first-win 发射 B 输出信号
```

dock supplier 选中后固定：同 dkid + supplier 的重放幂等吸收，换选 revert `StageDockSupplierAlreadySelected`。binding 身份是 7 个 32-byte word 的 `bindingId`（dkid、toPlanId、toOrderId、toStageId、fromPlanId、fromOrderId），不含 payload hash 或 generation；`dock_link` 文件项的 `contentHash` 只在 poke 时认证载荷正文，不匹配 revert `DockBindingContentHashMismatch`。poke permissionless，任何调用方都可在 A/B 窗口交集时推进发射，事件 `DockBindingPoked` / `DockOutputSubmitted` 长期在链上。

## 试配记录建议结构

| 字段 | 说明 |
| --- | --- |
| from / to | A 侧与 B 侧定义 uid（`zx-<32hex>`）、`from.source`、`to.stage`。 |
| signalMap | B 输出信号 → A 侧表达式；编译产物中每个 output 的 AST / dependencies / atoms。 |
| 编译身份 | `uvp.dock.v1` 的 `dkid` 与 `docHash`。 |
| 目标 stage 声明 | `executor.supplierType: dock`、`receiveSignals`、`sendSignals`（含 `validWhen`）。 |
| capability checklist | A plan 的 atoms capability 材料、B plan 的 outputs capability 材料、`supplierBindingsRoot` 候选证明。 |
| 链上事实 | `DockRegistered`、`StageDockSupplierSelected`、`DockBindingPoked`、`DockOutputSubmitted` 与两侧订单 proof。 |
| review | operator note、风险、审批状态；不进入协议事实。 |

## 边界

- Dock 是静态 A→B 订阅：两侧秩序对等，Dock 不创建订单、不改变订单号、不搬运事实。
- Store 只组织声明草稿、试配与审核材料，并展示链上事实投影；每条事实的 owner 见 [协议边界](../protocol-boundaries.md)。
- 正式关系看 `dock_link` 文件项与 `StageDockSupplierSelected`；output 发射看 `DockOutputSubmitted`；B 订单推进看授权 signal / proof。
- Dock 声明与绑定的完整机制见 [Dock 与 Binding](../state-machine/docking.md)；dock supplier 协作见 [Dock 协作](../apps/zhixu-as-executor.md)。
