---
title: Stage Overlay：Supplier Patch 与阶段文件写入
type: explanation
audience: 工程贡献者
status: verified
---

# Stage Overlay：Supplier Patch 与阶段文件写入

Stage overlay 是订单级变更：它让某个订单在不修改 Plan 的情况下，为目标 stage 指定新的 supplier，或写入该 stage 的文件映射。两类动作都是订单级执行事实，共同保持 Plan 的静态可审计性。各自的合约检查与代码入口见 [Stage Supplier Patch](executor-patch.md) 与 [阶段文件写入](file-patch.md)。

## Stage Supplier Patch

`StageSupplierPatchApplied`（首次指派另有 `StageSupplierAssigned`）改变单个订单的目标 stage supplier，Plan 与 Supplier Directory 保持原样。合约要求：

- 发起 patch 的 stage 与 target stage 之间存在 `StageSelectorBinding`（成员资格由 patch 携带的 bindingProof 验证）。
- patch 的 selector 必须是 selector stage 当前生效的 assigned supplier account；没有订单级内部 patch 授权表。
- candidate 阶段的目标 supplier 必须命中 Plan 在 `commitPlan` 时承诺的 `supplierBindingsRoot` 的 kind=1 candidate 叶（candidateProof 成员证明）；fixed 阶段恒拒；dynamic 阶段免 proof、可指派任意 active SID；birth/dock 阶段恒拒。
- 以 `previousSupplierId` 区分：`0` 为 assign（目标 stage 首个信号之前），非零为 handoff（首个信号之后，并需原 assigned supplier account 对同一 digest 的签名）。
- nonce 必须递增，旧 patch 不能覆盖新 patch。

patch 只改 `stage -> supplierId`，不写任何授权集。被选择的 SID 的 supplier account 由此获得该 stage 的提交权；patch 不能扩张 Plan 的能力边界。后续 handoff 会把尚未首次写入的同一阶段切换给新 supplier，已写入的 Signal 保持原样，历史 `SignalSubmitted` 保留原 submitter。

dock 阶段 supplier 是另一条一次性选择路径：`UVPStagePatchModule.selectStageDockSupplier` 选定 dock supplier 并发出 `StageDockSupplierSelected`，换选由 `StageDockSupplierAlreadySelected` 拒绝；它不是通用 stage supplier patch，详见 [Stage Supplier Patch](executor-patch.md) 与 [Dock 与 Binding](docking.md)。

## 阶段文件写入

阶段文件映射属于阶段事实，由 `UVPFileResourceModule` 拥有：每个 stage 维护 `StageFile{string key; bytes payload}`，链上只保存 opaque payload，不保存正文，也不携带文件类型语义。

订单级写入通过 `submitSignal` 的 `files` 字段表达：

```text
submitSignal(
  SignalSubmission {
    ...,
    targetStageId,
    files: StageFile[]   // { string key; bytes payload }
  },
  signature
)
```

- `signalId == 0` 是纯文件写入：不携带业务信号，单独提交。
- 同 key 覆盖；没有 add/replace/remove、`baseHash`、`patchHash`、handle 或 per-key 版本。
- 逐项写入、整笔原子；任一失败整笔回滚。
- 单次最多 16 项，key ≤128 字节，payload ≤4096 字节。

事件：`StageFileWritten`（每次 key 写入一条，含 `key` / `payload` / `submitter`）；索引器按同一事务内日志序重放，不推导。授权与完整规则见 [阶段文件写入](file-patch.md)。

## 为什么不改 Plan

Plan 是 publisher 签名发布的静态版本。运行时的 supplier 选择、交接与文件写入属于某个订单的执行事实，只落链上订单级记录，Plan 的承诺面保持不变；任何参与者都能从事件回放出这些覆盖的历史。

## 边界

- Stage supplier patch 改变“谁承接”，阶段文件写入改变“这个 stage 保存什么 opaque payload”；两者字段与签名 payload 不混用。
- Stage supplier patch 不证明供应商能力；能力与匹配仍是 Store 链下判断，`UVPIdentityRegistry` 只解析 SID、account 与 active 状态。
- 阶段文件写入不把业务正文写上链；正文由对象存储、metadata URI 与内容哈希承担。
- 两类动作都不代表业务完成；业务结果仍看目标 source/signal 的 `SignalSubmitted` 与 hook 状态。
