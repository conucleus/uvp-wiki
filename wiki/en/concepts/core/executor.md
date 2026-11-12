---
title: Executor
type: explanation
audience: 协议读者
preread: ../README.md
status: verified
---

# Executor

> Prerequisite reading: [Core Concepts](../README.md)
An Executor is whoever actually carries a stage at order runtime, produces business actions, or submits signals. It can be a person, an enterprise system, a supplier-deployed wallet, an adapter, an AI/MCP agent; for a dock stage, the executor is the counterparty selected by another Zhixu at runtime.

Keep Executor separate from Supplier:

| Object | Problem it solves | Typical authority |
| --- | --- | --- |
| Supplier | The real-world subject in the Store catalog and its off-chain capability profile. | Store metadata + optional `UVPIdentityRegistry` identity binding. |
| Executor | Who actually executes or submits signals for the current order and stage. | `UVPStateMachine` order-level explicit authorization, stage executor-selection records, EIP-712 signatures. |

Supplier is the capability subject and trust subject; Executor is the runtime binding and signal submitter. One Supplier can deploy many executor wallets; one Executor may represent a supplier, an adapter, or the dock executor of an independently run order.

## Who Uses It

Nuclei declare static executors and `selectedStages` on stages; control stages choose the target stage's executor at runtime through executor patches; the executor of a dock stage is selected once by the order on the attach stage. Product/Store/uvp-client route tasks, present fulfillment instructions, and organize signed submissions based on the order's executor records.

## What It Produces

Order creation writes order-level signal authorizations; executor patches at runtime produce `StageExecutorPatchApplied` and `StageExecutorActivated`, and a patch taking effect writes an explicit order-level authorization set for the new executor; dock executor selection produces `StageDockExecutorSelected`. Authorized executor submissions become on-chain signals/proof.

## Where Authority Comes From

Who may submit a signal is decided by the order-level explicit `SignalAuthorization` and EIP-712 signatures; supplier capability profiles are only Store's off-chain judgment (see [Supplier](supplier.md)) and confer no submission right. Executor records only constrain patch timing and routing; they do not replace submission authorization.

## How an Executor Gets Selected

The effective path of an Executor usually is:

```text
Supplier registers in the Zhixu Store
  -> Store maintains capability tags, contacts, fulfillment records, identity projection
  -> Registry operator registers or revokes supplier subject/account binding
  -> Zhixu stage declares a static executor, or supplierType: dock awaiting runtime selection
  -> Order creation writes order-level signal authorization
  -> Control stage may designate the target stage's executor via executor patch
  -> The new executor submits the target stage's business signals after receiving explicit order-level authorization
```

Store gives nuclei and operators a candidate network, contact capability, and proof material; on-chain order-level authorization, executor-selection records, and EIP-712 signatures decide whether an order accepts its submitted signal.

## Static Executor

The DSL `executor` field is the static default configuration in the plan. It expresses "which class of subject this stage expects to carry it".

```yaml
executor:
  supplierType: organization
  supplierID: "{{ .customs_broker_uid }}"
```

A plain static executor must carry a `supplierID` and enters the compiled artifact's executor routes, so Product API, Store, Order App, and uvp-client know who to approach for that stage, which fulfillment instructions to show, and which resources or evidence are needed. Routes are off-chain routing metadata; whether a signal is submittable still depends on order-level explicit authorization and signatures. Birth stages are carried only by static plain executors, and their executor is immutable for the order's lifetime — no per-order executor patch applies.

## Dynamic Executor Patch

Some stages have their executor chosen during the run by a control stage with a selector binding. The control stage must be authorized via `selectedStages` to choose the target stage.

```yaml
selectedStages:
  - complete
sendSignals:
  - name: select_executor
```

At runtime events like these appear:

```text
StageExecutorPatchApplied(orderId, selectorStageId, targetStageId, planId, selector, executor, mode, authorizationsHash, ...)
StageExecutorActivated(planId, orderId, targetStageId, executor, role, metadataHash, patchNonce, metadataURI)
```

The executor patch affects only this Order and never modifies the Plan. The patch timing gates are fixed by category: `assign` only before the target stage has its first signal, `handoff` only after it starts (requiring the previous executor's signature over the same digest); the per-order change target must hit the Plan-committed `executorCandidatesRoot` (plans without a candidate set are fail-closed for executor patches). A patch taking effect writes an explicit order-level authorization set for the new executor (covered by `authorizationsHash`), so wallets appearing only at runtime can be chosen; existing explicit authorizations are not revoked by later patches, and existing Signal facts stay unchanged. For the contract check details see [Stage Overlay](../state-machine/stage-overlay.md).

## Dock Executor

A stage with `supplierType: dock` is carried by another Zhixu, with the executor identity determined at runtime:

- The order selects a dock executor once on the attach stage through the stage patch (`selectStageDockExecutor`, or `selectStageDockExecutorFor` with the selector's EIP-712 signature); the same dkid + executor replay is absorbed, a different selection is loudly rejected, and the selection is then pinned.
- A dock executor enters neither plan-level executor routes nor the candidate set; the general executor patch does not carry dock bindings.
- The binding is determined by the stage's `dock_link` file entry — its value is the A order id (canonical `0x` plus 64 hex); `pokeDockBinding` emits the B-side output signals when the A/B time windows intersect, per-output first-win. The full registration, selection, window, and emission semantics are covered in [Zhixu as Executor](../apps/zhixu-as-executor.md) and language-manual §7.

## Where UVP Client Fits

`uvp-client` is the public client for Executors; see [UVP Client](../apps/uvp-client.md). It splits by runtime location into four entries:

- `headless`: private-key wallet handling, watching `HookReady`, routing through handlers, submitting authorized signals, and maintaining watch state.
- `core`: the shared implementation for signal build/decode/submit, validation, and evidence hashing.
- `browser`: read Product V3 tasks, sign typed data, and read proofs when the host injects a wallet.
- `cli`: run wallet/doctor/watch/signal from a terminal.

UVP Client helps executors observe tasks, generate payload hashes, sign, submit, and diagnose failures; it creates no order authorization and custodies no default private key.
