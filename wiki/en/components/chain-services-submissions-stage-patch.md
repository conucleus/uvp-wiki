# Submissions and Stage Patch

Submissions track prepared, signed, broadcast, failed, confirmed, and retryable submission states. Stage Patch is the selector-authorization path for changing the active executor or resource manifest of a target stage within a given order; the Plan itself remains a static version.

## Submissions Code Entry Points

| File | Responsibility |
| --- | --- |
| `src/submissions/service.ts` | submission creation, status transitions, retry, lookup. |
| `src/submissions/store.ts` | storage contract. |
| `src/submissions/sqlite-store.ts`, `postgres-store.ts` | durable submission store. |
| `src/submissions/typed-data.ts` | submission-related typed data and signature verification helpers. |
| `src/submissions/broadcast-adapter.ts` | broadcast adapter interface. |
| `src/submissions/safe-broadcast-adapter.ts` | protected broadcast boundary. |
| `src/api/routes/submissions.ts` | HTTP submission route. |

## Submission Lifecycle

```text
prepare typed data
  -> participant signs
  -> submit signed payload
  -> verify signer and payload structure
  -> broadcast or record broadcast_disabled
  -> track tx hash / failure / retry
  -> indexer confirms chain event
```

Submission state is operational state. It can tell you whether a transaction was sent, failed, or confirmed; whether the order advances to the next stage comes from `SignalSubmitted`, `HookReady`, or stage patch events.

## Stage Patch Code Entry Points

| File | Responsibility |
| --- | --- |
| `src/stage-patches/service.ts` | prepare/submit executor patch or resource patch. |
| `src/stage-patches/typed-data.ts` | selector-signed EIP-712 typed data. |
| `src/stage-patches/broadcast-adapter.ts` | patch broadcast adapter. |
| `src/stage-patches/store.ts` | patch workflow storage. |
| `src/api/routes/stage-patches.ts` | Product task patch routes. |

## Two Kinds of Stage Patch

| Patch | What it changes | Boundary |
| --- | --- | --- |
| executor patch | the active executor of the target stage within a given order. | the Plan and supplier registry stay unchanged, and other signals are still checked against authorization. |
| resource patch | the resource handle / manifest of the target stage within a given order. | evidence plaintext stays off chain, and File Resource policy is still interpreted at the resource layer. |

Executor patches bind the selector signature and the target stage. Resource patches bind `resourceKey`, `manifestHash`, `policyHash`, and `manifestURI`. The two patch types use different fields; production profiles should reject legacy `http`, `txcloud`, and `plain_text` resource handles.

## Boundary

- The selector signature must come from the authorized selector, not from the relayer.
- A patch only affects the overlay of a single order and does not modify the plan version.
- The active executor overlay affects subsequent signal authorization checks; signals that already happened are still governed by events.
- The resource manifest is a handle and hash; evidence plaintext stays off chain.
- Patch workflow rows can be rebuilt or audited; the contract event is the on-chain proof.
