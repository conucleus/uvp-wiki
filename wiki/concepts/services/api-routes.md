---
title: API Routes
type: reference
audience: 工程贡献者
status: verified
---

# API Routes

`src/api/routes/` 是 Chain Services 的 HTTP route module 入口。路由按消费面分组：通用链读、身份绑定、诊断、运维，以及已迁移业务面的显式 410 响应。面向用户的路由文档见 [Product API 端点速查](../../reference/product-api-endpoints.md)。

## Route module 归属

以下清单以 `uvp-chain-services/service/src/api/routes.ts` 的路由注册为准。

| Route module | 归属 |
| --- | --- |
| `chain-read.ts` | `/chain/*` 通用链读：orders、tasks、sync-state、snapshot（含 `stateMachineDockBindings` 的 Dock binding 投影与 A/B 窗口 live enrichment），以及 plan admissions / triggers 读面。 |
| `identity-bindings.ts` | `/identity/bindings` 身份绑定投影。 |
| `diagnostics.ts` | health / readiness 诊断。 |
| `admin-ops.ts` | ops-only 维护路由。 |
| `v1-gone.ts` | V1 订单面的显式 410 响应（`v1_order_surface_removed`），指向产品侧应用的 V3 订单路由。 |

## Route shell

| 文件 | 职责 |
| --- | --- |
| `src/api/server.ts` | HTTP server entrypoint。 |
| `src/api/routes.ts` | route registration。 |
| `src/api/route-context.ts` | stores、services、dock binding window reader 与 runtime config 注入。 |
| `src/api/route-module.ts` | route module interface。 |
| `src/api/diagnostics.ts` | readiness 和 redacted diagnostics helper。 |
| `src/api/dock-binding-windows.ts` | binding 身份与发射来自事件投影，当前 A/B 窗口读时从 stage-patch `dockOutputWindow` view 取 live 值。 |
| `src/security/admin-auth.ts`、`audit.ts` | ops admin 鉴权与 audit。 |

## 设计规则

- 新 route 要明确属于链读、身份、诊断、运维或业务面迁移响应。
- 链读 route 不暴露业务行、钱包会话或 Store 工作流。
- 业务写路径（order 草稿/邀请/参与者、证据、治理、提交编排）由产品侧应用承担；本包不广播、不生成业务签名。
- 不存在 local E2E fixture-control route；testnet/production profile 对缺失显式配置 fail-closed，完整清单见 [Storage、Migration 与 Runtime Profile](storage-runtime.md)。
- 所有 public claim 都要能追溯到 event、hash、signature、DTO contract 或 workflow audit。
