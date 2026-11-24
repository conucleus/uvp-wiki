---
title: Stage Patch 授权
type: explanation
audience: 工程贡献者
status: verified
---

# Stage Patch 授权

Stage patch 是订单运行时的受控变更动作，分两类：stage supplier patch 在订单上选择或交接目标 stage 的 supplier；阶段文件写入改写目标 stage 的文件映射。两类都复用 assigned supplier 授权，Plan 保持静态版本，变更只落在单个 Order 上。

## 授权来源

授权直接复用阶段 assigned supplier：

- stage supplier patch 的 selector 必须是 selector stage 当前生效的 assigned supplier account（或由其签名授权）；
- 阶段文件写入的 submitter 必须是 target stage 的 assigned supplier account，或 target stage `fileWriters` 声明的 writer stage 的 assigned supplier account；
- 所有路径都经 `UVPIdentityRegistry.accountOf(supplierId)` 解析，且 SID 必须 `active`。

## Stage-to-target Binding

两个 stage 之间的变更关系由 Plan 冻结的 stage-to-target binding 约束：

```text
selectorStageId -> targetStageId
```

合约用 `UVPPlanMetadataModule.verifyStageSelectorBinding` 按 `capabilitiesRoot` 成员证明校验该关系；未声明绑定的 supplier patch 拒绝。阶段文件写入另由目标 stage 的 `fileWriters` allowlist 约束（`StageFileWriter[]`，由 PlanCommit `fileWritersHash` 承诺）。

## Stage Supplier Patch

Stage supplier patch 在订单上选择或交接目标 stage 的 supplier，以 `previousSupplierId` 区分：`0` 为首次指派（assign，只在目标 stage 首个信号之前），非零为交接（handoff，只在首个信号之后，且需原 assigned supplier account 对同一 EIP-712 digest 签名）。

合约检查 nonce 递增、selector 是 selector stage 的 assigned supplier account、stage-to-target binding，以及候选 supplier 属于 Plan 通过 `supplierBindingsRoot` 承诺的 kind=1 candidate 叶（Merkle proof；fixed 阶段 patch 恒拒，dynamic 阶段免 proof、可指派任意 active supplier，birth/dock 阶段 patch 恒拒）。patch 生效只改 `stage -> supplierId`，不写任何授权集；first-writer-wins 仍然适用，已写入的 Signal 保留原 submitter。事件为 `StageSupplierPatchApplied`。

## Dock Supplier 选择

dock 阶段由 selector 调用 `selectStageDockSupplier`（或携 selector EIP-712 签名的 `selectStageDockSupplierFor`）一次性选定 supplier。合约校验 dock 标记、selector binding、SID active 与 dkid/stage/plan 关系；同 dkid+supplier 重放幂等吸收，换选 revert `StageDockSupplierAlreadySelected`；事件为 `StageDockSupplierSelected`。

## 阶段文件写入

阶段文件写入直接改目标 stage 的 `{key, payload}` 映射，链上只保存 opaque payload。入口在 `submitSignal` 的 `files: StageFile[]`：`signalId == 0` 时是纯文件写入（不带业务信号），否则一笔交易内业务信号与文件写入原子生效；`UVPFileResourceModule.applyStageFiles` 落账，同 key 覆盖，没有 `add/replace/remove`、`baseHash`、`patchHash`、handle 或 nonce。事件只有 `StageFileWritten`，索引器按同一事务内日志序重放。

## 为什么它属于授权体系

Stage patch 会改变订单执行路径与阶段文件引用。两类动作都要求 assigned supplier account 与 EIP-712 签名，Store 或后端无法绕过供应商权限改 supplier 或文件引用；合约和 projection 从同一事件流恢复状态。

supplier patch 机制见 [Stage Supplier Patch](../state-machine/executor-patch.md)，阶段文件写入机制见 [阶段文件映射](../state-machine/file-patch.md)；授权分层总述见 [协议边界](../protocol-boundaries.md)。
