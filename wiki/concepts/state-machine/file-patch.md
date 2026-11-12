---
title: 阶段文件 Patch
type: explanation
audience: 工程贡献者
status: verified
---

# 阶段文件 Patch

阶段文件 patch 是订单级的文件映射改写：某个订单不修改 Plan，只改写目标 stage 的 `fileResources` 映射（`key -> (contentHash, handle)`）。链上保存内容哈希与不透明句柄，业务正文留在对象存储或参与方私有存储。静态资源对象见 [File Resources](../core/file-resources.md)。

## 数据结构与入口

文件映射 owner 是 `UVPFileResourceModule`；核心 `UVPStateMachine` 只经 `fileResourceModule()` 目录调用，模块以 `msg.sender == stateMachine` 作为唯一信任闸。

订单级入口在 direct `submitSignal` 的尾部：

```text
submitSignal(planId, orderId, sourceId, signalId, payloadHash, idempotencyKey,
             attribution, bytes32 filesDigest, FilePatch filePatch)

FilePatch {
  bytes32 targetStageId;
  bytes32 baseHash;        // 必填：该 stage 当前文件版本
  bytes32 writerStageId;   // 0 时按信号所属 stage 解析
  bytes32[] writerProof;   // fileWriters capability 叶成员证明
  FileOp[] ops;            // {kind, key, contentHash, handle}
}
```

- `signalId == 0`：纯文件 patch，不带业务信号，可单独提交；`filesDigest = keccak256(canonicalFilePatch(planId, orderId, filePatch))`。
- `signalId != 0`：一笔交易内先提交业务信号，再在同一事务里应用文件 patch（一个业务信号、一个目标阶段）。
- 一次请求至多一个业务信号与一个目标阶段。

## 键值与 ops

| op | 前置条件 | 结果 |
| --- | --- | --- |
| `add` | key 不存在 | 写入 `key -> (contentHash, handle)` |
| `replace` | key 已存在 | 替换当前值 |
| `remove` | key 已存在 | 删除 key |

- `handle` 是不透明、有界（≤512 字节）的引用；引擎不解析、不落正文、不触达应用存储。
- 链上不定义 `fileType`，也不携带类型/存储语义：文件类型是后端自定义、不可穷举的 freestyle，引擎只提供最小原语。
- `baseHash` 必填，等于签名时该 stage 的文件版本（`filesHash = keccak256(abi.encode(oldHash, patchHash))` rolling）；不一致整笔拒绝。
- 映射恒只有一个当前值；替换用 `replace` / `remove` 表达，没有 nonce；同一 `patchHash` 已应用过按 first-win 吸收，不重复落账。

## 授权

写入方授权来自 stage 级 `fileWriters` allowlist（目标阶段声明哪些阶段可写它的文件；本阶段自身隐式可写，不自引用）。编译期把每对 `(targetStageId, writerStageId)` 折叠成一枚 `UVP_FILE_WRITER_V1` capability 叶进 `capabilitiesRoot`，链上 `UVPPlanMetadataModule.verifyFileWriter` 按成员证明校验。

具体的提交者认证复用 `SignalAuthorization` 表：

- signal + file：使用该业务 signal 的既有授权行；`writerStageId == 0` 解析为信号所属 stage；target 不同则还需通过 target 的 `fileWriters` allowlist。
- 纯文件 patch：使用 writer stage 的保留 `FILE_WRITE_SIGNAL_ID` 授权行。
- static / dynamic executor 都只是该表里的授权行；`activeStageExecutor` 不是文件写权 oracle。

## 事件与回放

- `StageFilePatchApplied`：每笔一次，含 `patchHash` / `baseHash` / `writerStageId` / `opCount`。
- `StageFileOpApplied`：每 op 一次，含 `kind` / `key` / `contentHash` / `handle`。

索引器按同一事务内日志序重放文件映射，不推导；投影可以从这些事件与 `order_stage_record.file_resources` 重建。

## 与业务信号的关系

- 纯文件 patch 是一等 patch 事实：不增业务信号计数、不触发 hook、不跑 admission。
- 文件写入不受“目标 stage 是否已有信号”的时序门约束；该门的适用范围是 executor patch 的 assign/handoff。
- 终态只由本地阶段/订单结束驱动；文件 patch 只改变该 stage 引用的文件句柄。

## 代码入口

| 代码 | 说明 |
| --- | --- |
| `UVPFileResourceModule.sol` | `applyStageFilePatch`、`fileWriters` capability 校验、`StageFilePatchApplied` / `StageFileOpApplied`。 |
| `UVPStateMachine.sol` | `submitSignal` 尾部 `filesDigest` / `FilePatch` 入口；纯文件 patch 的 `signalId == 0` 分支。 |
| `UVPPlanMetadataModule.sol` | `verifyFileWriter` 成员证明校验。 |
| `protocol-bindings/src/index.ts` | file patch typed data / call builder 与签名恢复。 |
| `uvp-chain-services/service/src/` | `/chain/*` 投影与 Product API 读面。 |

相关总览见 [Stage Overlay](stage-overlay.md)，另一类 overlay 见 [Executor Patch](executor-patch.md)。
