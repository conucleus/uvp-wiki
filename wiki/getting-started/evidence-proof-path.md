# 证据与 Proof 路径

UVP 不把合同、发票、物流文件、照片或私有业务文件明文放到链上。它记录的是授权声明、证据指纹、metadata 引用、签名和链事件。

## 路径

```text
business file 或 private record
  -> evidence metadata
  -> payloadHash / metadataURI
  -> participant EIP-712 signature
  -> submitSignal / submitSignalFor
  -> SignalSubmitted event
  -> Product proof row
```

## 每一步是什么意思

| 步骤 | 含义 | 权威边界 |
| --- | --- | --- |
| Business file 或 private record | 合同、发票、报关文件、照片、报告或内部系统记录。 | 留在链下；访问策略属于业务系统或存储层。 |
| Evidence metadata | Product 或 adapter 记录的证据信息、hash、object handle、visibility。 | workflow/read-model 数据；本身不代表业务完成。 |
| `payloadHash` | 提交的业务 payload 或 evidence bundle 的指纹。 | 被签名并提交到链上；用于之后校验。 |
| `metadataURI` | 指向链下 metadata、manifest 或 storage reference 的指针。 | 是引用，不是协议事实本身。 |
| EIP-712 signature | 授权钱包签出的结构化声明。 | 证明业务 actor，不证明 relayer。 |
| `SignalSubmitted` | state machine 接受 `(orderId, sourceId, signalId)` 对应 signal 的事件。 | 链事件；同一个 order 和 signal key first writer wins。 |
| Product proof row | 用户可读的事件投影，包含 tx、block、log、contract、chain id 和 payload 字段。 | 可从链事件重建。 |

## File Resources 放在哪里

`fileResources` 描述某个阶段需要什么：模板、协议、resource manifest、证据要求或验收标准。它是 handle 和 requirement，不是业务动作完成的 proof。完成由授权 signal 和对应事件 proof 表示。

## 常见错误

- 上传文件不等于完成任务，直到授权 signal 被提交。
- Store note、通知送达、operator review 是 workflow record，不是 `SignalSubmitted`。
- relayer 交易不证明业务同意，除非参与者签名有效。
- Product proof row 缺失时，先看 indexer sync status，不要直接假设链事件不存在。
