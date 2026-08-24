---
title: Order App
type: explanation
audience: 参与者、前端工程师
preread: order-app-vs-executor-kit.md
status: verified
---

# Order App

`uvp-order-app/app` is the ordinary participant interface for order fulfillment. Like executor-kit it is a signal producer, but its default reader is human: participants open tasks, check wallet responsibility, prepare evidence fingerprints, confirm signatures, submit, and read proof back.

It does not own order facts. Orders, signals, hooks, and proof come from replayable `UVPStateMachine` events; optional name resolution comes from `UVPIdentityRegistry`. The Order App consumes Product DTOs and signal containers exposed by Chain Services.

```text
Product API /product/me/tasks
  -> task inbox and readiness
  -> evidence fingerprint
  -> prepare-submit typed data
  -> participant wallet signature
  -> submit
  -> proof display
```

## Current code boundary

The following is a snapshot as of writing; the repository is authoritative.

| Surface | Code entry | Description |
| --- | --- | --- |
| API client | `uvp-order-app/app/src/api/productApi.ts` | Reads Product DTOs, tasks, and proof; calls prepare/submit. |
| Participant identity | `uvp-order-app/app/src/auth/`, `src/wallet/` | Explicit wallet filter and browser wallet interaction. |
| Onboarding | `uvp-order-app/app/src/onboarding/` | Invite onboarding and participant entry. |
| Task room | `uvp-order-app/app/src/order-room/`, `src/tasks/` | Shows todos, readiness, blocked reasons, and submit actions. |
| Evidence | `uvp-order-app/app/src/evidence/` | Generates or displays evidence fingerprints without putting business plaintext on chain. |
| Proof | `uvp-order-app/app/src/proof/` | Shows proof rows, submission status, and on-chain provenance. |
| Notifications | `uvp-order-app/app/src/notifications/` | Shows coordination reminders without changing on-chain state. |

## Split from Executor Kit

Order App faces human participants while executor-kit faces automation and enterprise integration; for the common boundary — neither can bypass order-level signal authorization, EIP-712 business signatures, first-writer-wins, and other protocol invariants — see [Common boundaries](order-app-vs-executor-kit.md#common-boundaries), with the invariant overview in [Protocol boundaries](../protocol-boundaries.md).

## Interface language boundary

Ordinary participant interfaces use only task language (todos, submit confirmation, credential fingerprints, proof); HookPlan, sourceId, ABI, calldata, and gas appear only in advanced or debug views — full statement in [Order App vs Executor Kit](order-app-vs-executor-kit.md).

## Related pages

- [Order App vs Executor Kit](order-app-vs-executor-kit.md)
- [Product DTO and User Surfaces](../product/README.md)
- [Executor Kit](executor-kit.md)
- [Chain Services](../services/chain-services.md)
