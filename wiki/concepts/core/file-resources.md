---
title: File Resources
type: explanation
audience: 协议读者
preread: ../README.md
status: verified
---

# File Resources

> 前置阅读：[核心概念](../README.md)
`fileResources` 是阶段资源声明。它描述一个 stage 需要引用哪些链下对象、协议文件、证据模板、验收标准或资源清单。DSL 侧它是静态声明；运行期对某个订单、某个阶段的文件映射写入是订单级事实，由文件模块承载。链上事实来自授权 signal、内容哈希、不透明 payload 和事件；文件明文留在链下。

## 谁使用

凝结核在 stage 上声明 fileResources；Store/Product API 用它展示协议与证据要求；Order App 和 uvp-client 把它翻译成上传与校验流程；operator 与 assigned supplier 在订单级文件写入时使用同样的 opaque payload 模型。

## 产生什么结果

静态声明进入编译产物的 stage 路由元数据，供 Product API、uvp-client 等读面展示协议与证据要求；运行期写入把目标 stage 的文件映射写成 `StageFile{string key; bytes payload}`，同 key 覆盖，产生 `StageFileWritten` 事件。业务是否完成仍看授权 signal 与 proof，不看文件本身。

## 权威来自哪里

资源是否满足要求最终由授权 signal 和 proof 决定，不由文件本身决定；链上只保存 opaque `{key, payload}` 与写入事件，明文永远留在链下。

当前 compiler 的 TS 壳层把它定义成宽松句柄：

```ts
interface FileResourceLike {
  readonly fileType: string;
  readonly [key: string]: unknown;
}
```

`fileType` 只要求非空字符串，**值域开放**：uvp-core 与链轨 TS 编译器都不做类型分派、不维护闭集，条目其余键是应用自定义 opaque payload，原样保留。`fileResources` 的第一责任是“应用可解释的资源引用”；存储后端与文件类型由应用层决定。

## 资源声明

一个 stage 可以用 `fileResources` 指向链下协议文件、证据模板或对象存储资源，并带上应用自定义的校验信息：

```yaml
fileResources:
  stage_protocol:
    fileType: app_protocol_ref
    locator: "https://example.com/protocols/payment-settlement-v1.json"
  evidence_bucket:
    fileType: app_object_ref
    bucket: "evidence-bucket"
    region: "ap-guangzhou"
    objectKey: "protocols/payment-settlement-v1.json"
```

这些键由应用解释：Store、Product API、uvp-client 或 adapter 可以显示协议、计算 hash、提示证据要求、检查验收规则。链上保存 opaque payload 与阶段文件写入事件。

## fileType 的含义

`fileType` 是应用自定义的句柄类型，唯一协议约束是非空字符串：

| 取值 | 语义 |
| --- | --- |
| 任意非空字符串 | 应用层解释；core 不读取、不校验 type-specific 字段、不做类型分派。 |

不存在协议内置的 `local` / `http` / `txcloud` / `plain_text` 闭集；它们只是某些应用或云侧 resolver 的本地约定，不是 DSL 接受域。合同、发票、物流单据、照片、报告、车况证据都不应明文上链；需要可验证引用时，用 opaque payload 加内容 hash、或链上仅存哈希与 metadata URI 的方式表达。

## 阶段文件映射

运行期的文件映射是订单级事实，owner 是 `UVPFileResourceModule`（`UVPStateMachine` 只经 `fileResourceModule()` 目录调用，模块以 `msg.sender == stateMachine` 为唯一信任闸）。每个 stage 的映射是：

```text
key -> payload
```

- `StageFile` 是 `{string key; bytes payload}`；key ≤128 字节、payload ≤4096 字节、单次 ≤16 项。
- 引擎不解析 key/payload、不落正文、不触达应用存储。
- 同 key 再写即覆盖；没有 `add` / `replace` / `remove` 状态机、没有 `baseHash` 滚动哈希、没有 `patchHash`、没有 handle 或 per-key 版本号。
- 写入是整笔原子的：任一文件项失败整笔回滚。

写入授权来自 stage 级 `fileWriters` allowlist（目标阶段声明哪些阶段可写它的文件；本阶段自身隐式可写、不自引用），写权复用 target/writer 阶段当前 assigned supplier account，详见 [阶段文件映射](../state-machine/file-patch.md)。文件写入通过 direct `submitSignal` 的 `files: StageFile[]`；纯文件写入用 `signalId == 0`，它不是业务信号，不增业务信号计数、不触发 hook、不跑适格，也不受“目标 stage 是否已有信号”的 stage supplier patch 时序门约束。

## Store 和 Product 展示边界

Store 可以把资源声明组织成：

- stage protocol、evidence requirement、acceptance criteria；
- manifest hash、metadata URI、content hash；
- 是否缺资源、资源是否过期、是否需要 operator 审核。

Order App 和 uvp-client 把它翻译成“需要上传什么证据、hash 是什么、proof 在哪里”。普通参与者界面不展示 bucket secret、storage credential、presigned URL 或内部对象路径。

## 不允许的用法

贡献者安全规范见 ../../meta/documentation-rules.md。

- 合同、发票、物流文件、照片或报告明文上链。
- `fileResources` 表示资源要求，业务完成看 signal/proof。
- 对象存储可访问性是辅助条件，链上 proof 看事件和 hash。
- 阶段文件写入和 stage supplier patch 是两个独立的订单级动作，各自过各自的授权面。

## 相关页面

- [阶段文件映射](../state-machine/file-patch.md)
- [Evidence、Proof 与 File Resource](../services/evidence-proof.md)
- [产物与哈希](../artifacts-and-hashes.md)
- [Stage Overlay](../state-machine/stage-overlay.md)
