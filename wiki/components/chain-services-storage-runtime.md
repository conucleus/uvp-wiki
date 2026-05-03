# Storage、Migration 与 Runtime Profile

Storage 是可重建服务层的工作流和投影缓存。Chain Services 支持 memory、SQLite 和 PostgreSQL；不同 profile 只影响运行可靠性，不改变事实源。

## Storage profile

```text
CHAIN_SERVICES_DATABASE_DRIVER=memory|sqlite|postgres
CHAIN_SERVICES_DATABASE_URL=memory://projection-store
CHAIN_SERVICES_MIGRATIONS_AUTO_RUN=false
```

| Profile | 用途 | 约束 |
| --- | --- | --- |
| memory | 单元测试、临时 prototype。 | 只支撑 test/prototype 口径。 |
| SQLite | 本地 durable run、开发者自测。 | 适合个人 fork，不适合公共测试网服务。 |
| PostgreSQL | Base Sepolia staging、长期服务、生产 profile。 | migration 显式管理，runtime fail-closed。 |

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

Base Sepolia / testnet profile 必须拒绝：

- memory/SQLite storage。
- localhost RPC。
- demo fallback、E2E fixture controls、permissive authorization。
- Anvil default private keys。
- 缺失 `UVPStateMachine` / `ZhixuTrustRegistry` address manifest。
- broadcast 关闭但仍声明 staging ready。

Readiness 可以说明“这个服务实例是否按正确配置运行”；链上 plan/order/signal/trust 事实仍来自事件。

## 边界

- 所有 projection 数据必须可擦除重建。
- Store draft、supplier metadata、audit 和 notification delivery 是 workflow state。
- PostgreSQL durable 是运行可靠性，不是 canonical truth。
- diagnostics 和 audit output 必须 redacted。
