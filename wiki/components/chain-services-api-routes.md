# API Routes

`src/api/routes/` 是 Chain Services 的 HTTP route module 入口。路由按消费面分组：Product、Store、submission、evidence、governance、notification、diagnostics 和本地测试控制。

## Route module 归属

| Route module | 归属 |
| --- | --- |
| `product-read.ts` | Product orders、tasks、timeline、proof read model。 |
| `product-bff.ts` | order draft、invite、participant confirmation、registration submit。 |
| `stage-patches.ts` | executor/resource patch prepare and submit。 |
| `submissions.ts` | wallet submit、submission status、retry 入口。 |
| `evidence.ts` | evidence upload metadata、proof route、object handle。 |
| `store-console.ts` | Store search、Zhixu console、draft/version/runtime view。 |
| `store-docking.ts` | docking session、validate、draft map。 |
| `store-suppliers.ts` | supplier directory、review、匹配资料输入。 |
| `governance.ts` | admin review、identity binding register/revoke tx workflow。 |
| `notifications.ts` | supplier notification profile、delivery ops。 |
| `diagnostics.ts` | health/readiness/admin diagnostics。 |
| `admin-ops.ts` | ops-only maintenance route。 |
| `e2e-controls.ts` | local/product E2E fixture controls；testnet/production 必须禁用。 |

## Route shell

| 文件 | 职责 |
| --- | --- |
| `src/api/server.ts` | HTTP server entrypoint。 |
| `src/api/routes.ts` | route registration。 |
| `src/api/route-context.ts` | stores、services、runtime config 注入。 |
| `src/api/store-authz.ts` | Store operator/admin headers 和访问控制。 |
| `src/api/diagnostics.ts` | readiness 和 redacted diagnostics helper。 |
| `src/api/route-module.ts` | route module interface。 |

## 设计规则

- 新 route 要明确属于 Product、Store、governance、ops 还是 local E2E。
- Product route 不应暴露 Store admin workflow。
- Store route 不应伪造 Product proof、Plan 发布状态或 identity binding。
- E2E controls 只能用于本地测试，testnet/production profile 必须 fail-closed。
- 所有 public claim 都要能追溯到 event、hash、signature、DTO contract 或 workflow audit。
