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
prepare typed data
  -> payload hash binding
  -> participant signs EIP-712 typed data
  -> submit signed payload（direct 或 relay）
  -> verify signer and payload structure
  -> broadcast
  -> track tx hash / failure / retry
  -> indexer confirms chain event
```

- 业务签名只能来自被授权参与方的钱包；relayer 代付 gas 与广播，不生成业务签名。
- submission 状态是 operational state：它说明一笔交易是否送出、失败或确认；订单推进来自 `SignalSubmitted`、`HookReady` 或 stage patch 事件。
- Product 业务行、钱包会话与提交编排归产品侧应用；chain-services 只保留链投影与通用链读。

## Stage Patch 的两类授权动作

| Patch | 改什么 | 边界 |
| --- | --- | --- |
| executor patch | 某个订单里 target stage 的 active executor。 | Plan 静态版本不变；候选执行者由 `executorCandidatesRoot` 承诺，selector EIP-712 签名与订单级授权共同生效。 |
| 阶段文件 patch | 某个订单里 target stage 的文件映射（`key -> contentHash + handle`）。 | 正文留在链下；`baseHash` 必填、整笔原子；事件 `StageFilePatchApplied` / `StageFileOpApplied`。 |

- executor patch 入口：`UVPStagePatchModule.applyStageExecutorPatch` / `applyStageExecutorPatchFor`（assign / handoff 两 mode；`candidateProof` 成员证明），事件 `StageExecutorPatchApplied`。
- dock 执行者选择：`selectStageDockExecutor` / `selectStageDockExecutorFor` 一次性选定，事件 `StageDockExecutorSelected`；binding 与 output 发射事件 `DockBindingPoked` / `DockOutputSubmitted`。
- 阶段文件 patch 入口：direct `submitSignal` 尾部的 `filesDigest` / `FilePatch`（`signalId == 0` 为纯文件 patch），由 `UVPFileResourceModule.applyStageFilePatch` 落 `add` / `replace` / `remove`。
- 两类 patch 都是订单级事实，projection 从同一事件流重建；typed data、call builder 与 digest 由 `uvp-client/package/src/core/` 与 `uvp-protocol/packages/protocol-bindings/` 维护。

## 投影入口

chain-services 的投影入口为 `src/indexer/projections/stage.ts`（`StageExecutorPatchApplied` / `StageDockExecutorSelected` / hook 生命周期）、`src/indexer/projections/stage-files.ts`（`StageFilePatchApplied` / `StageFileOpApplied`）与 `src/indexer/projections/dock.ts`（binding 与 output）；通用链读见 `src/api/routes/chain-read.ts`。

## 边界

以下边界是[协议边界总纲](../protocol-boundaries.md)在提交路径上的具体化；patch 的授权与信任语义另见 [Stage Patch 授权](../trust/stage-patch.md)。

- selector 签名必须来自被授权的 selector，不来自 relayer。
- patch 只影响单个 order 的执行者或文件引用，不修改 plan version。
- 业务完成与 patch 结果都以链上事件为准；submission 状态不推进订单。
- 文件映射只存 contentHash 与不透明 handle，业务正文留在链下。
