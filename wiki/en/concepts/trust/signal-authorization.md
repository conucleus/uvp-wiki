# Signal Authorization

Order-level signal authorization answers one very specific question: for this order, which wallet may submit which source / signal. There are two contract paths: explicit authorization written when the Order is created, and dynamic delegation created by an Executor patch within Plan capabilities.

## Contract Authorization Structure

When an order is triggered, `SignalAuthorization[]` is carried by the signed trigger-order request:

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

The compiler turns stage `sendSignals` into Plan `signalCapabilities`. When a valid Executor patch selects a wallet for a target stage, the contract delegates only those predeclared current-order `(sourceId, signalId)` pairs:

- The executor may be a wallet that appears after Order creation; it need not be in a preauthorized candidate list.
- Selector authority comes from `StageSelectorBinding`, internal patch-signal authorization, signatures, and mode constraints.
- Executor signal authority comes from the registered Plan capability combined with the valid patch.
- The patch changes who may execute but cannot add a Signal the Plan did not declare.
- First-writer-wins remains final; changing executor never changes an existing Signal.

## Product Authorization Builder

`ProductAuthorizationBuilder` in the Product BFF converts the product-side `orderPermissionTable` and participant list into contract authorization. It validates:

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

`externalSignals` is a direct backend/executor input contract, not a fixed on-chain `OUTSIDE` signal. The backend first verifies, deduplicates, persists, and normalizes the fact. If an EVM adapter needs to submit that normalized fact to the state machine, authorization must bind to the actual `entry.source` and `entry.signalName`:

```text
sourceId = keccak256(entry.source)
signalId = keccak256(entry.signalName)
submitter = participant/business submitter address
```

The business submitter signs the corresponding trigger or signal typed data; the registrar/relayer only broadcasts it. Broadcasting does not grant business-submission authority.

A docked Zhixu cross-source entry must use an explicit empty-header wrapper (`::OUTSIDE@(...)`, `::MERGE@(...)`, or `::ANCHOR@(task.stage.signal)`), with the same order-level authorization for the actual source/signal. The later `str/cmp/err` mapping for a linked order still follows `signalMap`, docking links, and mapped signal authorization checks.

## Authorization and Task Display

Projections may assign task assignees from explicit authorization or executor delegation, but that is only a product view. When the contract accepts a submission, it checks authority again, so a service-layer display mistake cannot cross the protocol boundary.
