# Project Status

This page describes the current code baseline. The [version and semantic matrix](../reference/version-matrix.md) and executable repository checks are authoritative.

## Current Mainline

| Area | Current capability |
| --- | --- |
| Core / compiler | The Rust core defines normative Hook semantics; the compiler emits deterministic HookPlan and EVM artifacts. |
| Contracts | `UVPStateMachine` handles Plans, Orders, authorization, Signals, timers, and Hooks; modules registered at deployment are frozen with that deployment. |
| Identity Registry | `UVPIdentityRegistry` records offline subject-to-wallet bindings and supports binding revocation. |
| Chain Services | Rebuilds Plan, Order, task, proof, identity, and deployment projections from chain events and stores off-chain workflow data. |
| Store | Maintains Zhixu presentation, supplier profiles, search, matching, recommendations, contact data, and governance audit data. |
| Order App / executor-kit | Participants read assigned tasks, prepare signatures, submit business actions, and inspect proofs. |

## Current Boundaries

- Plans are published through `UVPStateMachine`; Plan identity is determined by the publisher and committed content.
- Orders contain only the references, participants, and authorizations required for execution.
- Supplier capability, tags, reputation, matching, and recommendations are off-chain Store data.
- The Identity Registry records a Registry's subject/account binding statement. Business authority comes from Plan capabilities and explicit Order authorization.
- Chain events are replayable. Store names, contact details, search data, and workflow state require independent persistence and backups.

## Verification

```bash
pnpm check
pnpm verify:protocol-freeze
pnpm no-spend:safety
pnpm -r --if-present --workspace-concurrency=1 run test
```

Run `forge test` in `uvp-protocol/contracts/uvp-contracts` for contracts. Run `pnpm build` in `zhixu-store/app` for the Store frontend.
