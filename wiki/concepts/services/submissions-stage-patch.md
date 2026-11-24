---
title: Submissions 与 Stage Patch
type: reference
audience: 应用开发者
status: verified
---

# Submissions 与 Stage Patch

本页说明链下提交路径与 stage patch 的边界：签名与 direct/relay 投递由参与方钱包、`uvp-client` 与应用侧完成；chain-services 只索引事件、重建投影并提供链读，不广播交易、不生成业务签名。

## 提交生命周期

```text
prepare UVPStateMachineSignalSubmission typed data
  -> payload hash / files hash / attribution hash binding
  -> assigned supplier account signs EIP-712 typed data
  -> submit signed payload（direct 或 relay）
  -> verify signer and payload structure
  -> broadcast
  -> track tx hash / failure / retry
  -> indexer confirms chain event
```

- 业务签名只能来自 assigned supplier account；relayer 代付 gas 与广播，不生成业务签名。
- submission 状态是 operational state：它说明一笔交易是否送出、失败或确认；订单推进来自 `SignalSubmitted`、`HookReady` 或 stage supplier patch 事件。
- Product 业务行、钱包会话与提交编排归产品侧应用；chain-services 只保留链投影与通用链读。

## Stage Patch 的两类动作

| 动作 | 改什么 | 边界 |
| --- | --- | --- |
| stage supplier patch | 某个订单里 target stage 的 supplierId。 | Plan 静态版本不变；candidate 阶段由 `supplierBindingsRoot` 的 kind=1 叶证明，selector 必须是 selector stage 的 assigned supplier account。 |
| 阶段文件写入 | 某个订单里 target stage 的 `{key, payload}` 映射。 | 正文留在链下；同 key 覆盖、整笔原子；事件 `StageFileWritten`。 |

- stage supplier patch 入口：`UVPStagePatchModule.applyStageSupplierPatch` / `applyStageSupplierPatchFor`（以 `previousSupplierId` 区分 assign / handoff；`candidateProof` 成员证明），事件 `StageSupplierPatchApplied`。
- dock supplier 选择：`selectStageDockSupplier` / `selectStageDockSupplierFor` 一次性选定，事件 `StageDockSupplierSelected`；binding 与 output 发射事件 `DockBindingPoked` / `DockOutputSubmitted`。
- 阶段文件写入入口：`submitSignal` 的 `files: StageFile[]`（`signalId == 0` 为纯文件写入），由 `UVPFileResourceModule.applyStageFiles` 同 key 覆盖。
- 两类动作都是订单级事实，projection 从同一事件流重建；typed data、call builder 与 digest 由 `uvp-client/package/src/core/` 与 `uvp-protocol/packages/protocol-bindings/` 维护。

## 投影入口

chain-services 的投影入口为 `src/indexer/projections/stage.ts`（`StageSupplierPatchApplied` / `StageDockSupplierSelected` / hook 生命周期）、`src/indexer/projections/stage-files.ts`（`StageFileWritten`）与 `src/indexer/projections/dock.ts`（binding 与 output）；通用链读见 `src/api/routes/chain-read.ts`。

## 边界

以下边界是[协议边界总纲](../protocol-boundaries.md)在提交路径上的具体化；patch 的授权与信任语义另见 [Stage Patch 授权](../trust/stage-patch.md)。

- selector 签名必须来自被授权的 selector（selector stage 的 assigned supplier account），不来自 relayer。
- patch 只影响单个 order 的 supplier 或文件引用，不修改 plan version。
- 业务完成与 patch 结果都以链上事件为准；submission 状态不推进订单。
- 文件映射只存 opaque `{key, payload}`，业务正文留在链下。
