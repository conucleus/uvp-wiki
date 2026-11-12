---
title: File Resources
type: explanation
audience: 协议读者
preread: ../README.md
status: verified
---

# File Resources

> 前置阅读：[核心概念](../README.md)
`fileResources` 是阶段资源句柄。它描述一个 stage 需要引用哪些链下对象、协议文件、证据模板、验收标准或资源清单。DSL 侧它是静态声明；运行期对某个订单、某个阶段的文件映射改写是订单级事实，由文件模块承载。链上事实来自授权 signal、内容哈希、不透明句柄和事件；文件明文留在链下。

## 谁使用

凝结核在 stage 上声明 fileResources；Store/Product API 用它展示协议与证据要求；Order App 和 uvp-client 把它翻译成上传与校验流程；operator 与 executor 在订单级阶段文件 patch 时使用同样的句柄模型。

## 产生什么结果

静态声明进入编译产物的 stage 路由元数据，供 Product API、uvp-client 等读面展示协议与证据要求；运行期改写是阶段文件 patch——订单在自有上下文里把目标 stage 的文件映射（`key -> (contentHash, handle)`）按严格 ops 原子改写，产生 `StageFilePatchApplied` / `StageFileOpApplied` 事件。业务是否完成仍看授权 signal 与 proof，不看文件本身。

## 权威来自哪里

资源是否满足要求最终由授权 signal 和 proof 决定，不由文件本身决定；链上只保存内容哈希、不透明句柄与 patch 事件，明文永远留在链下。

当前 compiler 的 TS 壳层把它定义成宽松句柄：

```ts
interface FileResourceLike {
  readonly fileType: string;
  readonly [key: string]: unknown;
}
```

这个宽松接口只是壳层形状，**不是语义开放承诺**：`fileType` 的闭集校验权威落在 Go 云侧编译入口（`v0.IsValidFileResourceType`，/compile、/validate 与 /signal 入口共用同一集合）与 TS 链轨预检（`FILE_TYPES` 同集）；Rust `uvp-core` 把 `file_resources` 作为不透明 JSON 值透传，不做 fileType 语义校验。合法取值是闭集 `local` / `http` / `txcloud` / `plain_text`（见下表），闭集之外的自造取值在编译期被拒绝。`fileResources` 的第一责任是“可解析的资源引用”——存储后端由句柄类型决定，DSL 不提供任意的存储后端扩展点。

## 资源句柄

一个 stage 可以用 `fileResources` 指向链下协议文件、证据模板或对象存储资源，并带上校验信息：

```yaml
fileResources:
  stage_protocol:
    fileType: http
    httpFile:
      url: "https://example.com/protocols/payment-settlement-v1.json"
  evidence_bucket:
    fileType: txcloud
    txCloudFile:
      bucket: "evidence-bucket"
      region: "ap-guangzhou"
      objectKey: "protocols/payment-settlement-v1.json"
```

这个 YAML 给 Store、Product API、uvp-client 或 adapter 一个资源句柄：可以显示协议、计算 hash、提示证据要求、检查验收规则。链上保存内容哈希、不透明句柄与阶段文件 patch 事件。

## fileType 的含义

`fileType` 是句柄类型，合法取值是 DSL 闭集（Go 云侧编译入口与 TS 链轨预检按同一集合在编译期拒绝闭集外取值）：

| fileType | 语义 |
| --- | --- |
| `local` | 本地文件路径句柄（`localFile.path`），适合 fixture 与开发样例。 |
| `http` | HTTP/HTTPS 文件 URL 句柄（`httpFile.url`）。 |
| `txcloud` | 链下对象存储（腾讯云 COS）句柄（`txCloudFile` 的 bucket/region/objectKey）；生产环境不应暴露明文凭证。 |
| `plain_text` | 内联明文（base64），仅作本地 fixture 或开发样例，不用作生产证据承载。 |

不存在 `manifest` / `uri` / `ipfs` / `arweave` / `object_storage` / `onchain` 等 fileType——也不存在“把资源直接链上存储”的 DSL 句柄。合同、发票、物流单据、照片、报告、车况证据都不应明文上链；需要可验证引用时，用句柄加内容 hash、或链上仅存哈希与 metadata URI 的方式表达。

## 阶段文件映射

运行期的文件映射是订单级事实，owner 是 `UVPFileResourceModule`（`UVPStateMachine` 只经 `fileResourceModule()` 目录调用，模块以 `msg.sender == stateMachine` 为唯一信任闸）。每个 stage 的映射是：

```text
key -> (contentHash, handle)
```

- `handle` 是不透明、有界（≤512 字节）的引用；引擎不解析、不落正文、不触达应用存储。
- 链上不定义 `fileType`，也不携带类型/存储语义：文件类型是后端自定义、不可穷举的 freestyle，引擎只提供最小原语。
- 写入是严格前置、整笔原子的 `add` / `replace` / `remove`：`add` 要求键不存在，`replace`/`remove` 要求键存在；任一失败整笔回滚。
- `baseHash` 必填，等于签名时该 stage 的当前文件版本（`filesHash = keccak256(abi.encode(oldHash, patchHash))` rolling）；不一致整笔拒绝。映射恒只有一个当前值，替换用 `replace`/`remove` 表达，没有 nonce；同一 `patchHash` 已应用过按 first-win 吸收。

写入授权来自 stage 级 `fileWriters` allowlist（目标阶段声明哪些阶段可写它的文件；本阶段自身隐式可写、不自引用）与既有 `SignalAuthorization` 表，详见 [阶段文件 Patch](../state-machine/file-patch.md)。文件 patch 通过 direct `submitSignal` 尾部携带 `bytes32 filesDigest` 与 `FilePatch`；纯文件 patch 用 `signalId == 0`，它不是业务信号，不增业务信号计数、不触发 hook、不跑适格，也不受“目标 stage 是否已有信号”的 executor patch 时序门约束。

## Store 和 Product 展示边界

Store 可以把资源句柄组织成：

- stage protocol、evidence requirement、acceptance criteria；
- manifest hash、metadata URI、content hash；
- 是否缺资源、资源是否过期、是否需要 operator 审核。

Order App 和 uvp-client 把它翻译成“需要上传什么证据、hash 是什么、proof 在哪里”。普通参与者界面不展示 bucket secret、storage credential、presigned URL 或内部对象路径。

## 不允许的用法

贡献者安全规范见 ../../meta/documentation-rules.md。

- 合同、发票、物流文件、照片或报告明文上链。
- `fileResources` 表示资源要求，业务完成看 signal/proof。
- 对象存储可访问性是辅助条件，链上 proof 看事件和 hash。
- 阶段文件 patch 和 executor patch 是两个独立的订单级动作，各自过各自的授权面。

## 相关页面

- [阶段文件 Patch](../state-machine/file-patch.md)
- [Evidence、Proof 与 File Resource](../services/evidence-proof.md)
- [产物与哈希](../artifacts-and-hashes.md)
- [Stage Overlay](../state-machine/stage-overlay.md)
