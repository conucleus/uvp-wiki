# 秩序商店

这里是 Store 的核心概念侧视图。完整产品入口见 [秩序商店](../../store/README.md)，那里按 Store 工作流、权威边界和 operator 任务组织。

秩序商店是中心化产品与平台 workflow 工作台。它负责把凝结核、秩序、supplier、订单、证明和背书请求组织成人能理解的界面。它给凝结核提供舞台，给对象打平台标签，展示 proof，发起 governance request，保留 audit；凝结核、trust registry 和链上事件分别保留自己的权威来源。

## 它的权威来自哪里

Store 的权威是组织权威和平台 workflow 权威。它可以说：

- 这条 Zhixu 由某个凝结核提交，并通过 Store workflow review。
- 这个 supplier 被平台标记为 `customs` 或 `logistics` 能力。
- 这个版本是当前推荐创建订单的 active version。
- 这个 draft 通过了编译预览和 schema 校验。
- 某个 attestation request 已经被发起或正在等待索引。

协议事实需要链上事件支撑：

- plan 已经链上 attested。
- order 已经注册。
- signal 已经提交。
- supplier 已经被 trust registry 背书。
- 某个 Zhixu 已经公平可信。
- 某个 executor 已经成为 active executor。

这些都必须来自 trust registry 判定或合约事件。

## Store 管什么

| 对象 | Store 做的事 | Store 不做的事 |
| --- | --- | --- |
| Nucleus / 凝结核 | 提供设计、发布、供应商组织、proof 和 attestation request 工作台。 | 不替凝结核治理秩序内部。 |
| Zhixu | 导入、编译预览、版本展示、发布材料审核、背书请求。 | 不直接判定公平可信。 |
| Supplier | 注册 profile、平台标签、联系、proof、背书材料。 | 标签、链上 trust 和订单授权分层展示。 |
| Order | 搜索、定位、查看投影、查看 proof。 | 不创建链上运行事实。 |
| Governance workflow | 帮 operator/admin 发起计划或供应商背书请求。 | 不让 audit row 替代 registry event。 |
| Metadata | 业务说明、风险标签、能力标签、资源说明、审计材料 URI。 | metadata 属于 workflow/material；协议事实来自 event/proof。 |

## 中心化和去中心化的分工

Store 的价值在于中心化组织能力：分类、审核、打标、解释、运维、治理入口、凝结核工作台。链上协议的价值在于保存可验证边界：plan hash、order、signal、hook、patch、attestation、revocation。

把两者混在一起会出问题。Store 如果变成事实源，协议就退化成普通后端；Store 如果替凝结核治理秩序内部，秩序设计者的责任也会被抹掉；合约如果承担全部产品解释，又会让普通用户被 `sourceId`、`signalId`、ABI 和 gas 淹没。
