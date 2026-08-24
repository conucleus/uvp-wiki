---
title: Contracts and Events
type: reference
audience: 工程贡献者
status: verified
---

# Contracts and Events

Contract source lives in `uvp-protocol/contracts/uvp-contracts/`.

## Contracts

| Contract | Purpose |
| --- | --- |
| `UVPIdentityRegistry` | Offline subject-to-wallet identity binding with per-binding revocation. |
| `UVPStateMachine` | Plan/order/signal/hook/timer/stage overlay runtime. |
| `UVPDeploymentRegistry` | Versioned state-machine deployment cutover ledger. |
| `ECDSA` | Minimal signature recovery helper. |
| `UVPSignatures` | Shared signature structs for relayed state-machine signal submission. |

## Public Interface

The `UVPStateMachine` public boundary includes:

- constructor args;
- module configuration and one-time `freezeModules`;
- signed `commitPlan` and one-time `finalizePlan`;
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

Changing any of this must update the fixture and review adapters.

## Stable Events

Indexer and replay tooling should treat these event names as public interface:

```text
OwnershipTransferred
StateMachineModuleSet
StateMachineModulesFrozen
PlanCommitted
PlanFinalized
PlanPublisherRecorded
OrderRelayerRecorded
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
StageExecutorSignalDelegated
HookStatusChanged
HookReady
TimerPoked
DeploymentRegistered
DeploymentCanaryMarked
DeploymentActivated
DeploymentDeprecated
DeploymentRetired
IdentityBindingRegistered
IdentityBindingRevoked
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

For operating steps see [Troubleshooting](../how-to/troubleshooting.md).

## Funding Boundary

The current contract modules' core boundary focuses on the state machine, the thin identity registry, and the deployment registry. Funding, escrow, custody, settlement, release, refund, dispute-payment, ERC20, or USDC contracts belong to adapter/periphery work; future funding-related work must have independent authorization, event mapping, tests, and PRD, and consume `UVPStateMachine` signals. For the complete boundary see [Protocol Boundaries: Periphery Adapters](../concepts/protocol-boundaries.md#外围适配).
