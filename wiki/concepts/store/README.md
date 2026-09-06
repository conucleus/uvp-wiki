---
title: 秩序商店（Store）
type: meta
audience: Store 产品与运营、协议读者
preread: ../protocol-boundaries.md
status: verified
---

# 秩序商店（Store）

> 前置阅读：[协议边界（不变量总纲）](../protocol-boundaries.md)
秩序商店是凝结核、供应商、operator 和普通执行界面之间的链下产品工作台。它提供目录、编译预览、供应商资料、能力标签、搜索匹配、proof 视图、通知、审核流程和 audit，但不把这些商业判断提升为 UVP 协议事实。术语以 [../../reference/glossary.md](../../reference/glossary.md) 为准。

```text
凝结核设计 Zhixu
  -> Store 编译预览与链下审核
  -> publisher 签名提交并 finalize Plan
  -> UVPStateMachine 产生 Plan / Order / Signal 事实

Store 线下核验主体
  -> UVPIdentityRegistry 登记 subjectId <-> account
  -> Store 用 descriptor 显示名称
```

## 信息对象与权威来源

本表是全站 Store 区权威边界陈述的唯一权威版本。其他页面遇到这些边界时只做一句话引用并链接到本节，不再各自复述；协议侧总纲见 [协议边界](../protocol-boundaries.md)。

| 信息对象 | 权威来源 | 说明 |
| --- | --- | --- |
| Nucleus / 凝结核 | 凝结核内部治理；无独立合约状态，体现在 Zhixu/Plan/Order/proof 中。 | Zhixu 设计者与秩序组织者；Store 记录 identity、维护说明、版本历史、设计材料和发布材料。 |
| Zhixu draft / Plan 版本 | publisher EIP-712 签名 + `UVPStateMachine` 的 `PlanCommitted` / `PlanFinalized`。Plan 是否可用于创建 Order，以 finalized 为准。 | Store 组织 draft、compile preview、fairness 材料、平台目录标签和 active recommendation，这些只是链下展示与推荐。 |
| 现实身份（Identity binding） | Store 线下核验后由 `UVPIdentityRegistry` 登记 subjectId <-> account。 | Registry 只做绑定：不认证 Plan，不声明 Supplier 能力或信誉，不负责撮合。撤销不删除历史；撤销后 Store 将主体移出默认目录。 |
| Supplier 能力资料 | Store metadata（profile、capability tags、联系人、审核状态）；组织语义由凝结核负责。 | 链下商业数据，可以因不同 Store 而异；能力标签不创建订单或 signal 权限，signal authorization 在 Order 中产生。 |
| Order | registrar/participants/executors 签名 + `OrderRegistered` 与 state-machine events。 | Store 只做搜索、排序、operator note 和 proof summary；Order/Signal 权利来自参与者签名、订单级授权与 active executor overlay，Store 不能替参与者签名。 |
| Task / Signal 履约 | authorized submitter 的链上 signal：`SignalSubmitted`、`HookReady` 与 stage overlay events。 | contact 不等于履约：通知送达只是运营状态，业务完成以链上 signal 为准。 |
| Executor 授权 | 订单级授权与 active executor overlay（patch 路径事件）。 | 由合约、EIP-712、order authorization 与 active overlay 决定，不由 Store workflow 改变。 |
| Platform workflow | Store operator/reviewer/admin 的审批与确认记录；public claim 以 registry tx 和 indexed events 为准。 | 审批、确认、audit、broadcast request 只证明 Store 动作发生过，不等于对应链上事实成立。 |
| Docking relation | local/linked order 各自的 state-machine events 和 mapped signal proof。 | mapped signal 和 proof 决定 local order 推进；docking sandbox 校验通过不等于可创建订单。 |

## 首页信息架构原则

Search first、Nucleus visible、Trust visible、Proof reachable、Docking visible：同一个查询可以命中凝结核、Zhixu、Order、Supplier、Governance object，但对象详情页必须显示自己的权威来源——supplier 卡片的 trust badge 来自 registry projection，Zhixu 卡片的 official 状态来自 plan publication，Store-only metadata（draft、review、note、contact、notification、platform tag）必须标注为 Store/workflow 信息。revoked plan/supplier 可以被 operator 查到并在创建新订单入口阻断，但 Store metadata 不能使其复活；不得隐藏 chain syncing/rebuild 状态，避免 operator 把投影延迟当成对象不存在。

## 中心化与可验证性

Store 明确中心化地承担线下身份核验、名称展示、合规、目录、标签、推荐和运营。用户对它的信任不来自“Store 是去中心化的”，而来自责任边界清楚：身份写入可重放事件、publisher 和参与者权限由签名证明、任意 relayer 可广播、冻结 modules 不能被后台静默替换。完整论述见 [协议边界](../protocol-boundaries.md)与 [Contracts 与 Registries](../contracts-and-registries.md)。

## 子页导航

| 子页 | 内容 |
| --- | --- |
| [Zhixu 管理](zhixu-management.md) | 凝结核工作台、publisher 签名、Plan commit/finalize 与 Store 发布 workflow。 |
| [Supplier Directory](supplier-directory.md) | 线下 Supplier 资料、三类身份与标签来源、身份 binding 和联系。 |
| [履约与 Proof](runtime-proof.md) | Order、task、Signal、proof 与身份显示。 |
| [联系与通知](contact-notifications.md) | delivery intent、通知状态、负责人和 SLA。 |
| [治理与 Audit](governance-audit.md) | Store operator 权限、身份登记/撤销和链下审核记录。 |
| [Docking Sandbox](docking-sandbox.md) | peer Zhixu、adapter 和 signal map 的链下试拼。 |

Store workflow 状态不是链上权利。`approved_for_broadcast` 只表示 Store 愿意执行下一步；Plan 是否可用于创建 Order，以 `UVPStateMachine` 中是否 finalized 为准。
