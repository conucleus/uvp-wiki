---
title: Contracts and Events
type: reference
audience: 工程贡献者
status: verified
---

# Contracts and Events

Contract sources live in `uvp-protocol/contracts/uvp-contracts/`, with frozen ABI fixtures under the same directory's `fixtures/`. ABI, event names, EIP-712 domains, and canonical hashes are public interfaces; changes must update fixtures and be reviewed by adapters.

## Contracts and Modules

| Contract | Responsibility |
| --- | --- |
| `UVPIdentityRegistry` | The single on-chain identity boundary: subjectId↔account bindings (owner-registered, revocable) and the supplier capability/account namespace (SID minting, permanent account binding, `pending/active/suspended/revoked`, registrar management). |
| `UVPStateMachine` | Core state machine: plan commit/finalize, `submitSignal` birth and signal submission, hook evaluation, timers, module write-backs, and module-set configuration/freezing. |
| `UVPPlanRegistration` | Plan-lifecycle linked library: `commitPlan` / `finalizePlan` / `submitSignal` and all registration boundary checks, writing main-contract storage via DELEGATECALL. |
| `UVPPlanMetadataModule` | Plan metadata: stores `capabilitiesRoot` (signal capability + stage selector binding Merkle tree) and verifies leaves/membership; `fileWriters` is not in this tree. |
| `UVPStagePatchModule` | Per-order stage supplier patch (`applyStageSupplierPatch` / `applyStageSupplierPatchFor`, using `previousSupplierId` to distinguish first assignment/handoff); one-time dock supplier selection (`selectStageDockSupplier` / `selectStageDockSupplierFor`); binding evaluation and output emission (`pokeDockBinding`). |
| `UVPDockRegistry` | Static Dock registry: `registerDock` stores from/to plan, source/stage, `docHash`, and each output's A-window instruction plan and atoms; read views `getDock` / `dockOutputCount` / `getDockOutput`. |
| `UVPFileResourceModule` | Stage file-map owner: `applyStageFiles` writes `StageFile{string key; bytes payload}` (same key overwrites); accepts only directory calls from `UVPStateMachine`; the only event is `StageFileWritten`. |
| `UVPDerivedSignalModule` | Signed submission entry for in-order derived signals, bound to the composite `(planId, orderId)` identity. |
| `UVPStateMachineLens` | Read-only lens over the state machine and modules: active stage supplier assignment, dock supplier selection, dock binding/output windows, and plan metadata views. |
| `UVPDeploymentRegistry` | Versioned state-machine deployment cutover ledger. |
| `ECDSA` | Minimal signature recovery helper. |
| `UVPSignatures` | Relayed state-machine signal submission shared signature struct. |

## Public Interface

`UVPStateMachine`'s public boundary includes:

- a no-argument constructor;
- module configuration and a one-time `freezeModules`; the seven module slots (stagePatch, derivedSignal, dockRegistry, planMetadata, lens, fileResource, identityRegistry) accept only addresses with code, and the module set is fixed after freezing;
- the publisher-signed six-field `PlanCommit` (publisher, hooksHash, capabilitiesRoot, supplierBindingsRoot, fileWritersHash, deadline) submitted through `commitPlan`, which any relayer may forward; `finalizePlan(bytes32)` is permissionless;
- the single birth/signal entry `submitSignal(SignalSubmission, signature)`: empty `orderId` + trigger signal births an order; a non-empty `orderId` submits a business signal or a pure file write. The contract generates the order id at runtime (`_newOrderId`) and deduplicates by `(submitter, idempotencyKey)`; submission authority is the source stage's current effective assigned supplier account;
- module-only write-backs (derived `submitDerivedSignalFromModule`, dock output `submitDockOutputSignalFromModule`, stage supplier activation, and so on);
- dock directory and queries: `dockRegistry` / `setDockRegistry`, `stageHasDockExecutorHook`, A-window evaluation `evaluateDockWindow`, B-window admission query `isSignalAdmissionSatisfied`;
- `pokeTimer`, `getHookStatus`, `hasSignal`/`getSignal`, `sourceSignalCount`, `lastSignalSubmitter`, native per-stage counting `stageSignalState`, `planRuntimeHash`/`planFileWritersHash`, `DOMAIN_SEPARATOR`;
- event topics, function selectors, ABI hashes, and bytecode hashes.

Module public boundaries include:

- stage patch: `applyStageSupplierPatch` / `applyStageSupplierPatchFor` (the signed entry carries the target candidate SID's leaf proof under `supplierBindingsRoot`), `selectStageDockSupplier` / `selectStageDockSupplierFor`, `pokeDockBinding`;
- dock registry: `registerDock` / `getDock` / `dockOutputCount` / `getDockOutput`;
- file resource: `applyStageFiles` (state-machine directory calls only), `getStageFile`;
- derived signal: `submitDerivedSignal` / `submitDerivedSignalFor`;
- plan metadata: `capabilitiesRoot`, `hasCapabilityVocabulary`, `verifySignalCapability`, `verifyStageSelectorBinding`;
- lens: stage supplier assignment / dock selection / binding views and plan metadata helpers.

## ABI and EIP-712 Domain Versions

The single mechanical reference for versions and frozen ABIs is the compatibility matrix `uvp-deploy/deploy/compatibility/uvp-stack.v1.json`; the authoritative implementation is the contract constants. Signers must build EIP-712 typed data for the deployed contract's domain version.

All frozen ABIs are `0.1`; all EIP-712 domains are `1` (one baseline).

| Boundary | Frozen ABI | EIP-712 domain |
| --- | --- | --- |
| `UVPStateMachine` / productSubmit | `0.1` | `1` (`UVPStateMachineSignalSubmission`, 11 fields) |
| `UVPPlanRegistration` | `0.1` | Main domain `1` (shared constants with the state machine) |
| `UVPStagePatchModule` | `0.1` | `stageSupplierPatch` `1` |
| `UVPDockRegistry` | `0.1` | No signing domain (permissionless registration) |
| `UVPPlanMetadataModule` | `0.1` | None |
| `UVPDerivedSignalModule` | `0.1` | `derivedSignal` `1` |
| `UVPFileResourceModule` | `0.1` | None (submitted with direct `submitSignal`) |
| `UVPIdentityRegistry` | `0.1` | None (subject bindings and supplier namespace) |
| `UVPDeploymentRegistry` | `0.1` | None |
| `UVPStateMachineLens` | `0.1` | None |

Order identity is the composite key `(planId, orderId)`: indexers, replay, Product DTOs, and adapters address it that way and never treat a bare `orderId` as a global key. Dock is not a birth channel; the only order-creation entry is `submitSignal(orderId=0)`.

## Dock Registration and Binding

- **Registration (permissionless)**: `registerDock(fromPlanId, fromSourceId, toPlanId, toStageId, toSourceId, docHash, outputs[])`; each output carries the B-side signal, A-side window instruction plan (atoms + `SIGNAL` / `NOT` / `AND` / `OR` / `DELAY`), and per-atom/per-output capability proofs, verified by `UVPPlanMetadataModule` (`DockOutputCapabilityNotFound` / `DockAtomCapabilityNotFound`).
- **Identity**: `dkid = bytes32(bytes16(docHash))`; `docHash` is content-derived from the Dock document (artifact `uvp.dock.v1`, `dkid = zd-<32hex>`); duplicate registration reverts `DockAlreadyRegistered`. The read views `getDock` / `dockOutputCount` / `getDockOutput` take a **dkid word** (the artifact `dkid` right-padded), not the registration call's fromPlanId.
- **Dock supplier selection (one-time)**: the selector calls `selectStageDockSupplier`, or `selectStageDockSupplierFor` with the selector's EIP-712 signature (domain `stageSupplierPatch` 1); the contract checks the stage's `HOOK_FLAG_DOCK_EXECUTOR` mark, the selector binding, and that the SID is active. Replaying the same dkid + supplier is absorbed idempotently; a different selection reverts `StageDockSupplierAlreadySelected`.
- **Binding (7 words, no payload hash)**: `bindingId = keccak256(abi.encode("uvp.dock.binding_id.v1", dkid, toPlanId, toOrderId, toStageId, fromPlanId, fromOrderId))`; the binding is established by the attached stage's `dock_link` file entry, whose value is the canonical A order id (`0x` + 64 hex). `dock_link`'s `contentHash` authenticates the payload body only at poke time; a mismatch reverts `DockBindingContentHashMismatch`.
- **Window and emission**: `pokeDockBinding` evaluates the A window at `block.timestamp` (same evaluator as hooks; `~` closes on fact arrival, `+T` is anchored delay), then rechecks B-side `sendSignals.validWhen` admission; each output is emitted first-wins (an existing B fact is not overwritten). Historical window times are not on chain; `getStageDockBinding` / `dockOutputWindow` show only the current state and relative `dueInSeconds`.

## Stage File Map

- The owner is `UVPFileResourceModule`; the core `UVPStateMachine` calls it only through `fileResourceModule()`, and the module treats `msg.sender == stateMachine` as its only trust gate.
- The value is `StageFile{string key; bytes payload}`; key ≤128 bytes, payload ≤4096 bytes, at most 16 entries per call; the same key overwrites, and the engine never parses key/payload. The chain defines no `fileType` and carries no type/storage semantics.
- There is no `add` / `replace` / `remove` state machine, no `baseHash` rolling hash, no `patchHash`, no handle or per-key version; entries are written atomically in one transaction, and each key emits `StageFileWritten`.
- The entry is `submitSignal`'s `files: StageFile[]` (not a signature tail parameter or a separate patch entry); `signalId == 0` is a pure file write — it does not increment business signal counts, evaluate hooks, or run admission.
- Write authority: the target stage's assigned supplier account, or a writer stage's assigned supplier account declared in the target's `fileWriters`; self is implicit. `fileWriters` is a `StageFileWriter[]` committed in PlanCommit by `fileWritersHash`.

## Stable Events

Indexers and replay tooling should treat these event names as public interfaces:

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
SignalSubmitted
StageMaterialized
StageSupplierAssigned
HookStatusChanged
HookReady
TimerPoked
```

Module events:

```text
DockRegistered                    # UVPDockRegistry
DockOutputDeferred                # UVPStagePatchModule
StageDockSupplierSelected         # UVPStagePatchModule
StageSupplierPatchApplied         # UVPStagePatchModule
DockBindingPoked                  # UVPStagePatchModule
DockOutputSubmitted               # UVPStagePatchModule
StageFileWritten                  # UVPFileResourceModule
DerivedSignalSubmitted            # UVPDerivedSignalModule
DeploymentRegistered              # UVPDeploymentRegistry
DeploymentCanaryMarked            # UVPDeploymentRegistry
DeploymentActivated               # UVPDeploymentRegistry
DeploymentDeprecated              # UVPDeploymentRegistry
DeploymentRetired                 # UVPDeploymentRegistry
IdentityBindingRegistered         # UVPIdentityRegistry
IdentityBindingRevoked            # UVPIdentityRegistry
SupplierRegistered                # UVPIdentityRegistry
SupplierRegistrarSet              # UVPIdentityRegistry
SupplierStatusChanged             # UVPIdentityRegistry
```

Module events carry the composite `(planId, orderId)` identity; `DockRegistered` carries the full outputs, atoms, and A-window program.

## Self-contained Event Fields

Event parameters alone can rebuild submission authority, per-stage attribution, and dock state without view calls:

| Event | Self-contained fields | Use |
| --- | --- | --- |
| `PlanCommitted` | `hooksHash`, `capabilitiesRoot`, `supplierBindingsRoot` | Rebuild the plan commitment surface; `fileWritersHash` is inside PlanCommit/`planHash` and is not repeated in the event; read it via `planFileWritersHash`. |
| `SignalSubmitted` | `factStageId`, `submitter`, `relayer` | Fact-owning stage, business submitter, and payer; per-stage attribution and counts are rebuildable. |
| `OrderTriggered` | `triggerStageId`, `triggerHookId`, `sourceId`, `signalId`, `submitter` | Birth fact and line; the order id is generated by `_newOrderId` in the transaction. |
| `StageSupplierAssigned` | `supplierId`, `patchNonce` | First stage→SID assignment/materialization path. |
| `StageSupplierPatchApplied` | `selectorStageId`, `targetStageId`, `selector`, `supplierId`, `previousSupplierId`, `patchNonce` | Full per-order assign/handoff change. |
| `StageDockSupplierSelected` | `targetStageId`, `dockId`, `supplierId`, `patchNonce` | One-time dock supplier selection. |
| `DockBindingPoked` | `dockId`, `bindingId`, `fromPlanId`, `fromOrderId`, `supplierId`, `emittedCount` | Binding window evaluation and emission batch. |
| `DockOutputSubmitted` | `bindingId`, `outputIndex`, `signalId`, `supplierId` | Per-output emission fact and provenance. |
| `StageFileWritten` | `key`, `payload`, `submitter` | Per-key file map; indexers replay in log order. |

`HookStatusChanged.previousStatus` and `StageMaterialized.triggerHookId/sourceId/signalId` also enter projections; governance events `OwnershipTransferred` and `StateMachineModulesFrozen` enter the `contractGovernance` projection, so governance state is fully rebuildable.

## Named Error Surface

Dock-path errors are named by cause: `DockBindingContentHashMismatch` (the `dock_link` payload body does not match the recorded hash), `DockBindingPayloadMissing` (the attached stage has no `dock_link` file entry), `DockOrderPlanMismatch` (the A order does not belong to the dock's from plan), `StageDockSupplierAlreadySelected` (re-selecting an already selected dock supplier). Registration follows the same discipline: `DockAlreadyRegistered`, `DockOutputCapabilityNotFound`, `DockAtomCapabilityNotFound`. File paths: `FileWriterUnauthorized`, `StageFileKeyEmpty`, `StageFileKeyTooLong`, `StageFilePayloadTooLarge`, `StageFilesTooMany`, `FileTargetStageUnknown`. Stage patch paths: `StageSupplierNotCandidate`, `StageSupplierPatchForbiddenOnFixedStage`, `StageSupplierPatchForbiddenOnBirthStage`, `StageSupplierPatchForbiddenOnDockStage`, `StageSupplierPatchNonceNotIncreasing`, `StageSupplierPatchPreviousSupplierMismatch`.

## Fixture Verification

From the repository root:

```bash
pnpm verify:protocol-freeze
```

From the contract directory:

```bash
cd uvp-protocol/contracts/uvp-contracts
forge build
forge test
```

Operational steps are in [Troubleshooting](../how-to/troubleshooting.md).

## Funding Boundary

The current core boundary focuses on the state machine, identity registry, and deployment registry. Funding, escrow custody, settlement, release, refund, disputed payouts, ERC20, or USDC contracts belong to application-repository adapters; future funding work must have independent authorization, event mapping, tests, and a PRD, and must consume `UVPStateMachine` signals. For the full boundary see [Protocol Boundaries: Peripheral Adapters](../concepts/protocol-boundaries.md#peripheral-adapters).
