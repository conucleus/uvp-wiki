---
title: Storage、Migration 与 Runtime Profile
type: reference
audience: 工程贡献者
status: verified
---

# Storage、Migration 与 Runtime Profile

Storage 是可重建服务层的工作流和投影缓存。Chain Services 支持 memory、SQLite 和 PostgreSQL；不同 profile 只影响运行可靠性，不改变事实源。

## Storage profile

```text
CHAIN_SERVICES_DATABASE_DRIVER=memory|sqlite|postgres
CHAIN_SERVICES_DATABASE_URL=<按 driver 显式配置>
```

`CHAIN_SERVICES_DATABASE_DRIVER` 与 `CHAIN_SERVICES_DATABASE_URL` 是全环境必填键——本地运行和单元测试也不例外；任一缺失时启动即失败，报错信息包含缺失键名。三个合法值都是对目标 profile 的显式声明：没有隐式默认值，也没有不配置驱动就能启动的模式。生产环境额外要求 `postgres` 并显式管理 migration，runtime fail-closed。

| 合法的显式驱动值 |
| --- |
| `memory`：只支撑单元测试、临时 prototype 口径。 |
| `sqlite`：本地 durable run、开发者自测；适合个人 fork，不适合公共测试网服务。 |
| `postgres`：Base Sepolia staging、长期服务、生产 profile。 |

## 代码入口

| 文件 | 职责 |
| --- | --- |
| `src/storage/factory.ts` | 根据 env 创建 memory/SQLite/PostgreSQL store。 |
| `src/storage/projection-store.ts` | projection storage contract。 |
| `src/storage/sqlite.ts`、`sqlite-projection-store.ts` | SQLite adapter。 |
| `src/storage/postgres.ts`、`postgres-client.ts` | PostgreSQL adapter。 |
| `src/storage/migrations.ts`、`postgres-migrations.ts` | migration runner。 |
| `src/config/env.ts`、`preflight.ts` | runtime env parse 和 fail-closed 检查。 |
| `src/security/redaction.ts`、`audit.ts` | redaction 和 audit support。 |

## Migrations

以下清单截至本文撰写，最新以 `src/storage/migrations` 目录为准。

| Migration | 内容 |
| --- | --- |
| `0001_projection_storage` | chain event projection 和基础 replay storage。 |
| `0002_business_storage` | 业务查询辅助表，不作为协议事实。 |
| `0003_product_order_start` | Product order draft/start workflow。 |
| `0004_submission_attempt_operations` | submission attempt、retry、operation tracking。 |
| `0005_projection_sync_state` | indexer sync/finality/rebuild 状态。 |
| `0006_store_metadata` | Store Zhixu、supplier、docking 等 metadata。 |
| `0007_store_product_schema` | Store Product Schema / add-on manifest 相关结构。 |
| `0008_store_audit` | Store operator/admin audit trail。 |

## Testnet fail-closed

本节是 testnet fail-closed 策略清单的唯一权威出处；其他页面引用该策略时链接到这里，不另行复述完整清单。

Base Sepolia / testnet profile 必须拒绝：

- memory/SQLite storage。
- localhost RPC。
- permissive authorization。
- Anvil default private keys。
- 缺失 `UVPStateMachine` / `UVPIdentityRegistry` address manifest。
- broadcast 关闭但仍声明 staging ready。

非 local 环境（或 relayer broadcastEnabled=true）缺少广播适配器时，启动即以配置错误失败，不会半配置运行。

这份清单里没有 demo fallback 和 E2E fixture controls：它们不是待拒绝的开关，而是已经不存在。Product API 没有 demo 数据源——空投影返回空数组、缺失明细返回 `detail_unavailable`，不存在 `?fallback=demo` 参数和 `UVP_PRODUCT_DEMO_MODE` 键；e2e-controls 模块与 `UVP_PRODUCT_E2E_FIXTURES` 也已删除。fail-closed 检查的对象是「缺显式配置」，不是「关闭某个 demo 模式」。

Readiness 可以说明“这个服务实例是否按正确配置运行”；链上 plan/order/signal/trust 事实仍来自事件。

## 边界

- 所有 projection 数据必须可擦除重建。
- Store draft、supplier metadata、audit 和 notification delivery 是 workflow state。
- PostgreSQL durable 是运行可靠性，不是 canonical truth。
- diagnostics 和 audit output 必须 redacted。

## 相关页面

- [Chain Services](chain-services.md)
- [Indexer 与投影](indexer-projections.md)
- [数据流与事实源](../data-flow-and-truth.md)
- [运行服务和前端](../../how-to/run-services-and-apps.md)
