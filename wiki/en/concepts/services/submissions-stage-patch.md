---
title: Submissions and Stage Patch
type: reference
audience: 应用开发者
status: verified
---

# Submissions and Stage Patch

Submissions track prepared, signed, broadcast, failed, confirmed, and retryable submission states. Stage Patch is the selector-authorization path for changing the executor or resource manifest of a target stage within a given order; the Plan itself remains a static version.

## Submissions Code Entry Points

| File | Responsibility |
| --- | --- |
| `src/submissions/service.ts` | Submission creation, status transitions, retry, lookup. |
| `src/submissions/store.ts` | Storage contract. |
| `src/submissions/sqlite-store.ts`, `postgres-store.ts` | Durable submission store. |
| `src/submissions/typed-data.ts` | Submission-related typed data and signature verification helpers. |
| `src/submissions/broadcast-adapter.ts` | Broadcast adapter interface. |
| `src/submissions/safe-broadcast-adapter.ts` | Protected broadcast boundary. |
| `src/api/routes/submissions.ts` | HTTP submission route. |

## Order BFF Code Entry Points

| File | Responsibility |
| --- | --- |
| `src/product/bff/service.ts` | Draft, invite, participant, submit workflow. |
| `src/product/bff/authorization.ts` | Product authorization builder. |
| `src/product/bff/trigger.ts` | Broadcast adaptation and submission path for order registration/trigger. |
| `src/product/bff/store.ts` | BFF storage contract. |
| `src/product/bff/sqlite-store.ts`, `postgres-store.ts` | Durable draft/workflow store. |
| `src/product/bff/types.ts` | Draft, invite, participant, registration types. |
| `src/api/routes/product-bff.ts` | HTTP route. |

## Submission Lifecycle

```text
prepare typed data
  -> evidence / payload hash binding
  -> participant signs EIP-712 typed data
  -> submit signed payload
  -> verify signer and payload structure
  -> broadcast, or record "not_attempted" (local explicit dry-run: no nonce reserved, audit records skipped)
  -> track tx hash / failure / retry
  -> indexer confirms chain event
```

The signal submission entry point does not make ordinary users handle sourceId, signalId, ABI, or gas. It first prepares a readable summary and EIP-712 typed data, which the authorized wallet then signs.

Submission state is operational state. It can say whether a transaction was sent, failed, or confirmed; whether the order advances to the next stage comes from `SignalSubmitted`, `HookReady`, or stage patch events.

## Stage Patch Code Entry Points

| File | Responsibility |
| --- | --- |
| `src/stage-patches/service.ts` | Prepare/submit an executor patch or resource patch. |
| `src/stage-patches/typed-data.ts` | Selector-signed EIP-712 typed data. |
| `src/stage-patches/broadcast-adapter.ts` | Patch broadcast adapter. |
| `src/stage-patches/store.ts` | Patch workflow storage. |
| `src/api/routes/stage-patches.ts` | Product task patch routes. |

## The Two Kinds of Stage Patch

An executor patch selects or replaces a given order's active executor; a resource patch binds a stage resource manifest. The typed data is maintained jointly by protocol bindings and Chain Services; whether the patch is ultimately accepted is still decided by contract permissions, signatures, and nonces.

| Patch | What it changes | Boundary |
| --- | --- | --- |
| Executor patch | The active executor of the target stage within one order. | Plan and supplier directory stay unchanged; other signals are still checked against authorization. |
| Resource patch | The resource handle / manifest of the target stage within one order. | Evidence plaintext stays off chain; File Resource policy is still interpreted at the resource layer. |

## Boundaries

The following boundaries are the [protocol boundary overview](../protocol-boundaries.md) made concrete on the submission path; for patch authorization and trust semantics see also [Stage Patch Authorization](../trust/stage-patch.md).

- The selector signature must come from the authorized selector, not from the relayer.
- A patch only affects a single order's overlay and does not modify the plan version.
- The active executor overlay affects subsequent signal authorization checks; signals that already happened remain governed by events.
- A resource manifest is handles and hashes; evidence plaintext stays off chain.
- Patch workflow rows can be rebuilt or audited; the contract event is the on-chain proof.
