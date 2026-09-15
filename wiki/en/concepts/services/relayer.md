---
title: Relayer
type: explanation
audience: 工程贡献者
status: verified
---

# Relayer

The relayer is a protocol participant **role**, not a standalone service: it is the gas payer and transaction broadcaster that takes participant-signed business payloads to chain. Business signatures always come from the buyer's, seller's, executor's, or selector's own wallet. There is no separate relayer service process or `src/relayer/` module in chain-services — broadcast capability is embedded as adapters inside the submission paths.

## Who Carries It

| Carrier | Responsibility |
| --- | --- |
| `src/submissions/broadcast-adapter.ts`, `src/submissions/safe-broadcast-adapter.ts` | Broadcast adapter and safe wrapper for Product signal submissions; avoids sending unverified payloads straight to chain. |
| `src/stage-patches/broadcast-adapter.ts` | Broadcast assembly for selector-signed stage patches. |
| The order trigger broadcast adapter in `src/product/query/bff/` | On-chain trigger broadcast for order registration. |
| `src/shared/broadcast/`, `src/config/preflight.ts` | Shared broadcast kit, plus fail-closed checks for runtime env, relayer key, and broadcast flags. |

## Transaction Boundary

```text
participant signs EIP-712 payload
  -> Product API / submission route verifies structure and signer context
  -> relayer (broadcast adapter) pays gas and broadcasts tx
  -> submission/reconcile tracks tx status
  -> indexer sees emitted chain event
```

The relayer key represents only the gas payer, never a business actor. Authority for business actions comes from EIP-712 signatures, order-level signal authorization, the active executor overlay, or selector patch authorization.

## Broadcast Adapter Semantics

A broadcast adapter is an explicit declaration, not a default:

- When the environment is non-local, or `UVP_STATE_MACHINE_RELAYER_BROADCAST_ENABLED=true`, a missing broadcast adapter is a startup configuration error — the service refuses to run half-configured.
- In a local run without a configured broadcast adapter, submit returns `broadcastStatus: "not_attempted"`: no nonce is reserved and the audit entry records the submission as skipped. This is explicit local dry-run semantics.
- `broadcast_disabled` is not a capability tier; it only describes these local dry-run semantics.

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
