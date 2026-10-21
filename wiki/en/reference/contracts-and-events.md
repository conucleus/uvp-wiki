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
| `UVPPlanRegistration` | Plan-lifecycle linked library: `commitPlan` / `finalizePlan` and all registration boundary checks, writing main-contract storage via DELEGATECALL. |
| `UVPPlanMetadataModule` | Plan metadata storage and verification: the `capabilitiesRoot` (capability/binding Merkle tree) and dock route/interface Merkle roots — storage, leaf formulas, and proof verification. |
| `UVPStagePatchModule` | Applying stage executor/resource patches and recording active patches (`applyStageExecutorPatch` / `applyStageResourcePatch`). |
| `UVPDerivedSignalModule` | Signed submission entry for order-to-order derived signals, binding both ends to the `(planId, orderId)` composite identity. |
| `UVPOrderLinkModule` | Order-to-order derived creation: signed `triggerOrderFromSignalFor` and `OrderTriggerLink` registration. |
| `UVPDockingModule` | Unified Zhixu DockRoute: `openDockedOrder` (single-argument `OpenDockCallV1`, gated by target-plan-publisher consent) atomically creates the linked order and records the entrance fact; `attachDockedOrder` attaches an existing target order as a peer; `submitDockedInput` / `submitDockedSignal` write deliveries back. |
| `UVPStateMachineLens` | Read-only lens view aggregation over the state machine and its modules (active patches, docking, plan metadata). |
| `UVPDeploymentRegistry` | Versioned state-machine deployment cutover ledger. |
| `ECDSA` | Minimal signature recovery helper. |
| `UVPSignatures` | Shared signature structs for relayed state-machine signal submission. |

## Public Interface

The `UVPStateMachine` public boundary includes:

- constructor args;
- module configuration and one-time `freezeModules`;
- signed `commitPlan` and one-time `finalizePlan`;
- signed `triggerOrderFromOutsideFor` (the open birth entry on the state machine);
- signed `triggerOrderFromSignalFor` on the order-link module contract `UVPOrderLinkModule` (order-to-order derived creation; on the state machine itself only the module-callable `triggerOrderFromSignalFromModule` exists);
- `submitSignal`;
- `submitSignalFor`;
- the docking module's `openDockedOrder` (`order.mode=new`; the single `OpenDockCallV1` argument wraps the v2 request body plus the target-side consent `DockTargetConsentV1`), which atomically creates the linked order and docking relation;
- the docking module's `submitDockedInput` / `submitDockedSignal`;
- `applyStageExecutorPatch` / `applyStageExecutorPatchFor`;
- `applyStageResourcePatch` / `applyStageResourcePatchFor`;
- EIP-712 digest helpers;
- `DOMAIN_SEPARATOR`;
- `pokeTimer`;
- order/plan/hook/status/signal authorization view helpers;
- stage overlay view helpers;
- event topics, function selectors, ABI hash, bytecode hash.

Changing any of this must update the fixture and review adapters. Current Order identity is resolved as
`(planId, orderId)`; indexers, replay, Product DTOs, and adapters must not infer the Plan from a bare global
`orderId`.

## Event Field Extensions (B-03, ABI v0.16)

Self-contained event extensions (next ABI version batch, 2026-10): the indexer can fully rebuild the authorization surface, per-stage attribution, fork lineage, and governance state from events alone, without view calls. New fields are always appended at the tail of the parameter list; existing field order is untouched; EIP-712 domain versions do not change (event extensions do not alter the signing surface).

| Event | Appended field (tail) | Type | Purpose |
| --- | --- | --- | --- |
| `PlanCommitted` | `birthAuthorizer` | `address` | Outside-birth gate authorizer; rebuilding the authorization surface no longer needs the `planBirthAuthorizer` view. |
| `SignalSubmitted` | `factStageId` | `bytes32` | Fact attribution stage (0 = off-vocabulary fact); per-stage attribution/counters rebuild without the `stageSignalState` view. |
| `OrderForked` | `forkPayloadHash` | `bytes32` | Fork order-id derivation payload (`forkOrderIdFor(planId, parentOrderId, forkPayloadHash)`); the lineage chain is recomputable. |
| `OrderForked` | `replayedFactKeys` | `bytes32[]` | Replayed fact key list (`keccak256(abi.encode(sourceId, signalId))`, same formula as the on-chain `_signalKey`) — a `SignalSubmitted` whose key is in the list is a parent-fact replay; anything else is a fact newly born on the fork order. |
| `DerivedSignalSubmitted` | `relation` | `uint8` | Target-order relation (0 = from==target same-order production, 1 = triggerOrigin write-back); the derived-channel authorization surface rebuilds without order-link views. |

Fields the events already carried but the indexer used to drop, now consumed: `HookStatusChanged.previousStatus` (pre-transition status) and `StageMaterialized.triggerHookId/sourceId/signalId` (stage birth trigger). The governance events `OwnershipTransferred` and `StateMachineModulesFrozen` now land in a projection (`contractGovernance`), so governance state is fully rebuildable.

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
OrderMaterialized
StageMaterialized
SignalSubmitted
DerivedSignalSubmitted
DockOpened
DockAttached
DockInputSubmitted
DockOutputSubmitted
DockOutputSatisfied
StageExecutorPatchApplied
StageResourcePatchApplied
StageExecutorActivated
OrderForked
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

The current contract modules' core boundary focuses on the state machine, the thin identity registry, and the deployment registry. Funding, settlement custody, release, refund, contested payouts, ERC20, or USDC contracts belong to adapter/periphery work; future funding-related work must have independent authorization, event mapping, tests, and PRD, and consume `UVPStateMachine` signals. For the complete boundary see [Protocol Boundaries: Periphery Adapters](../concepts/protocol-boundaries.md#periphery-adapters).
