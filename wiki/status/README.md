# 项目状态

本页是 Wiki 的状态入口。它只摘要仓库中的实现、测试、PRD index 和 release evidence，不替代 `docs/product/README.md`、`docs/IMPLEMENTATION_TRACE.md` 或 `uvp-deploy/deploy/releases/`。

## 状态口径

| 状态 | 含义 |
| --- | --- |
| verified | 有代码、测试、链事件或可复跑证据支撑。 |
| prototype | 有可用实现或界面，但 live/staging/operator 证据不足。 |
| planned | PRD 或 roadmap 已定义，未完成实现或验收。 |
| blocked | 当前验收被外部条件、运行环境或缺失 gate 阻塞。 |

不要把 fixture-only、demo fallback、local-only、simulated adapter 或 planned PRD 写成 verified。

## 当前 verified 主干

- Hook DSL parse/eval 在 `hook-core` 中集中，并被 compiler/statemachine 复用。
- Zhixu 可以编译成 deterministic `HookPlanArtifact` 和 EVM-facing `OnchainHookPlanArtifact`。
- `ZhixuTrustRegistry` 支持 domain、plan attestation、supplier attestation 和 revocation projection。
- `UVPStateMachine` 支持 publisher/registrar governance、plan/order registration、order-level signal authorization、first-writer-wins signal、hook status、timer、`HookReady`。
- chain-services 能从 state-machine、trust registry 和 deployment registry 事件重建 Product order/task/proof/trust projection。
- Product DTO 将链上投影翻译成普通用户可读的 order/task/proof/trust 对象。
- Productization boundary debt 已减少：DTO/demo fixtures、route trees、frontend entries、Store metadata、Order App ownership 已在代码层分离。
- Product/Store Base Sepolia `0.2` rehearsal 已有 2026-05-01 managed Postgres/R2/JWT 记录。
- 2026-05-02 在 managed provider quota block 后，通过 local Docker Postgres 跑通 Base Sepolia Product/Store broadcast rehearsal，并保留更窄口径的 release-candidate evidence。
- 2026-05-02 之后当前 head 增加 no-spend guard：managed Postgres/R2 需要显式 managed-spend consent，非本地 Postgres 的 indexer poll 必须为 0，CI 有 `no-spend-safety`。

## 仍是 prototype 或 partial 的区域

| 区域 | 当前口径 |
| --- | --- |
| Store Console 全深度 | Store search/detail/import/version/supplier/docking/audit 已有实现切片，但完整 operator workflow、external IdP、audit/recovery acceptance 仍不足。 |
| `uvp-order-app` | participant app 已独立，有 onboarding、task inbox、evidence/proof、readiness gate，但未被同一条 Base Sepolia Product API 真实任务流完整证明。 |
| executor-kit live operator path | watcher、callback tx helper、Product API signal producer、thin MCP adapter 有测试；生产 token policy、supplier attestation、operator runbook 仍不足。 |
| ops-console | redacted diagnostics 和 safe action prototype 存在，但完整 recovery/action rehearsal 不是 verified。 |
| runtime-host | off-chain reference harness，不是 ETH runtime authority。 |
| Store governance broadcaster | env-key governance 可用于 staging，不是 production governance。 |

## P0 / PRD100-106 摘要

| PRD | 当前口径 |
| --- | --- |
| PRD100 protocol 0.2 freeze | `pnpm verify:protocol-freeze` 已覆盖 StateMachine、TrustRegistry、DeploymentRegistry 和 active Base Sepolia EIP-712 `0.2` domain fixture。 |
| PRD101 release evidence pack | evidence infra 已有，并补入 redacted cost guard 字段；Order App real-staging、Phase 2 full E2E 和 human acceptance 仍未闭合。 |
| PRD102 Product API staging source | 支持 staging rehearsal manifest alias 和 supplier-trust readiness；新的 release claim 仍需要 guarded fresh run。 |
| PRD103 Store publishing loop | draft import 到 active/order-creatable catalog 有 UI 闭环；guarded managed staging Postgres 仍是证明阻塞点。 |
| PRD104 Order App real staging participant gate | 已实现 fail-closed 和钱包/task mismatch 指引。 |
| PRD105 executor-kit signal producer / MCP gate | CLI/SDK tests 和 no-secret normal output 规则已覆盖。 |
| PRD106 staging release-candidate gate | 2026-05-02 commit `ee4fa15` 通过 local Docker Postgres + Base Sepolia broadcast rehearsal；commit `cf010c2` 增加 managed-spend/no-poll/no-spend-safety guard；managed run 仍需在 quota 恢复后重跑。 |

## Release evidence 口径

| 日期 | 记录 | 口径 |
| --- | --- | --- |
| 2026-04-29 | productization baseline | 本地 baseline，不等于 staging 或 production。 |
| 2026-04-30 | Base Sepolia self-update smoke | 协议 chain-native smoke。 |
| 2026-05-01 | Base Sepolia staging-ready checkpoint | Product/Store Base Sepolia managed Postgres/R2/JWT rehearsal passed；not production-ready。 |
| 2026-05-02 | Base Sepolia local-Postgres rehearsal | Product/Store Base Sepolia broadcast rehearsal passed with local Docker Postgres；不是 managed Neon evidence。 |

Release record 只放 redacted、可审计摘要。不要提交 secret、原始日志、Playwright trace、DB dump、object bytes 或临时 local manifest。

## 下一步应补的内容

- 把 Order App real Product API + Base Sepolia participant flow 做成独立 verified 路径。
- 用新的 cost guard evidence pack 重跑一次 managed-staging release candidate，前提是 quota 和双授权都确认。
- 把 Store Console operator workflow 的 search/detail/import/version/supplier/docking/audit/recovery 写成更清晰的工程手册。
- 给 PRD81-93 的 Order Overlay、resource manifest、customs scenario、full E2E gate 建立 Wiki 入口。
- 给 periphery funding/guarantee/payment/agent adapter 写清楚“消费核心接口、不重写核心事实”的实施边界。
- 把 public interface drift checklist 接入具体开发任务页，避免 ABI/hash/DTO 改动漏同步。
