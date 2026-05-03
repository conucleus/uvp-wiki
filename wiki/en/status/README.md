# Project Status

This page is the Wiki status entry point. It only summarizes implementation, tests, PRD index, and release evidence in the repository, and does not replace `docs/product/README.md`, `docs/IMPLEMENTATION_TRACE.md`, or `uvp-deploy/deploy/releases/`.

## Status Labels

| Status | Meaning |
| --- | --- |
| verified | Supported by code, tests, chain events, or replayable evidence. |
| prototype | There is a usable implementation or UI, but live/staging/operator evidence is insufficient. |
| planned | The PRD or roadmap is defined, but implementation or acceptance is unfinished. |
| blocked | Current acceptance is blocked by external conditions, runtime environment, or a missing gate. |

Do not describe fixture-only, demo fallback, local-only, simulated adapter, or planned PRD work as verified.

## Current Verified Mainline

- Hook DSL parse/eval is centralized in `hook-core` and reused by compiler/statemachine.
- Zhixu can compile into deterministic `HookPlanArtifact` and EVM-facing `OnchainHookPlanArtifact`.
- `ZhixuTrustRegistry` supports domain, plan attestation, supplier attestation, and revocation projection.
- `UVPStateMachine` supports publisher/registrar governance, plan/order registration, order-level signal authorization, first-writer-wins signal handling, hook status, timer, and `HookReady`.
- chain-services can rebuild Product order/task/proof/trust projections from state-machine, trust-registry, and deployment-registry events.
- Product DTO translates chain projections into order/task/proof/trust objects that ordinary users can read.
- Productization-boundary debt has been reduced: DTO/demo fixtures, route trees, frontend entries, Store metadata, and Order App ownership are now separated at the code level.
- The Product/Store Base Sepolia `0.2` rehearsal has a 2026-05-01 managed Postgres/R2/JWT record.
- After the 2026-05-02 managed-provider quota block, a Base Sepolia Product/Store broadcast rehearsal was completed with local Docker Postgres, and a narrower release-candidate evidence set was retained.
- Since 2026-05-02, the current head adds a no-spend guard: managed Postgres/R2 require explicit managed-spend consent, non-local Postgres indexer polling must be zero, and CI includes `no-spend-safety`.

## Areas Still Prototype or Partial

| Area | Current status |
| --- | --- |
| Store Console full depth | Store search/detail/import/version/supplier/docking/audit slices exist, but the full operator workflow, external IdP, and audit/recovery acceptance are still incomplete. |
| `uvp-order-app` | The participant app is independent and has onboarding, task inbox, evidence/proof, and a readiness gate, but it has not yet been fully proven by the same live Base Sepolia Product API task flow. |
| executor-kit live operator path | watcher, callback tx helper, Product API signal producer, and thin MCP adapter are tested; production token policy, supplier attestation, and operator runbook are still incomplete. |
| ops-console | redacted diagnostics and safe action prototypes exist, but the full recovery/action rehearsal is not verified. |
| runtime-host | off-chain reference harness, not the ETH runtime authority. |
| Store governance broadcaster | env-key governance can be used for staging, but it is not production governance. |

## P0 / PRD100-106 Summary

| PRD | Current status |
| --- | --- |
| PRD100 protocol 0.2 freeze | `pnpm verify:protocol-freeze` covers StateMachine, TrustRegistry, DeploymentRegistry, and the active Base Sepolia EIP-712 `0.2` domain fixture. |
| PRD101 release evidence pack | evidence infra exists, with redacted cost-guard fields added; Order App real staging, Phase 2 full E2E, and human acceptance are still open. |
| PRD102 Product API staging source | staging rehearsal manifest alias and supplier-trust readiness are supported; any new release claim still needs a guarded fresh run. |
| PRD103 Store publishing loop | the draft-import to active/order-creatable catalog path has a UI loop; guarded managed staging Postgres is still the proof blocker. |
| PRD104 Order App real staging participant gate | fail-closed handling and wallet/task mismatch guidance are implemented. |
| PRD105 executor-kit signal producer / MCP gate | CLI/SDK tests and no-secret normal-output rules are covered. |
| PRD106 staging release-candidate gate | 2026-05-02 commit `ee4fa15` passed with local Docker Postgres plus the Base Sepolia broadcast rehearsal; commit `cf010c2` added managed-spend/no-poll/no-spend-safety guards; the managed run must be repeated after quota recovery. |

## Release Evidence Summary

| Date | Record | Status |
| --- | --- | --- |
| 2026-04-29 | productization baseline | Local baseline, not staging or production. |
| 2026-04-30 | Base Sepolia self-update smoke | Protocol chain-native smoke. |
| 2026-05-01 | Base Sepolia staging-ready checkpoint | Product/Store Base Sepolia managed Postgres/R2/JWT rehearsal passed; not production-ready. |
| 2026-05-02 | Base Sepolia local-Postgres rehearsal | Product/Store Base Sepolia broadcast rehearsal passed with local Docker Postgres; not managed Neon evidence. |

Release records should contain only redacted, auditable summaries. Do not submit secrets, raw logs, Playwright traces, DB dumps, object bytes, or temporary local manifests.

## What Still Needs to Be Added

- Turn the Order App real Product API + Base Sepolia participant flow into an independent verified path.
- Re-run the managed-staging release candidate with the new cost-guard evidence pack, once quota and dual authorization are confirmed.
- Write a clearer engineering manual for the Store Console operator workflow: search, detail, import, version, supplier, docking, audit, and recovery.
- Add Wiki entry points for the PRD81-93 Order Overlay, resource manifest, customs scenario, and full E2E gate.
- Clarify the implementation boundary for periphery funding/guarantee/payment/agent adapters so they consume core interfaces without rewriting core facts.
- Wire the public-interface drift checklist into concrete development task pages so ABI/hash/DTO changes do not miss a sync point.
