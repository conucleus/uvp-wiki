---
title: Stage Patch 授权
type: explanation
audience: 工程贡献者
status: verified
---

# Stage Patch 授权

Stage patch 是订单运行时的受控变更动作，分两类：executor patch 在订单上选择或交接目标 stage 的执行者；阶段文件 patch 改写目标 stage 的文件映射。两类都复用订单级授权，Plan 保持静态版本，变更只落在单个 Order 上。

## 内部 Signal

Product 提交流程按动作生成内部订单级授权：

| Action | 内部 signal |
| --- | --- |
| `stage_executor_patch` | `EXECUTOR_PATCH_SIGNAL_ID` |
| 纯阶段文件 patch | `FILE_WRITE_SIGNAL_ID`（writer stage 的保留授权行） |
| 随业务 signal 的文件 patch | 复用该业务 signal 的授权行 |

source 通常取发起 patch 的 stage：

```text
sourceId = keccak256(stageId)
```

建单时可通过 `SignalAuthorization[]` 写入这些行；executor patch 的 selector 必须是订单创建者，或持有 `(selectorStageId, EXECUTOR_PATCH_SIGNAL_ID)` 的订单级授权。

## Stage-to-target Binding

两个 stage 之间的变更关系由 Plan 冻结的 stage-to-target binding 约束：

```text
selectorStageId -> targetStageId
```

合约用 `UVPPlanMetadataModule.verifyStageSelectorBinding` 按 `capabilitiesRoot` 成员证明校验该关系；未声明绑定的 executor patch 拒绝。阶段文件写入另由目标 stage 的 `fileWriters` allowlist 约束（`UVP_FILE_WRITER_V1` capability 叶）。

## Executor Patch

Executor patch 在订单上选择或交接目标 stage 的执行者，mode 闭集为 `assign` / `handoff`：`assign` 在目标 stage 首个信号之前落窗，`handoff` 在首个信号之后并需前一执行者对同一 EIP-712 digest 的签名。

合约检查 nonce 递增、订单级授权、stage-to-target binding，以及候选执行者属于 Plan 通过 `executorCandidatesRoot` 承诺的候选集（`candidateProof` 成员证明；未承诺候选集的 Plan 对所有 executor patch fail-closed）。patch 的 EIP-712 签名携带 `authorizationsHash`，生效时合约把新执行者对 Plan 预声明 current-order `(sourceId, signalId)` 的授权集写成订单级显式授权；执行者无需在 Order 创建时已列入授权表，但 patch 不能赋予 Plan 未声明的 signal 权限。first-writer-wins 仍然适用，已写入的 Signal 保留原 submitter。

## 阶段文件 Patch

阶段文件 patch 改写目标 stage 的 `fileResources` 映射（`key -> (contentHash, handle)`），链上只保存内容哈希与不透明句柄。入口在 `submitSignal` 尾部：`signalId == 0` 时是纯文件 patch（不带业务信号），否则一笔交易内先提交业务信号再应用 patch；文件写入由 `UVPFileResourceModule.applyStageFilePatch` 落账，ops 为 `add` / `replace` / `remove`，`baseHash` 必填（等于该 stage 当前文件版本），整笔原子、任一失败回滚，没有 nonce。事件 `StageFilePatchApplied` / `StageFileOpApplied`，索引器按同一事务内日志序重放。

写入方授权来自 stage 级 `fileWriters` allowlist 与 `SignalAuthorization` 表的组合：signal + file 用业务 signal 的既有授权行（`writerStageId == 0` 解析为信号所属 stage），纯文件 patch 用 writer stage 的 `FILE_WRITE_SIGNAL_ID` 行。

## 为什么它属于授权体系

Stage patch 会改变订单执行路径与阶段文件引用。两类 patch 都要求订单级授权与 EIP-712 签名，Store 或后端无法绕过参与者权限改执行者或文件引用；合约和 projection 从同一事件流恢复状态。

executor patch 机制见 [Executor Patch](../state-machine/executor-patch.md)，阶段文件 patch 机制见 [阶段文件 Patch](../state-machine/file-patch.md)；授权分层总述见 [协议边界](../protocol-boundaries.md)。
