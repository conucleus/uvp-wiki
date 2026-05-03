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

## Official Domain 常见问题

| 问题 | 回答 |
| --- | --- |
| 谁拥有一个 trust domain？ | Domain owner 是记录在 `ZhixuTrustRegistry` 里的治理主体。owner 或它控制的治理流程可以背书或撤销 plan 和 supplier 记录。 |
| 什么是 official domain？ | Official domain 是 state-machine 做 plan registration 检查时配置的 `domainId`。`registerPlan()` 会检查这个 domain 下的 plan hash 是否 active 且未 revoked。 |
| 可以有多个 domain 吗？ | 可以。多个 domain 可以背书相同或不同的 plan/supplier。Product/Store 可以展示额外 domain 视图，但除非部署规则改变，核心 plan registration 只由配置好的 official domain gate。 |
| Store 和 official domain 可以是同一个组织运营吗？ | staging 或产品部署里可以有关联组织运营，但文档和 UI 仍必须分清 Store workflow approval 和 trust-domain attestation。Store review row 不是 `PlanAttested`。 |
| 不同 domain 意见不一致怎么办？ | Store/Product 应展示每条 attestation 来自哪个 domain，以及 official domain 当前 active 还是 revoked。非 official endorsement 可以作为上下文，但不能替代 official-domain registration check。 |
| 谁负责 revoke？ | Domain owner 负责撤销自己对 plan 或 supplier 的背书。Store 可以发起、展示和审计 workflow，但撤销事实来自 registry event。 |

## Supplier 认证

Supplier attestation 不直接授权 `submitSignal()`。它是 Product/API 层展示供应商可信度、能力标签、风险提示和审计来源的输入。真正能否提交业务动作，仍由订单级 signal 授权决定。

## Trust Projection

`uvp-chain-services/service/src/indexer/trust-projections.ts` 从 trust registry 事件重建信任视图，并声明 `rebuildable: true`。这意味着供应商可信状态也不能只存在服务数据库里。
