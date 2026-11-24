---
title: Store Console、Supplier 与 Governance API
type: explanation
audience: Store operator 与工程贡献者
status: verified
---

# Store Console、Supplier 与 Governance API

Store 相关 API 是凝结核、Store operator、reviewer 与 governance admin 使用的工作台表面，组织 Zhixu draft、supplier profile、Dock 声明与试配记录、review 材料、publication workflow、identity request 与 audit trail。它们属于产品侧应用的平台 workflow；协议事实仍来自 registry 与 state-machine 事件，身份解析来自 Identity Registry 投影。

## 归属

| 面 | 归属 |
| --- | --- |
| Store 工作台与 Supplier directory | 产品侧应用（Store BFF 与工作流存储） |
| Dock 声明编辑与试配记录 | 产品侧应用；编译校验与产物身份以 uvp-core `analyzeDock` / `uvp.dock.v1` 为准 |
| Governance review 与 identity binding register/revoke request | 产品侧应用组织材料并发起请求；登记结果由 `UVPIdentityRegistry` 事件表达 |
| 链投影与链读 | chain-services：`src/indexer/`、`src/projection/`、`src/api/routes/chain-read.ts`、`src/api/routes/identity-bindings.ts` |

## Store Console

Store Console 面向凝结核工作台：

- Zhixu search、catalog、detail。
- draft import、compile preview、submit review、request publication。
- version、runtime、active recommendation、chain publication projection。
- Dock 声明草稿与试配记录，用来试拼 peer Zhixu、adapter 与 signalMap 输出面。
- audit trail，用来记录平台 workflow 行为。

这些状态是平台 workflow 和材料组织。身份绑定由 `UVPIdentityRegistry` 事件表达；能力、推荐和匹配仍是 Store 链下判断。

## Supplier Directory

Supplier API 组织现实履约网络的材料：

- supplier subject、wallet、display name。
- capability tags、role/stage availability。
- contact profile、负责人、SLA、operational notes。
- participation history、open task、proof links。
- review、publication request、revocation request。

Store admin 可以维护平台目录和审核材料。秩序内部参与规则由凝结核决定，发信权由链上 assigned supplier 状态与合约检查，产品侧只准备 typed data。

## Governance Workflow

Governance API 管理平台 review、identity binding register/revoke request、tx intent 和 audit。它可以组织材料并发起 Registry 操作；登记结果由 `UVPIdentityRegistry` 事件和投影表达。

治理流程与权限明细见 [Operator 权限、治理与 Audit](../store/governance-audit.md)；身份登记的信任域边界见 [Identity Registry：现实身份与链上地址](../trust/domains.md)。

```text
Store review material
  -> governance request
  -> Store or external institution/admin action
  -> UVPIdentityRegistry binding event（仅身份）
  -> indexer identity projection
```

## 边界

- Store review 是平台 workflow，trust publication 看 registry event。
- Store tag/search ranking 是目录和运营语义，公平性判断看凝结核材料和 Store or external institution 材料审核。
- Contact/notification 成功是联系状态，履约完成看 signal/proof。
- Dock 声明与试配记录是链下材料；正式关系看 `registerDock`、`StageDockSupplierSelected`、`dock_link` 文件项与 `DockOutputSubmitted`。
- Store audit trail 是平台留痕；链上 proof 单独展示。
