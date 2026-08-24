---
title: EIP-712 and Relayer
type: explanation
audience: 工程贡献者
status: verified
---

# EIP-712 and Relayer

A relayer can help broadcast transactions, but it cannot make business decisions on behalf of a participant. Business actions must be signed by the wallet of the authorized submitter; "the relayer is not a source of rights" is one of the protocol invariants — see [Protocol Boundaries](../protocol-boundaries.md) for the overview.

## Typed Data

`protocol-bindings` defines browser-safe EIP-712 helpers. The current `UVPStateMachine` domain is:

```text
name = UVPStateMachine
version = 0.8
```

The primary type for signal submission is:

```text
UVPStateMachineSignal
```

The fields include:

```text
orderId
sourceId
signalId
payloadHash
idempotencyKey
submitter
deadline
```

`submitSignalFor()` in the contract recovers the signing address and requires the recovered signer to equal `submitter`.

## Relayer Boundary

A relayer can:

- Receive participant signatures.
- Assemble transactions.
- Pay gas or broadcast on behalf of the participant.
- Handle retries, nonces, and RPC failures.

A relayer cannot:

- Forge a submitter signature.
- Choose the business payload for the participant.
- Bypass order-level signal authorization.
- Treat relayer database state as order state.

## Deadline

The signature carries a `deadline`. An expired signature cannot be submitted later, which prevents old business authorizations from being replayed long after they were granted.

## Direct Submission and Forwarded Submission

A participant may also call `submitSignal()` directly, provided `msg.sender` is itself an authorized submitter. The forwarded path uses `submitSignalFor()`, but the final business identity is still the `submitter` inside the signature.
