---
title: 秩序商店
type: explanation
audience: 协议读者
preread: ../README.md
status: verified
---

# 秩序商店

> 前置阅读：[核心概念](../README.md)
这里是 Store 的核心概念侧视图。完整产品入口见 [秩序商店](../store/README.md)，那里按 Store 工作流、权威边界和 operator 任务组织。

秩序商店是中心化产品与平台 workflow 工作台。它负责把凝结核、秩序、supplier、订单、证明和材料审核请求组织成人能理解的界面。它给凝结核提供舞台，给对象打平台标签，展示 proof，发起 governance request，保留 audit；凝结核、Identity Registry 和链上事件分别保留自己的权威来源。

## 谁使用

凝结核用它导入秩序、组织供应商和发起发布；supplier 维护目录资料；operator/admin 处理材料审核与治理请求；普通参与者通过它搜索订单和查看 proof。

## 产生什么结果

Store 产出目录、标签、版本展示、编译预览、publication/governance request 和 audit 记录等产品工作流结果；这些结果组织信息，但不直接创造协议事实。

## 权威来自哪里

Store 的权威是组织权威和平台 workflow 权威。它可以说：

- 这条 Zhixu 由某个凝结核提交，并通过 Store workflow review。
- 这个 supplier 被平台标记为 `customs` 或 `logistics` 能力。
- 这个版本是当前推荐创建订单的 active version。
- 这个 draft 通过了编译预览和 schema 校验。
- 某个 publication request 已经被发起或正在等待索引。

协议事实需要链上事件支撑：

- plan 已经链上 published。
- order 已经注册。
- signal 已经提交。
- supplier 的 subject/account binding 已登记。
- 某个 Zhixu 已通过材料审核（publication）。
- 某个 executor 已经成为 active executor。

这些都必须来自 Identity Registry 判定或合约事件。

## Store 管什么

| 对象 | Store 做的事 | Store 不做的事 |
| --- | --- | --- |
| Nucleus / 凝结核 | 提供设计、发布、供应商组织、proof 和 publication request 工作台。 | 不替凝结核治理秩序内部。 |
| Zhixu | 导入、编译预览、版本展示、发布材料审核、材料审核请求。 | 不直接判定是否完成材料审核。 |
| Supplier | 注册 profile、平台标签、联系、proof、材料审核材料。 | 标签、链上 trust 和订单授权分层展示。 |
| Order | 搜索、定位、查看投影、查看 proof。 | 不创建链上运行事实。 |
| Governance workflow | 帮 operator/admin 发起计划或供应商材料审核请求。 | 不让 audit row 替代 registry event。 |
| Metadata | 业务说明、风险标签、能力标签、资源说明、审计材料 URI。 | metadata 属于 workflow/material；协议事实来自 event/proof。 |

## 中心化和去中心化的分工

Store 的价值在于中心化组织能力：分类、审核、打标、解释、运维、治理入口、凝结核工作台。链上协议的价值在于保存可验证边界：plan hash、order、signal、hook、patch、publication、revocation。

把两者混在一起会出问题。Store 如果变成事实源，协议就退化成普通后端；Store 如果替凝结核治理秩序内部，秩序设计者的责任也会被抹掉；合约如果承担全部产品解释，又会让普通用户被 `sourceId`、`signalId`、ABI 和 gas 淹没。
