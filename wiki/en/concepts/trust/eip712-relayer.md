---
title: EIP-712 and Relayer
type: explanation
audience: 工程贡献者
status: verified
---

# EIP-712 and Relayer

A relayer can help broadcast transactions, but cannot make business decisions for a participant. Business actions must be signed by the authorized submitter's wallet; "the relayer is not a source of authority" is one of the protocol invariants — see [Protocol Boundaries](../protocol-boundaries.md) for the overview.

## Typed Data

`protocol-bindings` defines browser-safe EIP-712 helpers. Domain versions follow the single mechanical source `uvp-deploy/deploy/compatibility/uvp-stack.v1.json`:

```text
UVPStateMachine (productSubmit)   version = 1
UVPDerivedSignalModule           version = 1
UVPStagePatchModule              version = 1
```

The primary type for signal submission is `UVPStateMachineSignalSubmission` (11 fields):

```text
UVPStateMachineSignalSubmission(
  bytes32 planId,
  bytes32 orderId,
  bytes32 sourceId,
  bytes32 signalId,
  bytes32 payloadHash,
  bytes32 idempotencyKey,
  bytes32 targetStageId,
  bytes32 filesHash,
  bytes32 attributionHash,
  address submitter,
  uint256 deadline
)
```

The domain is `EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)`, with name `UVPStateMachine` and version `1`. `filesHash = keccak256(abi.encode(StageFile[]))`, and `attributionHash = keccak256(abi.encode(FactAttribution(bytes32 sourceId,bytes32 signalId,bytes32 stageId,bytes32[] capabilityProof)))`; both are inside the typehash. `StageFile` is `{string key; bytes payload}`.

The primary type for Plan registration is `UVPStateMachinePlanCommit`:

```text
UVPStateMachinePlanCommit(
  address publisher,
  bytes32 hooksHash,
  bytes32 capabilitiesRoot,
  bytes32 supplierBindingsRoot,
  bytes32 fileWritersHash,
  uint256 deadline
)
```

## Relayer Boundary

A relayer can:

- Receive participant signatures.
- Assemble transactions.
- Pay gas or broadcast on behalf of the participant.
- Handle retries, nonces, and RPC failures.

A relayer cannot:

- Forge a submitter signature.
- Choose the business payload for the participant.
- Bypass the assigned supplier account's submission authority.
- Treat relayer database state as order state.

## Deadline and the Two Submission Modes

The signature carries a `deadline`. An expired signature cannot be submitted later, which prevents old business authorizations from being replayed long after they were granted.

- **Direct submission**: `signature.length == 0`, and `msg.sender` must equal `submission.submitter`.
- **Relayed submission**: `signature.length > 0`, and `msg.sender` is only the relayer; `submission.submitter` must sign `UVPStateMachineSignalSubmission` (`submitSignal` supports EOA ECDSA and ERC-1271 contract-account signatures; `commitPlan` and module entrypoints accept EOA ECDSA only). The `SignalSubmitted` event records both `submitter` and `relayer`.

In either mode, `submitter` must be the source stage's (at birth, the birth stage's) currently effective assigned supplier account, and that SID must be `active`.
