# Trust Registry

在协议 v0.5/v0.2 里，一个 registry 地址就是一个信任边界。
`UVPStateMachine` 不保存 registry 地址，不在 `registerPlan()` 时查询
registry，也不会因为 registry 后续 revoke 而让订单运行时回滚。

`ZhixuTrustRegistry` 是 owner-based：

```solidity
owner() -> address
transferOwnership(address newOwner)
attestPlan(planId, planHash, artifactHash, policyHash, metadataHash, metadataURI)
revokePlan(planId, reasonHash, reasonURI)
attestSupplier(supplierSubjectId, wallet, profileHash, capabilityHash, reputationHash, metadataURI)
revokeSupplier(supplierSubjectId, reasonHash, reasonURI)
```

产品和 Store 通过部署配置选择信任哪个 registry 地址。其他生态可以部署
自己的 registry，并使用同一个 state machine，而不进入官方产品 registry，
也不被官方产品背书。

## Plan Attestation

Plan attestation 记录的关键字段是：

| 字段 | 含义 |
| --- | --- |
| `registryAddress` | 发出 attestation 事件的 registry 合约地址。 |
| `planId` | 计划版本标识。 |
| `planHash` | 链上计划产物哈希。 |
| `attested` | 是否已认证。 |
| `revoked` | 是否已撤销。 |
| `metadataURI` | 链下审计或说明材料。 |

已背书 plan 是产品信任数据，不是 state-machine 前置条件。状态机检查
publisher/registrar 权限和订单级 signal authorization；Store/Product 可以用
registry projection 做展示、告警或官方 catalog 准入。

## Supplier Attestation

Supplier attestation 不直接授权 `submitSignal()`。它是 Product/API 层展示供应商可信度、能力标签、风险提示和审计来源的输入。真正能否提交业务动作，仍由订单级 signal 授权决定。

## Trust Projection

`uvp-chain-services/service/src/indexer/trust-projections.ts` 从 registry 事件重建信任视图，并声明 `rebuildable: true`。这意味着供应商可信状态也不能只存在服务数据库里。
