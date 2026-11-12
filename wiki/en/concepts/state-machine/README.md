---
title: State Machine
type: meta
audience: 协议读者
preread: ../lifecycle.md
status: verified
---

# State Machine

> Prerequisite reading: [Plan and Order Lifecycle](../lifecycle.md)
The state machine is UVP's core on-chain execution layer and event source: `UVPStateMachine.sol` receives signals submitted by authorized wallets, finds the affected hooks through the Plan's dependency index, evaluates them with a stack machine, and then emits `HookStatusChanged`, `HookReady`, or timer-related events. The ETH runtime authority is the deployed contract; this group of pages explains its runtime semantics.

## Component Responsibilities

| Component | Responsibility |
| --- | --- |
| `UVPStateMachine` | Signature-based plan commit and freeze, order registration, signal records storage, hook evaluation, `HookReady` emission, executor patch and stage file patch handling. |
| `UVPIdentityRegistry` | A thin identity directory operated by the Store; records only subject-to-wallet bindings and revocation by binding. |
| `UVPDeploymentRegistry` | Records deployment cutovers and release/deployment leads. |
| statemachine package | Reference transition model and replay tests used to keep service projections from drifting away from contract semantics. |
| Rebuildable service layer / chain-services replay | Rebuilds Product order/task/proof/identity projections from chain events. |

For contract-level details of the components and registries, see [Contracts and Registries](../contracts-and-registries.md).

## Pages in This Section

| Subpage | Description |
| --- | --- |
| [Hook Evaluation](evaluation.md) | How compact hook instructions are evaluated, and the dedup and authorization checks in `submitSignal()`. |
| [Timers and Status](timers-and-status.md) | Hook status, `dueAt`, `pokeTimer()`, and one-time `HookReady`. |
| [Stage Overlay: Executor Patch and Stage File Patch](stage-overlay.md) | How executor patches and stage file patches overlay a plan at order level (index page). |
| [Executor Patch](executor-patch.md) | Order-level executor selection and handoff. |
| [Stage File Patch](file-patch.md) | Order-level stage file map rewrites (add/replace/remove, baseHash, events, replay). |
| [Dock and Binding](docking.md) | How static Dock declarations, dock-executor selection, `dock_link` bindings, and A/B window poke emission land as state-machine events. |
| [Event Replay](replay.md) | How the reference reducer recomputes state from chain events and validates contract output. |

Quick references: the two-step `commitPlan()` / `finalizePlan()` registration is covered in [Lifecycle](../lifecycle.md) and [On-chain Registration Parameters](../artifacts/solidity-registration.md); birth entries and order-level authorizations are covered in [Birth Signals and Order Entries](../core/trigger.md) and [Signal Authorization](../trust/signal-authorization.md).
