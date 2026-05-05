# Contracts and Events

Contract source lives in `uvp-protocol/contracts/uvp-contracts/`.

## Contracts

| Contract | Purpose |
| --- | --- |
| `ZhixuTrustRegistry` | trust registry, plan attestation, supplier attestation, revocation. |
| `UVPStateMachine` | plan/order/signal/hook/timer/stage overlay runtime. |
| `UVPDeploymentRegistry` | versioned state-machine deployment cutover ledger. |
| `ECDSA` | minimal signature recovery helper. |
| `UVPSignatures` | shared signature structs for relayed state-machine signal submission. |

## Reading Layers

First read the state machine through the basic layer:

- Plan: the compiled and attested version of a Zhixu rulebook.
- Order: one concrete run against a specific Plan hash.
- Signal: a signed business statement from an authorized wallet.
- `HookReady`: the event that opens the next task.

The advanced core layer adds executor overlay, resource overlay, and docked
order composition:

- `StageExecutorPatch` changes who may execute a target stage.
- `StageResourcePatch` publishes resource manifest and policy hashes.
- `DockedOrder` links a local order to another order and maps docked signals.

These advanced surfaces are supported core protocol features, but they should
not be the first concepts shown to ordinary Product users.

## Public Interface

`UVPStateMachine` public boundary includes:

- constructor args;
- publisher/registrar governance;
- `registerPlan`;
- signed `triggerOrderFromOutsideFor` / `triggerOrderFromSignalFor`;
- `submitSignal`;
- `submitSignalFor`;
- `linkDockedOrder` / `linkDockedOrderFor`;
- `submitDockedSignal`;
- `applyStageExecutorPatch` / `applyStageExecutorPatchFor`;
- `applyStageResourcePatch` / `applyStageResourcePatchFor`;
- EIP-712 digest helpers;
- `DOMAIN_SEPARATOR`;
- `pokeTimer`;
- order/plan/hook/status/signal authorization view helpers;
- stage overlay view helpers;
- event topics, function selectors, ABI hash, bytecode hash.

Any change here must update fixtures and be reviewed for adapter impact.

## Stable Events

Indexer and replay tooling should treat these event names as public interface:

```text
OwnershipTransferred
OwnershipTransferred
OwnershipTransferred
PlanAttested
PlanRevoked
SupplierAttested
SupplierRevoked
OwnershipTransferred
PlanPublisherSet
OrderRegistrarSet
PlanPublisherRecorded
OrderRegistrarRecorded
SignalSubmitterAuthorized
PlanRegistered
OrderRegistered
OrderTriggered
OrderLinked
SignalSubmitted
DockedOrderLinked
DockedSignalMapped
DockedSignalSubmitted
StageExecutorPatchApplied
StageResourcePatchApplied
StageExecutorActivated
HookStatusChanged
HookReady
TimerPoked
DeploymentRegistered
DeploymentCanaryMarked
DeploymentActivated
DeploymentDeprecated
DeploymentRetired
```

## Fixture Verification

From the repository root:

```bash
pnpm verify:protocol-freeze
pnpm verify:product-signal-map
```

`verify:protocol-freeze` freezes ABI, events, hashes, and EIP-712 typed data.
`verify:product-signal-map` blocks release when Product Schema permission rows,
compiler signal ids, UI actions, Product BFF authorizations, and trigger-order
authorization hashes disagree.

From the contracts directory:

```bash
cd uvp-protocol/contracts/uvp-contracts
forge build
forge test
```

## Funding Boundary

The current contract module core boundary focuses on the state machine, trust registry, and deployment registry. Funding, escrow, custody, settlement, release, refund, dispute-payment, ERC20, and USDC contracts belong to adapter/periphery work. Future funding-related work must define its own authorization, event mapping, tests, and PRD, and consume `UVPStateMachine` signals.
