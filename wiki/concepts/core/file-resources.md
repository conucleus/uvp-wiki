# File Resources

`fileResources` 是阶段资源句柄。它描述一个 stage 需要引用哪些链下对象、协议文件、证据模板、验收标准或资源 manifest。链上事实来自授权 signal、hash、metadata URI 和事件；文件明文留在链下。

当前 compiler 类型把它定义成宽松句柄：

```ts
interface FileResourceLike {
  readonly fileType: string;
  readonly [key: string]: unknown;
}
```

这说明 `fileResources` 的第一责任是“可解析的资源引用”。具体存储后端可以是对象存储、外部 URI、内容寻址存储或后续 manifest。

## 资源句柄

一个 stage 可以用 `fileResources` 指向链下协议文件、证据模板或资源
manifest：

```yaml
fileResources:
  stage_protocol:
    fileType: manifest
    resourceRole: stage_protocol
    resourceType: document
    mediaType: application/json
    manifest:
      manifestURI: "urn:uvp:resource-manifest:payment-settlement:v1"
      manifestHash: "0x3002..."
      policyHash: "0x7120..."
      visibility: protected
      accessPolicy: buyer_supplier_executor
```

这个 YAML 给 Store、Product API、executor-kit 或 adapter 一个资源句柄：可以显示协议、计算 hash、提示证据要求、检查验收规则。链上保存 hash、URI 或 patch event。

## fileType 的含义

`fileType` 表示句柄类型。常见形态可以包括：

| fileType | 语义 |
| --- | --- |
| `manifest` | 指向规范化资源 manifest，适合生产资源包。 |
| `uri` | 指向可解析的 metadata URI，并配合 hash 校验。 |
| `ipfs` / `arweave` | 内容寻址存储句柄。 |
| `object_storage` | 链下对象存储句柄；生产环境不应暴露明文 bucket key 或凭证。 |
| `onchain` | 少量可公开资源直接链上存储或链上可读引用，成本高但可行。 |

有钱或强可验证需求的用户可以选择把极小资源直接链上存储；大多数合同、发票、物流单据、照片、报告、车况证据都不应明文上链，应使用内容 hash、加密对象、metadata URI 或资源 manifest。

## 和 StageResourcePatch 的关系

静态 `fileResources` 来自秩序 stage，是 Plan 编译时的默认资源说明。运行中如果某个订单、某个 stage 需要替换或补充资源，应使用 resource overlay，Plan 仍保持静态版本。

PRD87 里的目标模型是：

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

- 合同、发票、物流文件、照片或报告明文上链。
- `fileResources` 表示资源要求，业务完成看 signal/proof。
- 对象存储可访问性是辅助条件，链上 proof 看事件和 hash。
- resource patch 和 executor patch 是两个授权动作。
- 不在 wiki、fixtures 或日志里写真实 storage credential。
