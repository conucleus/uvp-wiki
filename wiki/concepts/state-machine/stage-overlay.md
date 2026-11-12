---
title: Stage Overlay：Executor Patch 与阶段文件 Patch
type: explanation
audience: 工程贡献者
status: verified
---

# Stage Overlay：Executor Patch 与阶段文件 Patch

Stage overlay 是订单级 patch：它让某个订单在不修改 Plan 的情况下，为目标 stage 指定新的 executor，或改写该 stage 的文件映射。两类动作都是订单级执行事实，共同保持 Plan 的静态可审计性。各自的合约检查与代码入口见 [Executor Patch](executor-patch.md) 与 [阶段文件 Patch](file-patch.md)。

## Executor Patch

`StageExecutorPatchApplied` / `StageExecutorActivated` 改变单个订单的目标 stage executor，Plan 与 Supplier Directory 保持原样。合约要求：

- 发起 patch 的 stage 与 target stage 之间存在 `StageSelectorBinding`（成员资格由 patch 携带的 bindingProof 验证）。
- patch 的 selector 对内部 `EXECUTOR_PATCH_SIGNAL_ID` 持有订单级授权（order creator 可作为 selector，同样要过 binding 与候选集闸）。
- 目标 executor 必须命中 Plan 在 `commitPlan` 时承诺的 `executorCandidatesRoot`（candidateProof 成员证明；未承诺候选集的 Plan 对所有 executor patch fail-closed）。
- mode 闭集为 `assign` / `handoff`：`assign` 在目标 stage 首个信号之前落窗，`handoff` 在首信号之后并需 previous executor 对同一 digest 的签名。
- nonce 必须递增，旧 patch 不能覆盖新 patch。

patch 激活时，合约把目标 stage 的 Plan 预声明 `(sourceId, signalId)` 能力写成显式订单级授权集（授权集哈希随 selector 签名承诺）。被选择的钱包由此获得可提交范围；patch 不能扩张 Plan 的能力边界。后续 handoff 会把尚未首次写入的同一范围切换给新 executor，已写入的 Signal 保持原样，历史 `SignalSubmitted` 保留原 submitter。

dock 阶段执行者是另一条一次性选择路径：`UVPStagePatchModule.selectStageDockExecutor` 选定 dock 执行者并发出 `StageDockExecutorSelected`，换选由 `StageDockExecutorAlreadySelected` 拒绝；它不是通用 executor patch，详见 [Executor Patch](executor-patch.md) 与 [Dock 与 Binding](docking.md)。

## 阶段文件 Patch

阶段文件映射属于阶段事实，由 `UVPFileResourceModule` 拥有：每个 stage 维护 `key -> (contentHash, handle)`，链上只保存内容哈希与不透明、有界的句柄，不保存正文，也不携带文件类型语义。

订单级改写通过 `submitSignal` 尾部携带的 `FilePatch` 表达：

```text
submitSignal(planId, orderId, sourceId, signalId, payloadHash, idempotencyKey,
             attribution, filesDigest, FilePatch filePatch)

FilePatch {
  bytes32 targetStageId;
  bytes32 baseHash;        // 必填，等于该 stage 当前文件版本
  bytes32 writerStageId;   // 0 时按信号所属 stage 解析
  bytes32[] writerProof;   // fileWriters capability 叶成员证明
  FileOp[] ops;            // add / replace / remove
}
```

- `signalId == 0` 是纯文件 patch：不携带业务信号，单独提交；`filesDigest = keccak256(canonicalFilePatch(planId, orderId, filePatch))`。
- `add` 要求键不存在，`replace` / `remove` 要求键存在；严格前置、整笔原子，任一 op 失败整笔回滚。
- `baseHash` 必填且必须等于签名时该 stage 的文件版本（`filesHash = keccak256(abi.encode(oldHash, patchHash))` rolling）；不一致整笔拒绝。
- 映射恒只有一个当前值，替换用 `replace` / `remove` 表达；`patchHash` 已应用过按 first-win 吸收。

事件：`StageFilePatchApplied`（每笔一次，含 `patchHash` / `baseHash` / `writerStageId` / `opCount`）与 `StageFileOpApplied`（每 op 一次，含 `kind` / `key` / `contentHash` / `handle`）；索引器按同一事务内日志序重放，不推导。授权与完整规则见 [阶段文件 Patch](file-patch.md)。

## 为什么不改 Plan

Plan 是 publisher 签名发布的静态版本。运行时的供应商选择、执行者交接、文件映射改写属于某个订单的执行事实，只落链上订单级记录，Plan 的承诺面保持不变；任何参与者都能从事件回放出这些覆盖的历史。

## 边界

- Executor patch 改变“谁执行”，阶段文件 patch 改变“这个 stage 引用哪份文件”；两者字段与签名 payload 不混用。
- Executor patch 不证明供应商能力；能力与匹配仍是 Store 链下判断，Identity Registry 只解析主体与钱包。
- 阶段文件 patch 不把业务正文写上链；正文由对象存储、metadata URI 与内容哈希承担。
- 两类 patch 都不代表业务完成；业务结果仍看目标 source/signal 的 `SignalSubmitted` 与 hook 状态。
