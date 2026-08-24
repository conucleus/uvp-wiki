---
title: Executor
type: explanation
audience: 协议读者
preread: README.md
status: verified
---

# Executor

An Executor is whoever actually carries a stage at order runtime, produces business actions, or submits signals. It can be a person, an enterprise system, a supplier-deployed wallet, an adapter, an AI/MCP agent — or an independent Zhixu order.

Keep Executor separate from Supplier:

| Object | Problem it solves | Typical authority |
| --- | --- | --- |
| Supplier | The real-world subject in the Store catalog and its off-chain capability profile. | Store metadata + optional `UVPIdentityRegistry` identity binding. |
| Executor | Who actually executes or submits signals for the current order and stage. | `UVPStateMachine` order authorization, stage executor overlay, EIP-712 signatures. |

Supplier is the capability subject and trust subject; Executor is the runtime binding and signal submitter. One Supplier can deploy many executor wallets; one Executor may represent a supplier, an adapter, or an independently runnable Zhixu.

## Who Uses It

Nuclei declare static executors and `selectedStages` on stages; control stages choose active executors at runtime through executor patches; Product/Store/executor-kit route tasks by active executor, present fulfillment instructions, and organize signed submissions.

## What It Produces

Order registration writes order-level signal authorization; executor patches at runtime produce `StageExecutorPatchApplied` and `StageExecutorActivated`, delegating Plan-predeclared signal capability to the current wallet; active-executor submissions become on-chain signals/proof.

## Where Authority Comes From

Who may submit a signal is decided by `UVPStateMachine` order authorization, the stage executor overlay, and EIP-712 signatures; supplier capability profiles are only Store's off-chain judgment (see [Supplier](supplier.md)) and confer no submission right.

## How an Executor Gets Selected

The effective path of an Executor usually is:

```text
Supplier registers in the Zhixu Store
  -> Store maintains capability tags, contacts, fulfillment records, identity projection
  -> Registry operator registers or revokes supplier subject/account binding
  -> Zhixu stage declares what kind of executor or supplier it needs
  -> Order registration writes order-level signal authorization
  -> Control stage may designate the active executor via executor patch
  -> Only the active executor can submit the target stage's business signal
```

Store gives nuclei and operators a candidate network, contact capability, and proof material; on-chain stage bindings, order-level authorization, the active executor overlay, and EIP-712 signatures decide whether an order accepts its submitted signal.

## Static Executor

The DSL `executor` field is the static default configuration in the plan. It expresses "which class of subject this stage expects to carry it". Which wallet holds submission rights in the current order is decided by order authorization and the active executor overlay.

```yaml
executor:
  supplierType: organization
  supplierID: "{{ .customs_broker_uid }}"
```

The static executor enters the compiled artifact's executor routes so Product API, Store, Order App, and executor-kit know who to approach for that stage, which fulfillment instructions to show, and which resources or evidence are needed. Whether a signal is submittable still depends on order registration authorization and runtime overlays.

## Dynamic Active Executor

Some stages have their executor chosen during the run by a control stage carrying the `stage_executor_patch` capability. The control stage must be authorized via `selectedStages` to choose the target stage.

```yaml
selectedStages:
  - customs.complete
sendSignals:
  - select_executor
```

At runtime events like these appear:

```text
StageExecutorPatchApplied(orderId, selectorStageId, targetStageId, selector, executor, ...)
StageExecutorActivated(orderId, targetStageId, executor, ...)
```

The active executor overlay affects only this Order and never modifies the Plan. The patch automatically delegates the current-order signal capability compiled from the target stage's `sendSignals` to the active executor, so wallets appearing only at runtime can be chosen; they can only submit Plan-predeclared signals and cannot expand capability scope via patches. Changing executor affects only signals not yet first-written; existing facts stay unchanged.

## A Zhixu Can Also Be an Executor

One Zhixu can act as another Zhixu's stage executor: it receives the execution interface opened by the local order, runs by its own plan, authorization, and proof path, then maps agreed signals back into the local order via `signalMap`. A typical example: in cross-border supply the settlement stage chooses `payment-settlement`, whose internals may choose `fiat-payout-bridge` as executor. For the full model, DSL syntax, and constraints see [Zhixu as Executor](../apps/zhixu-as-executor.md).

## Runtime Path of Docked Zhixu

The skeleton of docked execution: after the local trigger becomes Ready the docking workflow starts, the linked order executes independently and produces str/cmp/err proof, and after validation `linkDockedOrder`/`submitDockedSignal` or an authorized submitter maps it back into local signals. On-chain orderId can coexist with Product/Store/adapter workflow numbers, while runtime proof returns to on-chain events; see [Zhixu as Executor](../apps/zhixu-as-executor.md) for the detailed path.

## Protocol Meaning of signalMap

`signalMap` is the semantic contract by which a local stage accepts a linked Zhixu's output: `str` and `cmp` are compiler-required, `err` is optional but recommended, and one signalMap must reference a single source. For the field-level semantics table and compiler validation rules see [Zhixu as Executor](../apps/zhixu-as-executor.md).

## Where Executor Kit Fits

`uvp-executor-kit` is the integration toolbox for Executors; see [Executor Kit](../apps/executor-kit.md). It has two equally important entries:

- Chain-native: listen for `HookReady`, route by handler, submit authorized signals.
- Product API: read task/signal containers, prepare evidence, sign, submit, and read proof.

Executor Kit helps executors observe tasks, generate payload hashes, sign, submit, and diagnose blocked reasons.
