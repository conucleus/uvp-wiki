---
title: File Resources
type: explanation
audience: 协议读者
preread: ../README.md
status: verified
---

# File Resources

> 前置阅读：[核心概念](../README.md)
`fileResources` 是阶段资源句柄。它描述一个 stage 需要引用哪些链下对象、协议文件、证据模板、验收标准或资源 manifest。链上事实来自授权 signal、hash、metadata URI 和事件；文件明文留在链下。

## 谁使用

凝结核在 stage 上声明 fileResources；Store/Product API 用它展示协议与证据要求；Order App 和 executor-kit 把它翻译成上传与校验流程；operator 在 resource patch 时使用同样的句柄模型。

## 产生什么结果

静态声明进入 Plan 的资源说明；运行时替换或补充通过 resource overlay（`StageResourcePatchApplied`）表达，产生 manifest hash、visibility 和加密对象引用等可验证句柄。

## 权威来自哪里

资源是否满足要求最终由授权 signal 和 proof 决定，不由文件本身决定；链上只保存 hash、URI 或 patch 事件，明文永远留在链下。

当前 compiler 的 TS 壳层把它定义成宽松句柄：

```ts
interface FileResourceLike {
  readonly fileType: string;
  readonly [key: string]: unknown;
}
```

这个宽松接口只是壳层形状，**不是语义开放承诺**：`fileType` 的闭集校验权威落在 Go 云侧编译入口（`v0.IsValidFileResourceType`，/compile、/validate、订单级资源 patch 与 /signal 四条入口共用同一集合）与 TS 链轨预检（`FILE_TYPES` 同集）；Rust `uvp-core` 把 `file_resources` 作为不透明 JSON 值透传，不做 fileType 语义校验。合法取值是闭集 `local` / `http` / `txcloud` / `plain_text`（见下表），闭集之外的自造取值在编译期被拒绝。`fileResources` 的第一责任是"可解析的资源引用"——存储后端由句柄类型决定，DSL 不提供任意的存储后端扩展点。

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

这个 YAML 给 Store、Product API、executor-kit 或 adapter 一个资源句柄：可以显示协议、计算 hash、提示证据要求、检查验收规则。链上保存 hash、URI 或 patch event。

## fileType 的含义

`fileType` 是句柄类型，合法取值是 DSL 闭集（Go 云侧编译入口与 TS 链轨预检按同一集合在编译期拒绝闭集外取值）：

| fileType | 语义 |
| --- | --- |
| `local` | 本地文件路径句柄（`localFile.path`），适合 fixture 与开发样例。 |
| `http` | HTTP/HTTPS 文件 URL 句柄（`httpFile.url`）。 |
| `txcloud` | 链下对象存储（腾讯云 COS）句柄（`txCloudFile` 的 bucket/region/objectKey）；生产环境不应暴露明文凭证。 |
| `plain_text` | 内联明文（base64），仅作本地 fixture 或开发样例，不用作生产证据承载。 |

不存在 `manifest` / `uri` / `ipfs` / `arweave` / `object_storage` / `onchain` 等 fileType——也不存在"把资源直接链上存储"的 DSL 句柄。合同、发票、物流单据、照片、报告、车况证据都不应明文上链；需要可验证引用时，用句柄加内容 hash、或链上仅存哈希与 metadata URI 的方式表达。

## 和 StageResourcePatch 的关系

静态 `fileResources` 来自秩序 stage，是 Plan 编译时的默认资源说明。运行中如果某个订单、某个 stage 需要替换或补充资源，应使用 resource overlay，Plan 仍保持静态版本。

资源 overlay 的目标模型是：

```text
StageResourcePatch
  -> ResourceManifestV1
  -> manifestHash / manifestURI / policyHash
  -> public | protected | private visibility
  -> encrypted object storage or content-addressed blob
```

这意味着资源更新和 executor 更新是两条独立 overlay。资源句柄可以变，但业务状态仍由 `UVPStateMachine` 事件和可重放 projection 决定。

## Store 和 Product 展示边界

Store 可以把资源句柄组织成：

- stage protocol、evidence requirement、acceptance criteria；
- resource visibility、reader/writer/controller policy；
- manifest hash、metadata URI、content hash、ciphertext hash；
- 是否缺资源、资源是否过期、是否需要 operator 审核。

Order App 和 executor-kit 把它翻译成“需要上传什么证据、hash 是什么、proof 在哪里”。普通参与者界面不展示 bucket secret、storage credential、presigned URL 或内部对象路径。

## 不允许的用法

贡献者安全规范见 ../../meta/documentation-rules.md。

- 合同、发票、物流文件、照片或报告明文上链。
- `fileResources` 表示资源要求，业务完成看 signal/proof。
- 对象存储可访问性是辅助条件，链上 proof 看事件和 hash。
- resource patch 和 executor patch 是两个授权动作。

## 相关页面

- [Evidence、Proof 与 File Resource](../services/evidence-proof.md)
- [产物与哈希](../artifacts-and-hashes.md)
- [Stage Overlay](../state-machine/stage-overlay.md)
