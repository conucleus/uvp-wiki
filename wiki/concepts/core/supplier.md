# Supplier

Supplier 是能力主体。它可以是个人、公司、报关行、物流商、支付 adapter、担保方、AI 服务、MCP agent、企业系统，也可以是一条可对接的秩序 (Zhixu)。Supplier 说明“谁具备某类能力”。凝结核负责设计秩序；executor 负责当前订单、当前阶段的实际提交；supplier 提供能力和 trust subject。

## Supplier 从哪里来

在产品路径里，supplier 通常先被凝结核组织进某条秩序的供应商网络，再进入秩序商店的 supplier registry。Store 作为平台工作台，维护 supplier profile、平台能力标签、支持的 role/stage、钱包、审核状态、联系信息和 metadata。trust registry 再通过 `ZhixuTrustRegistry.SupplierAttested` 给 supplier subject 做链上背书。

最小关系：

```text
Store supplier metadata
  + Nucleus supplier requirements
  + ZhixuTrustRegistry.SupplierAttested
  + Product projection
  -> Supplier capability passport
```

标签要分层：凝结核可以把 supplier 标成某条秩序内部的 role/stage 候选；Store 可以用平台目录标签标注 customs / logistics / inspection / payment 等能力；trust registry 可以对 supplier subject 做外部背书。去中心化部分负责保存背书事件、撤销事件、订单授权和 signal proof。

## SupplierDefinition

编译器类型里有 `SupplierDefinition`：

```text
apiVersion: uvp/v0
kind: Supplier
metadata
spec
  supplierType
  realIdType
  realId
  supplierName
  handlerName
  authorityID
  capabilityClaims
  attestationRefs
  status
  SupplierHandlerConfig
```

这个定义描述 supplier 身份和能力声明。订单提交权限由 `SignalSubmitterAuthorized` 和 active executor overlay 决定。

## Capability Tags

Product DTO 里当前支持的 supplier capability tags 包括：

| Tag | 说明 |
| --- | --- |
| `logistics` | 物流履约能力。 |
| `customs` | 报关/清关能力。 |
| `inspection` | 检验、验收、质检能力。 |
| `payment` | 支付或结算 adapter 能力。 |
| `dispute-review` | 争议审查能力。 |
| `document-verification` | 单证校验能力。 |

这些标签帮助 Store 和 Product API 推荐或校验执行网络，但标签本身不创建链上权限。

如果标签来自凝结核，它表示“在这条秩序的内部设计中适合某个 role/stage”。如果标签来自 Store，它表示平台目录和搜索语义。trust-domain 背书由 `SupplierAttested` 单独表达。

## Supplier Trust

`SupplierAttested` 表示某个 trust registry 认可某个 supplier subject。`SupplierRevoked` 表示撤销。Product BFF 在创建未来订单授权时会拒绝或警告 revoked supplier wallet。

这层 trust 解决“这个主体是否被某个权威背书”。当前订单能否提交当前 signal，由订单级授权解决。

## Supplier 和 Executor 的区别

| 概念 | 解释 |
| --- | --- |
| Supplier | 能力主体和身份层，通常由凝结核组织，并在 Store 中维护 profile、平台标签和背书材料。 |
| Executor | 某个订单某个 stage 上实际被绑定的钱包或执行者。 |

一个 supplier 可以在不同订单里派出不同 executor 钱包；一个 executor 钱包也可能代表某个 supplier subject。文档和 UI 必须把“供应商可信度”和“订单提交权限”分开讲。

## Zhixu 作为 Supplier

当 `supplierType=zhixu` 时，Supplier 表示一条可被其他秩序调用的 peer 秩序能力。它仍然是 trust subject，履约方式是启动或对接另一条可执行秩序。

这类 supplier 在 Store 里应展示：

- peer Zhixu 的 active plan 和 plan trust；
- 支持的 `signalMap`；
- 可用的 operator/contact/adapter；
- 历史 docking proof；
- linked order 创建或定位规则；
- `DockedOrderLinked`、`DockedSignalMapped`、`DockedSignalSubmitted` proof。

local order 要继续推进，必须出现 local order 上的授权 signal 或 docking mapped signal。详见 [Executor](executor.md) 和 [Zhixu 作为 Executor](../../execution/zhixu-as-executor.md)。
