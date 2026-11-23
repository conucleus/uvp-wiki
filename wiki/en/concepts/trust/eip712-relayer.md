---
title: EIP-712 and Relayer
type: explanation
audience: 工程贡献者
status: verified
---

# EIP-712 and Relayer

A relayer can help broadcast transactions, but it cannot make business decisions on behalf of a participant. Business actions must be signed by the wallet of the authorized submitter; "the relayer is not a source of rights" is one of the protocol invariants — see [Protocol Boundaries](../protocol-boundaries.md) for the overview.

## Typed Data

`protocol-bindings` defines browser-safe EIP-712 helpers. Domain versions follow the single mechanical source `uvp-deploy/deploy/compatibility/uvp-stack.v1.json`:

```text
UVPStateMachine (productSubmit)   version = 1
UVPDerivedSignalModule           version = 1
UVPStagePatchModule              version = 1
```

The primary type for signal submission is:

```text
UVPStateMachineSignal
```

The fields include:

```text
planId
orderId
sourceId
signalId
payloadHash
idempotencyKey
submitter
deadline
filesDigest
```

Signal submission uses direct `submitSignal`, and the business identity is `msg.sender`; the `submitter` field appears in the `UVPStateMachineSignal` signing envelope, and product submit signing builds typed data for the deployed contract's domain version.

The call tail of `submitSignal` may carry `attribution` (sourceId, signalId, stageId, capabilityProof), `filesDigest`, and `FilePatch` (the stage file patch): an all-zero attribution means no claim — when the plan declares a capability vocabulary, submitting an off-vocabulary fact without a proof is always rejected (revert `InvalidSignalCapability`), while zero-vocabulary plans admit them. These tail parameters do not enter the EIP-712 signing envelope; the typehash and the signed digest stay unchanged.

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

## Direct Submission

A participant calls `submitSignal()` directly, and the business identity is `msg.sender` (the authorized submitter). A contract executor can be called by a relayer / keeper and still be the submitter when the call reaches the state machine.
