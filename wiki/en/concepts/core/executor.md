---
title: Executor
type: explanation
audience: 协议读者
preread: ../README.md
status: verified
---

# Executor

> Prerequisite reading: [Core Concepts](../README.md)
Executor is the DSL role word: the subject that carries a stage, produces business actions, or submits signals for an order at runtime. It can be a person, an enterprise system, a supplier-deployed wallet, an adapter, an AI/MCP agent; for a dock stage, it is the counterparty selected by another Zhixu at runtime. The chain stores no executor entity — only the `stage -> supplierId` assignment and the permanent `supplierId -> supplier account` binding.

Keep Executor separate from Supplier:

| Object | Problem it solves | Typical authority |
| --- | --- | --- |
| Supplier | The real-world subject in the Store catalog and its off-chain capability profile. | Store metadata + the SID/status in the `UVPIdentityRegistry` supplier namespace. |
| Executor | Who actually executes or submits signals for the current order and stage. | `stage -> supplierId` assignment + `UVPIdentityRegistry.accountOf(supplierId)` + EIP-712 signature. |

Supplier is the capability subject and trust subject; executor is the runtime role. One SID binds exactly one supplier account and never rotates; to change addresses, register a new SID and explicitly migrate the zhixu/plan to it.

## Who Uses It

Nuclei declare static suppliers and `selectedStages` on stages; control stages choose the target stage's supplier at runtime through a stage supplier patch; the supplier of a dock stage is selected once by the order on the attach stage. Product/Store/uvp-client route tasks, present fulfillment instructions, and organize signed submissions based on the order's supplier assignment.

## What It Produces

Order creation writes the birth fact; stage supplier patches produce `StageSupplierPatchApplied` (the first-assignment path also emits `StageSupplierAssigned`); dock supplier selection produces `StageDockSupplierSelected`. Submissions by the assigned supplier account become on-chain signals/proof.

## Where Authority Comes From

Who may submit a signal is decided only by the source stage's currently effective assigned supplier account and the EIP-712 signature; supplier capability profiles are only Store's off-chain judgment (see [Supplier](supplier.md)) and confer no submission right.

## How an Executor Gets Selected

```text
Supplier registers in the Store and an on-chain registrar activates the SID
  -> Store maintains capability tags, contacts, fulfillment records, and identity projection
  -> Zhixu stage declares a static supplier, or supplierType: dock, or omits executor (dynamic)
  -> PlanCommit commits default/candidate supplier bindings
  -> after the Order is created, the selector stage's assigned supplier account assigns the target stage's SID through a stage supplier patch
  -> that SID's supplier account submits the target stage's business signals
```

Store gives nuclei and operators a candidate network, contact capability, and proof material; the on-chain `stage -> supplierId` assignment, SID active status, and EIP-712 signature decide whether an order accepts a submitted signal.

## Static Supplier

The DSL `executor` field is the static default configuration in the plan. It expresses "which class of subject this stage expects to carry it".

```yaml
executor:
  supplierType: organization
  supplierID: 7c1d3f52-9a4b-4e68-8f20-3b5d7a9c1e40
```

A plain static supplier must carry a `supplierID` and enters the compiled artifact's supplier route, so Product API, Store, Order App, and uvp-client know who to approach for that stage, which fulfillment instructions to show, and which resources or evidence are needed. The route is off-chain routing metadata; whether a signal is submittable still depends on the assigned supplier account and signature. Birth stages are carried only by static plain suppliers, and their `stage -> SID` assignment is immutable for the order's lifetime — no per-order stage supplier patch applies.

## Dynamic Stage Supplier Patch

Some stages have their supplier chosen during the run by a control stage with a selector binding. The control stage must be authorized via `selectedStages` to choose the target stage.

```yaml
selectedStages:
  - complete
sendSignals:
  - name: select_supplier
```

At runtime events like these appear:

```text
StageSupplierPatchApplied(orderId, selectorStageId, targetStageId, planId, selector, supplierId, previousSupplierId, patchNonce, ...)
StageSupplierAssigned(planId, orderId, targetStageId, supplierId, patchNonce)
```

The stage supplier patch affects only this Order and never modifies the Plan. The patch timing gates are fixed by category: an `assign` with `previousSupplierId == 0` only before the target stage's first signal, and a non-zero `handoff` only after it starts (requiring the previous assigned supplier account's signature over the same digest); a candidate stage must hit the Plan-committed kind=1 leaf in `supplierBindingsRoot` (fixed stages always reject, dynamic stages need no proof, birth/dock stages always reject). The patch only changes `stage -> supplierId`; it writes no authorization set, and existing Signal facts stay unchanged. For the contract check details see [Stage Overlay](../state-machine/stage-overlay.md).

## Dock Supplier

A stage with `supplierType: dock` is carried by another Zhixu, with the supplier identity determined at runtime:

- The order selects a dock supplier once on the attach stage through the stage patch (`selectStageDockSupplier`, or `selectStageDockSupplierFor` with the selector's EIP-712 signature); the same dkid + supplier replay is absorbed, a different selection is loudly rejected, and the selection is then pinned.
- A dock supplier enters neither plan-level supplier routes nor the candidate set; the general stage supplier patch does not carry dock bindings.
- The binding is determined by the stage's `dock_link` file entry — its value is the A order id (canonical `0x` plus 64 hex); `pokeDockBinding` emits the B-side output signals when the A/B time windows intersect, per-output first-win. The full registration, selection, window, and emission semantics are covered in [Zhixu as Executor](../apps/zhixu-as-executor.md) and language-manual §7.

## Where UVP Client Fits

`uvp-client` is the public client for Executors; see [UVP Client](../apps/uvp-client.md). It splits by runtime location into four entries:

- `headless`: private-key wallet handling, watching `HookReady`, routing through handlers, submitting assigned-supplier signals, and maintaining watch state.
- `core`: the shared implementation for signal build/decode/submit, validation, and evidence hashing.
- `browser`: read tasks, sign typed data, and read proofs when the host injects a wallet.
- `cli`: run wallet/doctor/watch/signal from a terminal.

UVP Client helps executors observe tasks, generate payload hashes, sign, submit, and diagnose failures; it creates no order authorization and custodies no default private key.
