---
title: Store Console、Supplier 与 Governance API
type: explanation
audience: Store operator 与工程贡献者
status: verified
---

# Store Console、Supplier 与 Governance API

Store 相关 API 是凝结核、Store operator、reviewer 和 governance admin 使用的工作台表面。它们组织 Zhixu draft、supplier profile、docking session、review material、publication workflow、identity request 和 audit trail。凝结核治理秩序内部，Store API 负责平台 workflow，Identity Registry 投影负责 subject/account 解析。

## 代码入口

| 子系统 | 文件 |
| --- | --- |
| Store Console | `src/store-console/service.ts`、`zhixu-drafts.ts`、`docking.ts`、`audit.ts`、`runtime.ts`、`version.ts`、`access.ts` |
| Store storage | `src/store-console/sqlite-store.ts`、`postgres-store.ts` |
| Store Supplier | `src/store-suppliers/service.ts`、`sqlite-store.ts`、`postgres-store.ts` |
| Governance | `src/governance/service.ts`、`adapter.ts`、`auth.ts`、`hashing.ts`、`store.ts` |
| API routes | `src/api/routes/store-console.ts`、`store-docking.ts`、`store-suppliers.ts`、`governance.ts` |

## Store Console

Store Console 面向凝结核工作台：

- Zhixu search、catalog、detail。
- draft import、compile preview、submit review、request publication。
- version、runtime、active recommendation、chain publication projection。
- docking session，用来试拼 peer Zhixu、adapter 或 signal map。
- audit trail，用来记录平台 workflow 行为。

这些状态是平台 workflow 和材料组织。身份绑定由 `UVPIdentityRegistry` 事件表达；能力、推荐和匹配仍是 Store 链下判断。

## Supplier Directory

Supplier API 组织现实履约网络的材料：

- supplier subject、wallet、display name。
- capability tags、role/stage availability。
- contact profile、负责人、SLA、operational notes。
- participation history、open task、proof links。
- review、publication request、revocation request。

Store admin 可以维护平台目录和审核材料。秩序内部参与规则由凝结核决定，订单级授权由 Product BFF 生成并由合约检查。

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
- Docking draft 是试拼材料；正式运行看发布、注册、授权和 docking events。
- Store audit trail 是平台留痕；链上 proof 单独展示。
