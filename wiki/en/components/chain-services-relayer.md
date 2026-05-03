# Relayer

The relayer is the gas payer and transaction broadcaster in the rebuildable service layer. It broadcasts business payloads that have already been signed to chain, and it records retry, confirmation, and failure; business signatures come from the buyer, seller, executor, or selector’s own wallet.

## Code Entry Points

| File | Responsibility |
| --- | --- |
| `src/relayer/service.ts` | relayer runtime entry point and broadcast logic. |
| `src/relayer/types.ts` | relayer request, result, and status types. |
| `src/submissions/broadcast-adapter.ts` | abstract broadcast adapter. |
| `src/submissions/safe-broadcast-adapter.ts` | safe broadcast wrapper that avoids sending unverified payloads directly to chain. |
| `src/config/preflight.ts` | fail-closed checks for runtime env, relayer key, and broadcast flags. |

## Transaction Boundary

```text
participant signs EIP-712 payload
  -> Product API / submission route verifies structure and signer context
  -> relayer pays gas and broadcasts tx
  -> submission/reconcile tracks tx status
  -> indexer sees emitted chain event
```

The relayer key represents only the gas payer, not the business actor. Authority for business actions comes from the EIP-712 signature, order-level signal authorization, active executor overlay, or selector patch authorization.

## What It Can Do

- Broadcast signed payloads.
- Handle RPC errors, nonce conflicts, replacements, retries, and confirmations.
- Record `broadcast_disabled` under a broadcast-disabled profile for local or staging verification.
- Emit redacted diagnostics to help the release gate determine whether the relayer runtime is configured correctly.

## Permission Boundary

- Business signatures are created by authorized participants.
- The signer, order id, stage id, source id, signal id, evidence hash, nonce, and deadline all come from the signed payload.
- The relayer wallet only represents the gas payer, not the submitter.
- “Broadcast succeeded” is a transaction state; fulfillment and ready states come from on-chain events and state-machine evaluation.
- User private keys stay on the user side or in a key management system.

## Testnet Constraints

The Base Sepolia / testnet runtime must use an explicitly configured relayer gas-payer key env and must disable demo/permissive fallbacks. If preflight fails, the service should fail closed instead of degrading to memory mode or silently skipping broadcast.
