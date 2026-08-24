---
title: Project Status
type: meta
audience: 全部读者
status: verified
---

# Project Status

This page describes only the current code baseline. For concrete versions, the [Version and Semantic Matrix](../reference/version-matrix.md) and the repository's executable checks are authoritative.

## Current Mainline

| Area | Current capability |
| --- | --- |
| Core / compiler | The Rust core defines normative Hook semantics; the compiler emits deterministic HookPlan and EVM artifacts. |
| Contracts | `UVPStateMachine` handles Plans, Orders, authorization, Signals, timers, and Hooks; modules registered at deployment time are frozen with that deployment. |
| Identity Registry | `UVPIdentityRegistry` records offline subject-to-wallet bindings and supports binding revocation. |
| Chain Services | Rebuilds Plan, Order, task, proof, identity, and deployment projections from chain events and carries off-chain workflow data. |
| Store | Maintains Zhixu presentation, supplier profiles, search matching, recommendations, contact data, governance audit data, and other Store data. |
| Order App / executor-kit | Participants read assigned tasks, prepare signatures, submit business actions, and inspect proofs. |

## Current Boundaries

- Plans are published through `UVPStateMachine`; Plan identity is determined jointly by the publisher and the committed content.
- Orders store only the references, participants, and authorizations required for execution.
- Supplier capability, tags, reputation, matching, and recommendations are off-chain Store data.
- The Identity Registry only proves that some Registry recorded a subject/account binding; business authority comes from Plan capabilities together with explicit Order authorization.
- Chain events are replayable; Store names, contact details, search data, and workflow state need independent persistence and backups.
- `uvp-order-app` already has an independent participant-app boundary, but it has not yet been fully proven by a real task flow through the same Base Sepolia Product API.

## Verification Entries

```bash
pnpm check
pnpm verify:protocol-freeze
pnpm no-spend:safety
pnpm -r --if-present --workspace-concurrency=1 run test
```

Contract tests run as `forge test` inside `uvp-protocol/contracts/uvp-contracts`. The Store frontend runs `pnpm build` inside `zhixu-store/app`.
