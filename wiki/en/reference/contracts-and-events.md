---
title: Contracts and Events
type: reference
audience: 工程贡献者
status: verified
---

# Contracts and Events

Contract source lives in `uvp-protocol/contracts/uvp-contracts/`, with frozen ABI fixtures in `fixtures/` in the same directory. ABI, event names, EIP-712 domains, and canonical hashes are public interfaces; any change requires an explicit fixture update and adapter review.

## Contracts and Modules

| Contract | Purpose |
| --- | --- |
| `UVPIdentityRegistry` | Offline subject-to-wallet identity binding with per-binding revocation (owner-controlled). |
| `UVPStateMachine` | Core state machine: plan commit/finalize, trigger birth, signal submission, hook evaluation, timers, module write-backs, and module-set configuration/freeze. |
| `UVPPlanRegistration` | Plan-lifecycle linked library: `commitPlan` / `finalizePlan` / `forkOrder` and all registration boundary checks, writing main-contract storage via DELEGATECALL. |
| `UVPPlanMetadataModule` | Plan metadata: storage, leaf formulas, and membership-proof verification for `capabilitiesRoot` (the Merkle tree over signal-capability, stage-selector-binding, and file-writer capability leaves). |
| `UVPStagePatchModule` | Order-level executor patch (`applyStageExecutorPatch` / `applyStageExecutorPatchFor`, mode closed set `assign`/`handoff`); one-time dock executor selection (`selectStageDockExecutor` / `selectStageDockExecutorFor`); binding evaluation and output emission (`pokeDockBinding`). |
| `UVPDockRegistry` | Static Dock registry: `registerDock` stores from/to plans, source/stage ids, `docHash`, and each output's A-side window instruction program and atoms; read surface `getDock` / `dockOutputCount` / `getDockOutput`. |
| `UVPFileResourceModule` | Owner of the stage file map: `key -> (contentHash, handle)`; `applyStageFilePatch` applies `add` / `replace` / `remove` and accepts only directory calls from `UVPStateMachine`. |
| `UVPDerivedSignalModule` | Signed submission entry for order-to-order derived signals, binding both ends to the `(planId, orderId)` composite identity. |
| `UVPOrderLinkModule` | Order-to-order derived creation: signed `triggerOrderFromSignalFor` and `OrderLinked` registration. |
| `UVPStateMachineLens` | Read-only lens over the state machine and its modules: active executor patch, dock executor selection, dock binding and output windows, plan metadata views. |
| `UVPDeploymentRegistry` | Versioned state-machine deployment cutover ledger. |
| `ECDSA` | Minimal signature recovery helper. |
| `UVPSignatures` | Shared signature struct for relayed state-machine signal submission. |

## Public Interface

The `UVPStateMachine` public boundary includes:

- the no-argument constructor;
- module configuration and one-time `freezeModules`; module slots accept only addresses with code, and stay fixed after the freeze;
- the publisher-signed six-field `PlanCommit` (publisher, hooksHash, capabilitiesRoot, supplierBindingsRoot, birthAuthorizer, deadline) submitted through `commitPlan` by any relayer; `finalizePlan(bytes32)` is permissionless;
- birth channels: outside trigger (`triggerOrderFromOutsideFor`; when `birthAuthorizer` is a contract, the unsigned direct entry `triggerOrderFromOutsideByAuthorizer`), the order-link module's `triggerOrderFromSignalFor`, and the governance fork `forkOrder`; the orderId is derived purely from birth facts and callers never self-report it;
- `submitSignal`: the only external signal write entry, with identity fixed to `msg.sender` (a contract executor can be paid for by a relayer/keeper); calldata carries a trailing `bytes32 filesDigest` and `FilePatch filePatch`, where `signalId == 0` means a pure file patch;
- module-only write-backs (order-link `triggerOrderFromSignalFromModule`, derived `submitDerivedSignalFromModule`, dock output `submitDockOutputSignalFromModule`, stage executor activation, and so on);
- dock directory and queries: `dockRegistry` / `setDockRegistry`, the dock stage/hook flag query `stageHasDockExecutorHook`, A-window evaluation `evaluateDockWindow`, and the B-window admission query `isSignalAdmissionSatisfied`;
- `pokeTimer`, `getHookStatus`, `isSignalSubmitterAuthorized`, `getSignalAuthorization`, `sourceSignalCount`, `lastSignalSubmitter`, native per-stage counting `stageSignalState`, fork helpers, plan runtime hash helpers, `DOMAIN_SEPARATOR`;
- event topics, function selectors, ABI hash, bytecode hash.

The module public boundaries include:

- stage patch: executor patch (the signed entry carries `bindingProof` + `candidateProof` + `executorAuthorizations`), dock executor selection, `pokeDockBinding`;
- dock registry: `registerDock` / `getDock` / `dockOutputCount` / `getDockOutput`;
- file resource: `applyStageFilePatch` (state-machine directory calls only), `getStageFile`, `stageFilesHash`, `filePatchDigest`;
- derived signal: `submitDerivedSignal` / `submitDerivedSignalFor`;
- order-link: `triggerOrderFromSignalFor`, `getTriggerOriginLink`, `targetOrderRelation`;
- plan metadata: `capabilitiesRoot`, `hasCapabilityVocabulary`, `verifySignalCapability`, `verifyStageSelectorBinding`, `verifyFileWriter`;
- lens: executor patch / dock selection / binding views and plan metadata helpers.

## ABI and EIP-712 Domain Versions

The single mechanical reference for versions and frozen ABIs is the compatibility matrix `uvp-deploy/deploy/compatibility/uvp-stack.v1.json`; the authoritative implementation is the contract constants themselves. Signers must build EIP-712 typed data for the domain version of the deployed contract.

Every frozen ABI is `0.1` and every EIP-712 domain is `1` (one fixed baseline).

| Boundary | Frozen ABI | EIP-712 domain |
| --- | --- | --- |
| `UVPStateMachine` / productSubmit | `0.1` | `1` |
| `UVPPlanRegistration` | `0.1` | main domain `1` (shared constants with the state machine) |
| `UVPStagePatchModule` | `0.1` | `stageSupplierPatch` `1` |
| `UVPDockRegistry` | `0.1` | none (registration is permissionless) |
| `UVPPlanMetadataModule` | `0.1` | none |
| `UVPDerivedSignalModule` | `0.1` | `derivedSignal` `1` |
| `UVPFileResourceModule` | `0.1` | none (submitted with direct `submitSignal`) |
| `UVPSupplierRegistry` | `0.1` | none (the only on-chain execution identity) |
| `UVPIdentityRegistry` | `0.1` | none (grants no execution authority) |
| `UVPDeploymentRegistry` | `0.1` | none |
| `UVPStateMachineLens` | `0.1` | none |

Order identity is the composite key `(planId, orderId)`: indexers, replay, Product DTOs, and adapters address by composite identity and never treat a bare `orderId` as a global primary key. A Dock is not a birth channel; order creation uses only the three birth channels listed on this page.

## Dock Registration and Binding

- **Registration (permissionless)**: `registerDock(fromPlanId, fromSourceId, toPlanId, toStageId, toSourceId, docHash, outputs[])`; each output carries the B-side signal, the A-side window instruction program (atoms + `SIGNAL` / `NOT` / `AND` / `OR` / `DELAY`), and per-atom/per-output capability proofs, which the contract verifies as membership proofs through `UVPPlanMetadataModule` (`DockOutputCapabilityNotFound` / `DockAtomCapabilityNotFound`).
- **Identity**: `dkid = bytes32(bytes16(docHash))`, where docHash derives from Dock document content (the `uvp.dock.v1` artifact's `dkid = zd-<32hex>`); re-registration reverts `DockAlreadyRegistered`. The read surface `getDock` / `dockOutputCount` / `getDockOutput` takes a **dkid word** (artifact `dkid` right-padded with zeros), not the fromPlanId used at registration.
- **Dock executor selection (one-time)**: the selector calls `selectStageDockSupplier`, or `selectStageDockSupplierFor` with the selector's EIP-712 signature (domain `stageSupplierPatch` 1); the contract checks the stage's `HOOK_FLAG_DOCK_EXECUTOR` mark, the selector binding, and that the executor holds order-level authorization for every dock output. Replays of the same dkid + executor are absorbed idempotently; a different selection reverts `StageDockExecutorAlreadySelected`.
- **Binding (seven words, no payload hash)**: `bindingId = keccak256(abi.encode("uvp.dock.binding_id.v1", dkid, toPlanId, toOrderId, toStageId, fromPlanId, fromOrderId))`; the binding is determined by the attached stage's `dock_link` file entry, whose value is the canonical A order id (`0x` + 64 hex). The `dock_link` record's `contentHash` only authenticates the revealed payload in poke; mismatch reverts `DockBindingContentHashMismatch`.
- **Window and emission**: `pokeDockBinding` evaluates the A window against A facts at `block.timestamp` (the same evaluator as hooks; `~` closes on fact arrival and `+T` delays the anchor), then re-checks the B-side `sendSignals.validWhen` admission; each output emits first-win (an already-recorded B fact is never overwritten). Historical window times are not on chain; the read views `getStageDockBinding` / `dockOutputWindow` expose only the current state and relative `dueInSeconds`.

## Stage File Map

- The owner is `UVPFileResourceModule`; the core `UVPStateMachine` calls it only through the `fileResourceModule()` directory, and the module treats `msg.sender == stateMachine` as its only trust gate.
- Entries are `key -> (contentHash, handle)`; `handle` is an opaque, bounded (≤512-byte) reference that the engine never resolves or stores as plaintext. The chain defines no `fileType` and carries no type/storage semantics.
- Ops are `add` (key absent) / `replace` (key present) / `remove` (key present), strictly preconditioned and whole-patch atomic; `baseHash` is mandatory and equals the stage's current file version (`filesHash = keccak256(abi.encode(oldHash, patchHash))`, rolling), and a mismatch rejects the whole request.
- The map always holds exactly one current value per key, with no nonce; an already-applied `patchHash` is absorbed first-win.
- The entry point is the trailing `bytes32 filesDigest` + `FilePatch` on direct `submitSignal`; `signalId == 0` is a pure file patch — it does not increment business signal counts, does not evaluate hooks, and does not run admission.

## Stable Events

Indexer and replay tooling should treat these event names as public interfaces:

```text
OwnershipTransferred
StateMachineModuleSet
StateMachineModulesFrozen
PlanCommitted
PlanFinalized
PlanRegistered
PlanPublisherRecorded
OrderRelayerRecorded
OrderRegistered
OrderMaterialized
OrderTriggered
SignalSubmitterAuthorized
SignalSubmitterRevoked
SignalSubmitted
StageMaterialized
StageExecutorActivated
StageExecutorPatchApplied
OrderForked
HookStatusChanged
HookReady
TimerPoked
```

Module events:

```text
DockRegistered                    # UVPDockRegistry
StageDockExecutorSelected         # UVPStagePatchModule
DockBindingPoked                  # UVPStagePatchModule
DockOutputSubmitted               # UVPStagePatchModule
StageFilePatchApplied             # UVPFileResourceModule
StageFileOpApplied                # UVPFileResourceModule
OrderLinked                       # UVPOrderLinkModule
DerivedSignalSubmitted            # UVPDerivedSignalModule
DeploymentRegistered              # UVPDeploymentRegistry
DeploymentCanaryMarked            # UVPDeploymentRegistry
DeploymentActivated               # UVPDeploymentRegistry
DeploymentDeprecated              # UVPDeploymentRegistry
DeploymentRetired                 # UVPDeploymentRegistry
IdentityBindingRegistered         # UVPIdentityRegistry
IdentityBindingRevoked            # UVPIdentityRegistry
```

Module events carry the composite `(planId, orderId)` identity; `DockRegistered` carries the complete outputs, atoms, and A-window programs.

## Self-contained Event Fields

Event parameters alone are enough to rebuild the authorization surface, per-stage attribution, fork lineage, and governance state, without view calls:

| Event | Self-contained fields | Purpose |
| --- | --- | --- |
| `PlanCommitted` | `hooksHash`, `capabilitiesRoot`, `supplierBindingsRoot`, `birthAuthorizer` | Rebuild the plan commitment surface and the outside-birth authorizer. |
| `SignalSubmitted` | `factStageId` | Fact attribution stage (0 = off-vocabulary fact); per-stage attribution and counters rebuild from it. |
| `OrderForked` | `forkPayloadHash`, `replayedFactKeys` | Fork order-id derivation payload and lineage; keys in the list are parent-fact replays, anything else is newly born on the fork order. |
| `DerivedSignalSubmitted` | `relation` | Target-order relation (0 = from==target same-order production, 1 = triggerOrigin write-back). |
| `StageDockExecutorSelected` | `dockId`, `fromPlanId`, `executor`, `selector`, `patchHash`, `patchNonce`, `metadataURI` | Rebuild the dock executor selection. |
| `DockBindingPoked` | `dockId`, `bindingId`, `fromPlanId`, `fromOrderId`, `executor`, `emittedCount` | Rebuild binding window evaluation and emission batches. |
| `DockOutputSubmitted` | `bindingId`, `outputIndex`, `signalId`, `executor` | Per-output emission facts and provenance. |
| `StageFilePatchApplied` | `patchHash`, `baseHash`, `writerStageId`, `opCount` | File patch batches. |
| `StageFileOpApplied` | `kind`, `key`, `contentHash`, `handle` | Per-op file map entries, replayed in log order. |

`HookStatusChanged.previousStatus` (pre-transition status) and `StageMaterialized.triggerHookId/sourceId/signalId` (stage materialization birth trigger) also feed projections; the governance events `OwnershipTransferred` and `StateMachineModulesFrozen` land in the `contractGovernance` projection, so governance state is fully rebuildable.

## Named Error Surface

Dock-path errors are named by cause: `DockBindingContentHashMismatch` (the `dock_link` payload body does not match the recorded hash), `DockBindingPayloadMissing` (the attached stage has no `dock_link` file entry), `DockExecutorAuthorizationMissing` (the executor lacks order-level authorization for some dock output), `DockOrderPlanMismatch` (the A order does not belong to the dock's from plan), and `StageDockExecutorAlreadySelected` (re-selecting an already selected dock executor). Registration and file paths follow the same discipline: `DockAlreadyRegistered`, `DockOutputCapabilityNotFound`, `DockAtomCapabilityNotFound`; `FileBaseHashMismatch`, `FileWriterUnauthorized`, `FileOpKindInvalid`, `FileKeyExists`, `FileKeyMissing`.

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
