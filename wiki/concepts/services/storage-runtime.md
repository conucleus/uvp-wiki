---
title: Storage、Migration 与 Runtime Profile
type: reference
audience: 工程贡献者
status: verified
---

# Storage、Migration 与 Runtime Profile

Storage 是可重建服务层的工作流和投影缓存。存储引擎只有 PostgreSQL：部署、本地与测试跑同一个引擎；profile 只影响运行可靠性，不改变事实源。

## Storage profile

```text
CHAIN_SERVICES_DATABASE_URL=postgres://user:password@host:5432/database
```

`CHAIN_SERVICES_DATABASE_URL` 是全环境必填键——本地运行和单元测试也不例外；缺失时启动即失败，报错信息包含键名与起库提示。值必须是 `postgres://`（或 `postgresql://`）DSN：driver 开关 `CHAIN_SERVICES_DATABASE_DRIVER` 已删除，SQLite 与内存引擎已移除，没有隐式默认值，也没有绕开 Postgres 启动的模式。

| 存储口径 | 要求 |
| --- | --- |
| 唯一存储 env：`CHAIN_SERVICES_DATABASE_URL` | 必须是 Postgres DSN；非 Postgres DSN 在配置解析阶段即失败。 |
| `CHAIN_SERVICES_MIGRATIONS_AUTO_RUN` | 默认 `false`；production/staging/testnet 下置 `true` 需对应的显式 ack 键放行。 |

### 本地与测试

- 本地起库用 `uvp-chain-services/service/scripts/with-postgres.sh`（薄壳，内部复用 `uvp-deploy/deploy/scripts/lib/with-postgres.sh`）：目标 env 未设时拉起一次性 docker postgres（随机端口，命令退出即销毁容器）并把 DSN 注入该 env 后运行命令；env 已有值则直接透传。例如 `./scripts/with-postgres.sh CHAIN_SERVICES_DATABASE_URL -- pnpm dev:api`。
- 单元测试：`pnpm test` 经 `./scripts/with-postgres.sh --env CHAIN_SERVICES_POSTGRES_TEST_URL -- vitest run` 自动起库再跑 vitest；直接运行 `vitest`（绕过该脚本）时必须自带 `CHAIN_SERVICES_POSTGRES_TEST_URL` 指向一个可达的 Postgres（测试供给器按模板库克隆出每用例库）。

## 代码入口

| 文件 | 职责 |
| --- | --- |
| `src/storage/factory.ts` | 根据 env 创建 Postgres store 集合（PG-only）。 |
| `src/storage/projection-store.ts` | projection storage contract。 |
| `src/storage/postgres.ts`、`postgres-client.ts`、`postgres-rows.ts` | PostgreSQL adapter。 |
| `src/storage/postgres-migrations.ts` | migration runner：`NNNN_name.sql` 装载、checksum 台账、退役迁移检查。 |
| `src/config/env.ts`、`preflight.ts` | runtime env parse 和 fail-closed 检查。 |
| `src/security/redaction.ts`、`audit.ts` | redaction 和 audit support。 |

## Migrations

历史编号迁移已折叠为单份净 schema；最新以 `service/migrations/postgres/` 目录为准。迁移字节以 dev 活线为准，不承诺跨版本升级路径；已编号的迁移文件不再修改，结构变化时开新编号迁移。

| Migration | 内容 |
| --- | --- |
| `0001_schema` | 单份 pg_dump 净 schema：链事件投影、业务辅助表与 workflow state 的全部表结构。 |

- runner 在 `chain_services_migrations` 台账记录每个迁移的 version 与 sha256 checksum；已应用迁移的文件 checksum 失配即拒启，需按台账清账后重建该库。
- 台账中存在目录里已无对应文件的迁移版本同样拒启（退役检查），避免迁移历史被静默改写。
- 投影数据必须可擦除重建：投影库删库后由 indexer 从链事件重放恢复。

## Testnet fail-closed

本节是 testnet fail-closed 策略清单的唯一权威出处；其他页面引用该策略时链接到这里，不另行复述完整清单。

Base Sepolia / testnet profile 必须拒绝：

- 非 Postgres 存储（引擎只有 Postgres，`CHAIN_SERVICES_DATABASE_URL` 必须是 `postgres://` DSN）。
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
