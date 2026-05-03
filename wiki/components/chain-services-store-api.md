# Store Console、Supplier 与 Governance API

Store 相关 API 是凝结核、Store operator、reviewer 和 governance admin 使用的工作台表面。它们组织 Zhixu draft、supplier profile、docking session、review material、attestation request 和 audit trail，但不替凝结核治理 Zhixu 内部，也不替 trust domain 判定公平可信。

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
- draft import、compile preview、submit review、request attestation。
- version、runtime、active recommendation、chain attestation projection。
- docking session，用来试拼 peer Zhixu、adapter 或 signal map。
- audit trail，用来记录平台 workflow 行为。

这些状态是平台 workflow 和材料组织，不是 `PlanAttested`。只有 `ZhixuTrustRegistry` 事件能表达外部背书。

## Supplier Registry

Supplier API 组织现实履约网络的材料：

- supplier subject、wallet、display name。
- capability tags、role/stage availability。
- contact profile、负责人、SLA、operational notes。
- participation history、open task、proof links。
- review、attestation request、revocation request。

Store admin 可以维护平台目录和审核材料，但不替 Zhixu 内部决定谁必须参与、谁获得订单级 signal 权限。订单级授权仍由 Product BFF 生成并由合约检查。

## Governance Workflow

Governance API 管理平台 review、attestation/revocation request、tx intent 和 audit。它可以组织材料并发起 trust-domain 操作，但不直接把 fairness/trust 写成事实。

```text
Store review material
  -> governance request
  -> trust-domain/admin action
  -> ZhixuTrustRegistry event
  -> indexer trust projection
```

## 边界

- Store review 不是 trust attestation。
- Store tag/search ranking 不是公平性判断。
- Contact/notification 成功不是履约完成。
- Docking draft 不发布 Zhixu、不注册 plan、不创建 order、不创建 signal authorization。
- Store audit trail 是平台留痕，不是链上 proof。
