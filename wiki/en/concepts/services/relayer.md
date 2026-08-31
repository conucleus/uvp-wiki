---
title: Relayer
type: explanation
audience: 工程贡献者
status: verified
---

# Relayer

The relayer is the gas payer and transaction broadcaster of the rebuildable service layer. It broadcasts already-signed business payloads to chain and records retries, confirmations, and failures; business signatures come from the buyer's, seller's, executor's, or selector's own wallet.

## Code Entry Points

| File | Responsibility |
| --- | --- |
| `src/relayer/service.ts` | Relayer runtime entry point and broadcast logic. |
| `src/relayer/types.ts` | Relayer request, result, and status types. |
| `src/submissions/broadcast-adapter.ts` | Abstract broadcast adapter. |
| `src/submissions/safe-broadcast-adapter.ts` | Safe broadcast wrapper that avoids sending unverified payloads straight to chain. |
| `src/config/preflight.ts` | Fail-closed checks for runtime env, relayer key, and broadcast flags. |

## Transaction Boundary

```text
participant signs EIP-712 payload
  -> Product API / submission route verifies structure and signer context
  -> relayer pays gas and broadcasts tx
  -> submission/reconcile tracks tx status
  -> indexer sees emitted chain event
```

The relayer key represents only the gas payer, never a business actor. Authority for business actions comes from EIP-712 signatures, order-level signal authorization, the active executor overlay, or selector patch authorization.

## Broadcast Adapter Semantics

A broadcast adapter is an explicit declaration, not a default:

- When the environment is non-local, or `UVP_STATE_MACHINE_RELAYER_BROADCAST_ENABLED=true`, a missing broadcast adapter is a startup configuration error — the relayer refuses to start.
- In a local run without a configured broadcast adapter, submit returns `broadcastStatus: "not_attempted"`: no nonce is reserved and the audit entry records the submission as skipped. This is explicit local dry-run semantics.
- `broadcast_disabled` is no longer a capability tier of the relayer; it only describes these local dry-run semantics.

## What It Can Do

- Broadcast signed payloads.
- Handle RPC errors, nonce conflicts, replacements, retries, and confirmations.
- Emit redacted diagnostics that help the release gate judge whether the relayer runtime is configured correctly.

## Permission Boundaries

- Business signatures are created by authorized participants.
- The signer, order id, stage id, source id, signal id, evidence hash, nonce, and deadline all come from the signed payload.
- The relayer wallet represents only the gas payer, not the submitter.
- "Broadcast succeeded" is a transaction state; fulfillment completion and ready states come from on-chain events and state-machine evaluation.
- User private keys stay on the user side or inside key management systems.

## Testnet Constraints

The Base Sepolia / testnet runtime must use an explicitly configured relayer gas-payer key env. When preflight fails, the service fails closed immediately — no degradation to memory mode, no silent skipping of broadcast. For the complete testnet fail-closed checklist, see [Storage, Migration, and Runtime Profile](storage-runtime.md).
