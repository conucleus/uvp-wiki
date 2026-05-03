# On-chain Execution, State Machine, and Replay

On-chain execution and replay are where the state machine belongs. This page covers contracts, registries, state machine runtime, stage overlay, timers, and event replay.

## Component Chain

```text
ZhixuTrustRegistry attests plan/supplier
  -> UVPStateMachine registers plan/order/authorization
  -> authorized wallets submit signals or stage patches
  -> contract emits status and readiness events
  -> statemachine / non-trusted execution replay events
```

## Component Responsibilities

| Component | Responsibility |
| --- | --- |
| `UVPStateMachine` | registers plan/order, stores signal records, evaluates hooks, emits `HookReady`, and handles executor/resource overlays. |
| `ZhixuTrustRegistry` | trust domain, plan attestation/revocation, supplier attestation/revocation. |
| `UVPDeploymentRegistry` | records deployment cutovers and release/deployment breadcrumbs. |
| statemachine package | reference transition model and replay tests to prevent service projections from drifting away from contract semantics. |
| rebuildable service layer / chain-services replay | rebuilds Product order/task/proof/trust projections from chain events. |

## Read These First

| Page | Purpose |
| --- | --- |
| [Contracts and Registries](../concepts/architecture/components/contracts-registries.md) | responsibilities of `UVPStateMachine`, `ZhixuTrustRegistry`, and `UVPDeploymentRegistry`. |
| [State Machine](../concepts/state-machine.md) | how the contract stores signals, hook runtime, timers, and order state. |
| [Hook Evaluation](../concepts/state-machine/evaluation.md) | how compact hook instructions are evaluated. |
| [Timers and Status](../concepts/state-machine/timers-and-status.md) | timer, Wait/Ready/Cancelled states, and product display. |
| [Stage Overlay](../concepts/state-machine/stage-overlay.md) | how executor/resource patches affect a single order without changing the Plan. |
| [Event Replay](../concepts/state-machine/replay.md) | how the reference reducer recomputes state from chain events. |

## Where the State Machine Belongs

The state machine is a core component: it is part of the on-chain execution environment and the event source. The core concept pages can explain objects such as Signal, Hook, and Order, but the state machine itself should sit in the same component chain as contracts, registries, the replay oracle, and non-trusted execution projections.

## Runtime Semantics at a Glance

- `registerPlan()` checks publisher permission, that the plan is non-empty and not duplicated, and the official trust domain attestation for `(planId, planHash)`.
- `registerOrder()` binds `orderId` and `planId`, initializes hook runtime, and can also write order-level signal authorizations.
- `submitSignal()` deduplicates by `(orderId, sourceId, signalId)` and checks the authorized submitter and active executor overlay.
- `HookReady` is emitted only when a `trigger=true` hook becomes Ready for the first time.
- `StageExecutorPatchApplied` / `StageExecutorActivated` only change the target stage executor of a single order, not the Plan.
- `StageResourcePatchApplied` only changes the resource reference of a single order and must not be mixed with executor patches.

## Runtime Boundary

- Non-trusted execution layer projections rebuild signal and hook truth from events.
- Store review goes into workflow/audit; plan/supplier attestation comes from the trust registry.
- The relayer broadcasts signed transactions; business signatures come from authorized participants.
- The runtime host is the reference harness; the ETH runtime authority is the deployed contract.
- Docking relation metadata organizes workflow; a local order continues only with an authorized mapped signal or `DockedSignalSubmitted`.
