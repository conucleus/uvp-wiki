---
title: 阶段文件写入
type: explanation
audience: 工程贡献者
status: verified
---

# 阶段文件写入

阶段文件写入是订单级的文件映射变更：某个订单不修改 Plan，只写目标 stage 的 `{key, payload}` 映射。链上保存 opaque payload，业务正文留在对象存储或参与方私有存储。静态资源声明见 [File Resources](../core/file-resources.md)。

## 数据结构与入口

文件映射 owner 是 `UVPFileResourceModule`；核心 `UVPStateMachine` 只经 `fileResourceModule()` 目录调用，模块以 `msg.sender == stateMachine` 作为唯一信任闸。

订单级入口是 direct `submitSignal` 的 `files` 字段：

```text
submitSignal(
  SignalSubmission {
    ...,
    targetStageId,
    files: StageFile[]   // StageFile { string key; bytes payload }
  },
  signature
)
```

- `signalId == 0`：纯文件写入，不带业务信号，可单独提交。
- `signalId != 0`：一笔交易内先提交业务信号，再在同一事务里应用文件写入（一个业务信号、一个目标阶段）。
- 单次最多 16 个文件项；key ≤128 字节、payload ≤4096 字节。

## 键值与覆盖

```text
key -> payload
```

- `payload` 是不透明、有界（≤4096 字节）的字节串；引擎不解析、不落正文、不触达应用存储。
- 链上不定义 `fileType`，也不携带类型/存储语义：文件类型是应用自定义、不可穷举的开放字符串，引擎只提供最小原语。
- 同 key 再写即覆盖；没有 `add` / `replace` / `remove` 状态机、没有 `baseHash` 滚动哈希、没有 `patchHash`、没有 handle 或 per-key 版本号。
- 一次写入内逐项生效；任一失败整笔回滚。

## 授权

写入方授权来自 stage 级 `fileWriters` allowlist（目标阶段声明哪些阶段可写它的文件；本阶段自身隐式可写，不自引用）。`fileWriters` 不生成 capability 叶：编译器把每对 `(targetStageId, writerStageId)` 编为 `StageFileWriter[]`，由 PlanCommit 的 `fileWritersHash` 单独签名承诺。

具体提交者认证按 assigned supplier account 解析：

- signal + file：submitter 是该业务 signal 所属 source/stage 的 assigned supplier account；target 不同则还需 target 的 `fileWriters` allowlist 含该 writer stage。
- 纯文件写入：submitter 是 target 阶段或 `fileWriters` 声明的 writer 阶段的 assigned supplier account。
- 所有 SID 必须 `active`；static / dynamic / dock 都按同一 `accountOf(effective supplier)` 解析。

## 事件与回放

- `StageFileWritten`：每次 key 写入一条，含 `key` / `payload` / `submitter`。

索引器按同一事务内日志序重放文件映射，不推导；投影可以从这些事件与订单事实重建。

## 与业务信号的关系

- 纯文件写入是一等事实：不增业务信号计数、不触发 hook、不跑 admission。
- 文件写入不受“目标 stage 是否已有信号”的 stage supplier patch 时序门约束。
- 终态只由本地阶段/订单结束驱动；文件写入只改变该 stage 的 opaque payload。

## 代码入口

| 代码 | 说明 |
| --- | --- |
| `UVPFileResourceModule.sol` | `applyStageFiles`、`getStageFile`、`StageFileWritten`。 |
| `UVPStateMachine.sol` | `submitSignal` 的 `files` 入口；纯文件写入的 `signalId == 0` 分支与 `isAuthorizedFileWriter` 校验。 |
| `protocol-bindings/src/index.ts` | `StageFile` typed data / call builder 与签名恢复。 |
| `uvp-chain-services/service/src/` | `/chain/*` 投影与 Product API 读面。 |

相关总览见 [Stage Overlay](stage-overlay.md)，另一类 overlay 见 [Stage Supplier Patch](executor-patch.md)。
