# Trust Domain

Trust domain 是 `ZhixuTrustRegistry` 里的信任主体。它负责声明“某个计划版本可信”或“某个供应商主体可信”。合约只检查认证和撤销状态，不解释业务声誉。

## 存储内容

Trust registry 维护三类主要数据：

```solidity
mapping(bytes32 domainId => TrustDomain domain) private _domains;
mapping(bytes32 domainId => mapping(bytes32 planId => PlanAttestation)) private _planAttestations;
mapping(bytes32 domainId => mapping(bytes32 supplierSubjectId => SupplierAttestation)) private _supplierAttestations;
```

## 域所有者能做什么

域所有者可以：

- 注册或更新 trust domain。
- 对 `(planId, planHash)` 做计划认证。
- 撤销计划认证。
- 对 supplier subject 做认证。
- 撤销 supplier 认证。

## 计划认证

Plan attestation 记录的关键字段是：

| 字段 | 含义 |
| --- | --- |
| `planId` | 计划版本标识。 |
| `planHash` | 链上计划产物哈希。 |
| `attested` | 是否已认证。 |
| `revoked` | 是否已撤销。 |
| `metadataURI` | 链下审计或说明材料。 |

`UVPStateMachine.registerPlan()` 会通过 registry 检查：

```solidity
trustRegistry.isPlanRevoked(officialDomainId, planId)
trustRegistry.isPlanActive(officialDomainId, planId, planHash)
```

没有有效认证的 plan 不应成为可注册协议计划。

## Supplier 认证

Supplier attestation 不直接授权 `submitSignal()`。它是 Product/API 层展示供应商可信度、能力标签、风险提示和审计来源的输入。真正能否提交业务动作，仍由订单级 signal 授权决定。

## Trust Projection

`uvp-chain-services/service/src/indexer/trust-projections.ts` 从 trust registry 事件重建信任视图，并声明 `rebuildable: true`。这意味着供应商可信状态也不能只存在服务数据库里。
