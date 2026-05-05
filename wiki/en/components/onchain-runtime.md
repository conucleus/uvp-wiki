# On-chain Execution, State Machine, and Replay

On-chain execution and replay revolve around `UVPStateMachine`. This page covers contracts, registries, state machine runtime, stage overlay, timers, and event replay.

## Component Chain

```text
ZhixuTrustRegistry attests plan/supplier
  -> UVPStateMachine registers plan/order/authorization
  -> authorized wallets submit signals or stage patches
  -> contract emits status and readiness events
  -> statemachine / rebuildable service replay events
```

## Component Responsibilities

| Component | Responsibility |
| --- | --- |
| `UVPStateMachine` | registers plan/order, stores signal records, evaluates hooks, emits `HookReady`, and handles executor/resource overlays. |
| `ZhixuTrustRegistry` | trust registry, plan attestation/revocation, supplier attestation/revocation. |
| `UVPDeploymentRegistry` | records deployment cutovers and release/deployment breadcrumbs. |
| statemachine package | reference transition model and replay tests to prevent service projections from drifting away from contract semantics. |
| rebuildable service layer / chain-services replay | rebuilds Product order/task/proof/trust projections from chain events. |

## Reading Path

| Page | Purpose |
| --- | --- |
| [Contracts and Registries](../concepts/architecture/components/contracts-registries.md) | responsibilities of `UVPStateMachine`, `ZhixuTrustRegistry`, and `UVPDeploymentRegistry`. |
| [State Machine](../concepts/state-machine.md) | how the contract stores signals, hook runtime, timers, and order state. |
| [Hook Evaluation](../concepts/state-machine/evaluation.md) | how compact hook instructions are evaluated. |
| [Timers and Status](../concepts/state-machine/timers-and-status.md) | timer, Wait/Ready/Cancelled states, and product display. |
| [Stage Overlay: Executor Patch and Resource Patch](../concepts/state-machine/stage-overlay.md) | how executor/resource patches affect a single order without changing the Plan. |
| [Docked Zhixu Runtime](../concepts/state-machine/docking.md) | how local/linked orders, docking links, mapped signals, and docking proof land in state-machine events. |
| [Event Replay](../concepts/state-machine/replay.md) | how the reference reducer recomputes state from chain events. |

## Where the State Machine Belongs

The state machine is a core component: it is part of the on-chain execution environment and the event source. Core concept pages explain objects such as Signal, Hook, and Order; state-machine pages explain how contracts, registries, the replay oracle, and rebuildable service projections work around the same event set.

## Runtime Semantics at a Glance

- `registerPlan()` checks publisher permission, that the plan is non-empty, and that the plan is not duplicated. Plan/supplier trust is expressed by product-configured registry projections, not by a state-machine precondition.
- `triggerOrderFromOutsideFor()` / `triggerOrderFromSignalFor()` bind `orderId` and `planId`, record the trigger fact or parent link, and can also write order-level signal authorizations.
- `submitSignal()` deduplicates by `(orderId, sourceId, signalId)` and checks the authorized submitter and active executor overlay.
- `HookReady` is emitted only when a `trigger=true` hook becomes Ready for the first time.
- `StageExecutorPatchApplied` / `StageExecutorActivated` only change the target stage executor of a single order, not the Plan.
- `StageResourcePatchApplied` only changes the resource reference of a single order and must not be mixed with executor patches.
- `DockedOrderLinked` / `DockedSignalMapped` / `DockedSignalSubmitted` record the docking relation between local and linked orders and the mapped signal proof.

## Runtime Boundary

- Rebuildable service projections rebuild signal and hook truth from events.
- Store review goes into workflow/audit; plan/supplier attestation comes from the trust registry.
- The relayer broadcasts signed transactions; business signatures come from authorized participants.
- The chain replay oracle only verifies event semantics; the ETH runtime authority is the deployed contract.
- Docking relation metadata organizes workflow; a local order continues only with an authorized mapped signal or `DockedSignalSubmitted`.
