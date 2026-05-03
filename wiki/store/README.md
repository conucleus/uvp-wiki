# 秩序商店

秩序商店是凝结核、供应商、trust domain、operator 和普通执行界面之间的产品工作台。它提供目录、编译预览、资源和供应商组织、proof 视图、联系通知、发布 workflow、attestation request 和 audit。凝结核负责秩序内部设计，trust domain 负责外部背书，`UVPStateMachine` 和 `ZhixuTrustRegistry` 负责链上事实。

```text
Nucleation / 凝结核
  -> Store workspace and catalog
  -> compile preview / supplier organization / proof materials
  -> Store workflow review and audit
  -> trust-domain attestation request
  -> registry/state-machine projections
```

## 三层治理

| 层 | 负责人 | Store 做什么 | 事实边界 |
| --- | --- | --- | --- |
| 凝结核内部治理 | Zhixu 设计者和秩序组织者 | 提供设计、组织、版本、供应商和 proof 工作台。 | 内部规则要进入 Zhixu/Plan/Order/proof 才可验证。 |
| Store 平台 workflow | Store operator/reviewer/admin | 做目录打标、材料审核、发布流程、attestation request、audit。 | Store metadata/review/audit 是平台 workflow 证据。 |
| Trust domain 外部背书 | trust domain owner/reviewer | Store 展示结果和请求状态。 | `PlanAttested`、`SupplierAttested` 等 registry 事件才是背书事实。 |

所以 Store 页面里写“治理”时，指的是平台 workflow 和证据组织；秩序环节、内部公平和供应商组织原则仍由凝结核维护。

## Registry vs Store 权威边界

先读 [Store 权威边界与信息架构](authority-and-ia.md)。每个 Store 页面都必须先说明“谁负责这个对象”，再说明 Store 如何组织它。

| 问题 | 权威来源 | Store 可以做什么 |
| --- | --- | --- |
| Zhixu 设计是否合理 | 凝结核的设计材料 + trust domain 外部审查。 | 展示设计、编译预览、资源要求、supplier slots、公平性说明。 |
| Plan 是否官方可信 | `ZhixuTrustRegistry.PlanAttested` / `PlanRevoked`。 | 发起/跟踪 attestation request，展示 trust projection。 |
| Supplier 是否被背书 | `SupplierAttested` / `SupplierRevoked`。 | 组织 profile、能力标签、联系、履约 proof 和背书材料。 |
| Order 是否注册 | `UVPStateMachine.OrderRegistered`。 | 搜索、定位、展示状态和 proof。 |
| Signal 是否提交 | `SignalSubmitted` 和 proof rows。 | 展示履约记录、证据 hash、tx/block/event。 |
| Store review 是否通过 | Store metadata / audit。 | 说明平台 workflow 走到哪一步；trust badge 仍取 registry projection。 |

Store metadata、平台标签、联系信息、通知状态、review、audit、履约视图和 search ranking 都是产品和 workflow 读模型。协议事实来自 registry/state-machine 事件。

## Store 信息架构

| 区域 | 主要对象 | 先读 |
| --- | --- | --- |
| 凝结核工作台 | nucleation id、设计材料、版本、供应商组织、背书申请材料。 | [凝结核工作台](nucleation-workbench.md) |
| Zhixu Catalog | draft、compiled artifact、plan hash、fairness material、active recommendation、trust projection。 | [Zhixu Catalog、配置与发布](zhixu-management.md) |
| Supplier Registry | supplier subject、capability、contact、participation、proof、attestation request。 | [Supplier Registry、能力与联系](supplier-registry.md) |
| Trust / Proof | plan/supplier trust、order/task timeline、proof rows、revoked history。 | [履约状态、Proof 与 Trust 校验](runtime-proof.md) |
| Contact / Notification | delivery intent、retry、failure reason、负责人、SLA。 | [联系与通知](contact-notifications.md) |
| Platform Workflow / Audit | review、attestation request、revocation request、operator audit。 | [Operator 权限、治理与 Audit](governance-audit.md) |
| Docking Sandbox | peer Zhixu、adapter、signalMap、capability plugin 的试拼。 | [Docking Sandbox](docking-sandbox.md) |
| Service Surface | Store Console API、draft routes、supplier routes、docking routes、audit storage。 | [非可信执行层：Chain Services](../components/chain-services.md) |

## Zhixu 在 Store 的发布路径

详见 [Zhixu Catalog、配置与发布](zhixu-management.md)。

Store 里的 Zhixu 页面应该帮助凝结核把秩序设计变成可审查、可背书、可创建订单的版本：

```text
凝结核导入 Zhixu
  -> 编译预览
  -> Product Schema / resource / supplier requirement 校验
  -> 凝结核准备公平性和透明性说明
  -> Store workflow review
  -> governance admin request attestation
  -> indexed PlanAttested
  -> active/order-creatable version
```

`approved_for_broadcast` 是平台 workflow 状态。official trusted plan 的展示需要匹配 plan id/hash 的 indexed `PlanAttested`。

## Supplier 是凝结核组织网络的一部分

详见 [Supplier Registry、能力与联系](supplier-registry.md)。

Store 的 supplier registry 帮凝结核组织现实履约能力网络：

- supplier profile、display name、wallet、subject id；
- 凝结核内部 role/stage/capability 需求；
- Store 平台 catalog 标签和搜索标签；
- 联系方式、通知配置、负责人、可用时段、SLA 或 operational notes；
- 履约参与记录、open task、历史 proof；
- supplier attestation/revocation request 和 trust projection。

这些信息帮助凝结核选择、联系和组织供应商。订单级 signal 授权和 active executor overlay 仍由合约检查。

## 相关页面

- [凝结核工作台](nucleation-workbench.md)
- [Store 权威边界与信息架构](authority-and-ia.md)
- [Zhixu Catalog、配置与发布](zhixu-management.md)
- [Supplier Registry、能力与联系](supplier-registry.md)
- [履约状态、Proof 与 Trust 校验](runtime-proof.md)
- [联系与通知](contact-notifications.md)
- [Operator 权限、治理与 Audit](governance-audit.md)
- [Docking Sandbox](docking-sandbox.md)
- [非可信执行层：Chain Services](../components/chain-services.md)
