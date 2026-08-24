---
title: Signal Authorization
type: explanation
audience: 工程贡献者
status: verified
---

# Signal Authorization

Order-level signal authorization answers one very specific question: within this order, which wallet may submit which source/signal. There are two contract paths: explicit authorization written when the Order is registered, and dynamic delegation created by an Executor patch within Plan capabilities.

## Contract Authorization Structure

When an order is registered, `SignalAuthorization[]` can be passed in:

```solidity
struct SignalAuthorization {
    bytes32 sourceId;
    bytes32 signalId;
    address submitter;
    bytes32 role;
    bytes32 metadataHash;
}
```

The contract stores it as:

```text
_signalAuthorizations[orderId][signalKey][submitter]
```

When a signal is submitted, the contract checks whether `orderId + signalKey + submitter` has valid explicit authorization or dynamic executor delegation.

## Dynamic Delegation from Executor Patch

The compiler turns stage `sendSignals` into Plan `signalCapabilities`. When a valid Executor patch selects a wallet for a target stage, the contract automatically creates delegation only for those predeclared current-order `(sourceId, signalId)` pairs:

- The new executor can be a wallet that appears after Order creation; it need not be pre-listed as an authorized candidate.
- The selector's power comes from the `StageSelectorBinding`, internal patch-signal authorization, and signature/mode constraints.
- The executor's signal power comes from the registered Plan capability combined with the valid patch.
- A patch can change only the executor; it cannot add a Signal the Plan did not declare.
- First-writer-wins still applies; an existing Signal never changes because of a handoff.

## Product Authorization Builder

`ProductAuthorizationBuilder` in the Product BFF converts the product-side `orderPermissionTable` and participant list into contract authorizations. It validates:

- The permission table shape is correct.
- The required participant exists.
- Participant IDs are not duplicated.
- The role slot and stage exist.
- The participant has accepted and has a wallet address.
- The initial trigger permission exists.

Common hashes:

```text
sourceId = keccak256(entry.source)
signalId = keccak256(entry.signalName)
role = keccak256("role:" + roleSlotId)
metadataHash = keccak256("uvp:product-bff:authorization:v3:...")
```

## Initial Trigger

An order is created through signed `triggerOrderFromOutsideFor()` / `triggerOrderFromSignalFor()`: the contract binds the order to the finalized `planId`, records either the trigger fact or a trigger-origin link, and can at the same time write the order-level signal authorizations described above.

`externalSignals` is a direct backend/executor input contract, not a fixed on-chain `OUTSIDE` signal. The backend first verifies signatures, deduplicates, persists, and normalizes the fact. If an EVM adapter needs to submit that normalized fact to the state machine, authorization must bind to the actual `entry.source` and `entry.signalName`:

```text
sourceId = keccak256(entry.source)
signalId = keccak256(entry.signalName)
submitter = participant/business submitter address
```

The business submitter signs the corresponding trigger or signal typed data; the registrar/relayer is only responsible for broadcasting. The broadcasting address does not gain business-submission authority by doing so.

A docked Zhixu cross-source entry must use an explicit empty-header wrapper (`::OUTSIDE@(...)`, `::MERGE@(...)`, or `::ANCHOR@(task.stage.signal)`), with the same order-level authorization established for the actual source/signal. The later `str/cmp/err` mapping for a linked order still follows `signalMap`, docking links, and mapped-signal authorization checks.

## Authorization and Task Display

Projections assign task assignees from explicit authorization or executor delegation, but that is only a product view. When the contract actually accepts a submission it re-checks authorization, so a service-layer display mistake cannot cross the protocol boundary (see [Protocol Boundaries](../protocol-boundaries.md)).
