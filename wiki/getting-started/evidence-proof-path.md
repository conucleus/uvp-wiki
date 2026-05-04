# 证据与 Proof 路径

光伏跨境项目会产生大量业务文件：设计确认书、设备规格、采购合同、出厂报告、装箱单、报关材料、到港/清关凭证、仓储签收、现场交付照片、安装记录、O&M 报告。UVP 记录这些材料对应的授权声明、证据指纹、metadata 引用、签名和链事件。

## 主路径

```text
business file 或 private record
  -> evidence metadata
  -> payloadHash / metadataURI
  -> participant signature
  -> submitSignal / submitSignalFor
  -> SignalSubmitted
  -> Product proof row
```

## 用光伏项目看每一步

| 步骤 | 光伏项目例子 | 权威边界 |
| --- | --- | --- |
| Business file 或 private record | 采购合同、设备规格、出厂报告、装箱单、报关单、清关凭证、仓储签收、现场交付照片、O&M 报告。 | 留在链下；访问策略属于业务系统、对象存储或企业档案系统。 |
| Evidence metadata | Product 或 adapter 记录文件类型、hash、object handle、visibility、所属 Order/stage/signal。 | workflow/read-model 数据；用于组织证据和生成提交 payload。 |
| `payloadHash` | 某次提交的业务 payload 或 evidence bundle 指纹，例如“清关完成 + 报关材料 hash”。 | 被参与者签名并提交；后续可以用原材料重新计算校验。 |
| `metadataURI` | 指向链下 metadata、manifest 或 storage reference 的引用。 | 链上保存引用；私有文件访问仍由链下系统控制。 |
| participant signature | OEM、物流商、EPC、业主、O&M 或 trust domain 用授权钱包签名。 | 证明哪个业务主体愿意为该声明负责。 |
| `SignalSubmitted` | state machine 接受这个 Order 的某个 source/signal。 | 链事件；同一个 order 和 signal key first writer wins。 |
| Product proof row | 用户可读的证明行，展示 tx、block、log、contract、chain id、event、submitter、payload hash 和 metadata URI。 | 可从链事件重建，用于 Store、Order App 和 executor-kit 展示。 |

## fileResources 放在哪里

`fileResources` 描述阶段开始前就约定好的材料要求，例如：

- OEM 出厂阶段需要设备规格、质检报告、装箱单。
- 报关阶段需要发票、装箱单、报关资料、到港信息。
- 现场交付阶段需要仓储出库、到场照片、签收记录。
- O&M 阶段需要巡检报告、故障响应记录、维护完成记录。

它们是阶段要求和材料句柄。业务动作完成由授权 signal 和对应链事件 proof 表示。

## 常见判断

| 情况 | 正确读法 |
| --- | --- |
| 文件已经上传 | 证据材料已准备；任务完成还要看授权 signal。 |
| Store operator 做了 review | workflow 已推进；协议事实看 registry 或 state-machine event。 |
| relayer 广播了交易 | 交易已提交；业务责任看 participant signature。 |
| Product proof row 暂时缺失 | 先查 indexer sync status 和事件 provenance。 |
| 链下材料需要保密 | 链上只保留 hash、URI、签名和事件；明文访问留给业务系统控制。 |
