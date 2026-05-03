# Contracts and Events

Contract source lives in `uvp-protocol/contracts/uvp-contracts/`.

## Contracts

| Contract | Purpose |
| --- | --- |
| `ZhixuTrustRegistry` | trust domain, plan attestation, supplier attestation, revocation. |
| `UVPStateMachine` | plan/order/signal/hook/timer/stage overlay runtime. |
| `UVPDeploymentRegistry` | versioned state-machine deployment cutover ledger. |
| `ECDSA` | minimal signature recovery helper. |
| `UVPSignatures` | shared signature structs for relayed state-machine signal submission. |

## Public Interface

`UVPStateMachine` public boundary includes:

- constructor args;
- publisher/registrar governance;
- `registerPlan`;
- authorization-bearing `registerOrder` overloads;
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
DomainRegistered
DomainUpdated
DomainOwnerTransferred
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
```

From the contracts directory:

```bash
cd uvp-protocol/contracts/uvp-contracts
forge build
forge test
```

## Funding Boundary

The current contract module core boundary focuses on the state machine, trust registry, and deployment registry. Funding, escrow, custody, settlement, release, refund, dispute-payment, ERC20, and USDC contracts belong to adapter/periphery work. Future funding-related work must define its own authorization, event mapping, tests, and PRD, and consume `UVPStateMachine` signals.
