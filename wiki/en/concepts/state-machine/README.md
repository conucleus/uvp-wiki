---
title: State Machine
type: meta
audience: 协议读者
preread: ../lifecycle.md
status: verified
---

# State Machine

> Prerequisite reading: [Plan and Order Lifecycle](../lifecycle.md)
The state machine is UVP's core on-chain execution layer and event source: `UVPStateMachine.sol` receives signals submitted by assigned supplier accounts, finds the affected hooks through the Plan's dependency index, evaluates them with a stack machine, and then emits `HookStatusChanged`, `HookReady`, or timer-related events. The ETH runtime authority is the deployed contract; this group of pages explains its runtime semantics.

## Component Responsibilities

| Component | Responsibility |
| --- | --- |
| `UVPStateMachine` | Signature-based plan commit and freeze, order birth, signal records storage, hook evaluation, `HookReady` emission, stage supplier patch and stage file write handling. |
| `UVPIdentityRegistry` | The only on-chain identity boundary: subject/account bindings plus the supplier capability/account namespace; the supplier namespace is the execution-authority source. |
| `UVPDeploymentRegistry` | Records deployment cutovers and release/deployment leads. |
| statemachine package | Reference transition model and replay tests used to keep service projections from drifting away from contract semantics. |
| Rebuildable service layer / chain-services replay | Rebuilds Product order/task/proof/identity projections from chain events. |

For contract-level details of the components and registries, see [Contracts and Registries](../contracts-and-registries.md).

## Pages in This Section

| Subpage | Description |
| --- | --- |
| [Hook Evaluation](evaluation.md) | How compact hook instructions are evaluated, and the dedup and authority checks in `submitSignal()`. |
| [Timers and Status](timers-and-status.md) | Hook status, `dueAt`, `pokeTimer()`, and one-time `HookReady`. |
| [Stage Overlay: Supplier Patch and Stage File Writes](stage-overlay.md) | How stage supplier patches and stage file writes overlay a plan at order level (index page). |
| [Stage Supplier Patch](executor-patch.md) | Order-level supplier selection and handoff. |
| [Stage File Writes](file-patch.md) | Order-level `StageFile{key,payload}` writes, overwrites, events, and replay. |
| [Dock and Binding](docking.md) | How static Dock declarations, dock supplier selection, `dock_link` bindings, and A/B window poke emission land as state-machine events. |
| [Event Replay](replay.md) | How the reference reducer recomputes state from chain events and validates contract output. |

Quick references: the two-step `commitPlan()` / `finalizePlan()` registration is covered in [Lifecycle](../lifecycle.md) and [On-chain Registration Parameters](../artifacts/solidity-registration.md); the birth entry and assigned-supplier submission authority are covered in [Birth Signals and Order Entries](../core/trigger.md) and [EIP-712 and Relayer](../trust/eip712-relayer.md).
