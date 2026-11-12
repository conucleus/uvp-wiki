---
title: Signal Authorization
type: explanation
audience: 工程贡献者
status: verified
---

# Signal Authorization

Order-level signal authorization answers one very specific question: within this order, which wallet may submit which source/signal. Authorization always resolves to order-level explicit authorization records, written through two paths: when the Order is registered, and by a stage patch within Plan capabilities.

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
_signalAuthorizations[planId][orderId][signalKey][submitter]
```

When a signal is submitted, the contract checks whether `planId + orderId + signalKey + submitter` has a valid order-level explicit authorization.

## Authorization Sets Written by Stage Patches

The compiler turns stage `sendSignals` into Plan `signalCapabilities` (folded into `capabilitiesRoot` on-chain). When a valid stage patch selects a wallet for a target stage, the patch's EIP-712 signature carries `authorizationsHash`, and the contract writes those predeclared current-order `(sourceId, signalId)` authorizations as order-level explicit authorizations; eligibility is proven by the submitter carrying a capability proof (all-zero means no claim):

- The new executor can be a wallet that appears after Order creation; it need not be pre-listed as an authorized candidate.
- The selector's power comes from the `StageSelectorBinding`, internal patch-signal authorization, and the EIP-712 signature/mode constraints.
- The executor's signal power comes from the Plan capability committed in the capability tree combined with the authorization set written by the valid patch.
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

An order is created through signed `triggerOrderFromOutsideFor()` (the open birth entry on `UVPStateMachine`) or `triggerOrderFromSignalFor()` (the derived-creation entry on the order-link module contract `UVPOrderLinkModule`): the contract binds the order to the finalized `planId`, records either the trigger fact or a trigger-origin link, and can at the same time write the order-level signal authorizations described above. The tail of `triggerOrderFromOutsideFor` may carry a `birthFactAttribution` (sourceId, signalId, stageId, capabilityProof) declaring the owner stage of the birth fact; all-zero means no claim — when the plan declares a capability vocabulary, an off-vocabulary fact without a proof is always rejected (revert `InvalidSignalCapability`); only zero-vocabulary plans admit off-vocabulary facts.

External facts are normalized by the backend/executor into a concrete `source`/`signal`, then handled through the current Plan's `receiveSignals` or trigger entry; they are not a fixed on-chain `OUTSIDE` signal. The backend first verifies signatures, deduplicates, persists, and normalizes the fact. If an EVM adapter needs to submit that normalized fact to the state machine, authorization must bind to the actual `entry.source` and `entry.signalName`:

```text
sourceId = keccak256(entry.source)
signalId = keccak256(entry.signalName)
submitter = participant/business submitter address
```

The business submitter signs the corresponding trigger or signal typed data; the registrar/relayer is only responsible for broadcasting. The broadcasting address does not gain business-submission authority by doing so. Authorization keys and events must retain `(planId, orderId)` and must not assign facts to a Plan from a bare `orderId`.

The dock stage executor selection follows the same stage-patch path: `selectStageDockExecutor` / `selectStageDockExecutorFor` takes a selector-signed EIP-712 selection whose authorization set must cover every output signal of the Dock (otherwise revert `DockExecutorAuthorizationMissing`), and those authorizations are written as order-level explicit authorizations. The `dock_link` file record, the binding, and `pokeDockBinding` only emit outputs under existing order-level authorization and the A/B windows; they add no order-level authorization. The A-side window is evaluated from the `spec.signalMap` expressions, and each B-side output's emission admission is rechecked against `sendSignals.validWhen`.

## Authorization and Task Display

Projections assign task assignees from explicit authorization or executor delegation, but that is only a product view. When the contract actually accepts a submission it re-checks authorization, so a service-layer display mistake cannot cross the protocol boundary (see [Protocol Boundaries](../protocol-boundaries.md)).
