---
title: Dock Declaration and Trial Pairing
type: explanation
audience: 凝结核成员、Dock 接入方
preread: README.md
status: verified
---

# Dock Declaration and Trial Pairing

> Prerequisite reading: [Zhixu Store](README.md)

Cross-order collaboration is declared by a static `kind: Dock` document published on the B side; the attach stage only declares `executor.supplierType: dock` to receive it. The Store side organizes Dock declaration editing, trial pairing, and review material, and displays projections of on-chain facts. Whether a Dock is registered, whether a binding exists, and whether an output has been emitted follow `UVPDockRegistry` / `UVPStagePatchModule` events and their read views (see [Protocol Boundaries](../protocol-boundaries.md) for the overall boundary).

## The Dock declaration

A Dock is an independent document published alongside `kind: Zhixu`, not inside `Zhixu.spec`; it declares a static A→B time-window subscription:

```yaml
apiVersion: uvp/v0
kind: Dock
metadata:
  name: packing_service
spec:
  from:
    zhixu: zx-9c41f0d27a3e5b86c4d1af0b7e285c36   # A-side content-derived uid (zx-<32hex>)
    source: seller
  to:
    zhixu: zx-2f7a1c9b4e6d8053a1c2b3d4e5f60718   # B-side content-derived uid
    stage: packing                                # B-side dock executor stage
  signalMap:
    cmp: "seller::packing.str & ~seller::packing.cmp"
```

- `spec.from.zhixu` / `spec.from.source`: the A-side definition's content-derived uid and its source; the `signalMap` expression atoms come from signals declared by that source stage's `sendSignals`.
- `spec.to.zhixu` / `spec.to.stage`: the B-side definition uid and target stage; that stage receives via `executor.supplierType: dock` and its output signal names are declared in `sendSignals`.
- `spec.signalMap`: B-side output signal name → A-side `validWhen` expression; the header source is fixed to `spec.from.source` and parsed with the Hook DSL filter profile.

The compiled artifact is `uvp.dock.v1` with identity `dkid = zd-<32hex>`: derived from document content (the canonical document with `metadata.name` / `metadata.annotations` removed yields `docHash`), so any content change yields a new dkid and republishing is idempotent. The interface is expressed entirely by the two stages' declarations: the A-side fact face is the signals declared by `sendSignals` on the `from.source` stage, the B-side output face is `to.stage`'s `sendSignals`, and the B-side binding face is `to.stage`'s `receiveSignals` (the dock stage receive hook).

## What the Store side organizes

The Store side organizes trial-pairing records, review material, and projections of on-chain facts; this is off-chain workflow (see the read-model boundary in [Protocol Boundaries](../protocol-boundaries.md)):

- Edit Dock declaration drafts and validate them against the `kind: Dock` field closure: content-derived identity of the `from` / `to` definition uids, existence of `from.source` and `to.stage`, the dock executor declaration on `to.stage`, `signalMap` output names belonging to `to.stage.sendSignals`, and expression atoms belonging to the `from.source` stage's `sendSignals`.
- Trial pairing checks whether the A/B plans' capability vocabularies cover the `signalMap` atoms and outputs (`UVPDockRegistry.registerDock` proves every atom and every output against a capability proof), and whether the target stage's `sendSignals.validWhen` expresses the B window.
- Generate operator review material and a proof checklist: the declaration text, the compiled `dkid` / `docHash`, capability material, and both plans' identities.
- Display on-chain fact projections: `DockRegistered` (static registration), `StageDockSupplierSelected` (one-time dock executor selection), and `DockBindingPoked` / `DockOutputSubmitted` (binding poke and output emission), plus the chain-services `uvp.dock.v1` / `uvp.dockBinding.v1` read faces. Current A/B window values come live from `getStageDockBinding` / `dockOutputWindow`; window history is not on chain.

Passing trial pairing means the declaration shape and material are complete; protocol facts are still produced by on-chain registration, executor selection, binding, and poke.

## Formal path

```text
The B side publishes the kind: Dock document
  -> both plans are publisher-signed, committed, and finalized (capabilitiesRoot commits atoms and outputs)
  -> UVPDockRegistry.registerDock (permissionless; per-atom / per-output capability proofs)
  -> the B order is created through a birth channel (Dock does not create orders)
  -> selectStageDockSupplier / selectStageDockSupplierFor: the selector signs an EIP-712 one-time dock executor selection
  -> a stage file patch writes dock_link = A order id, establishing the binding
  -> pokeDockBinding evaluates the A window at block.timestamp and rechecks the B-side validWhen, emitting B output signals per output first-win
```

The dock supplier is fixed once selected: replaying the same dkid + supplier is absorbed idempotently, and a different selection reverts with `StageDockSupplierAlreadySelected`. The binding identity is the 7-word `bindingId` (dkid, toPlanId, toOrderId, toStageId, fromPlanId, fromOrderId) with no payload hash or generation; the `dock_link` file record's `contentHash` only authenticates the payload body at poke time and a mismatch reverts with `DockBindingContentHashMismatch`. Poke is permissionless: any caller can advance emission when the A/B windows intersect, and the `DockBindingPoked` / `DockOutputSubmitted` events stay on chain.

## Suggested trial-pairing record

| Field | Description |
| --- | --- |
| from / to | A-side and B-side definition uids (`zx-<32hex>`), `from.source`, `to.stage`. |
| signalMap | B output signal → A-side expression; the compiled per-output AST / dependencies / atoms. |
| Compile identity | The `uvp.dock.v1` `dkid` and `docHash`. |
| Target stage declaration | `executor.supplierType: dock`, `receiveSignals`, `sendSignals` (including `validWhen`). |
| Capability checklist | A-plan atom capability material, B-plan output capability material, and the `supplierBindingsRoot` candidate proof. |
| On-chain facts | `DockRegistered`, `StageDockSupplierSelected`, `DockBindingPoked`, `DockOutputSubmitted`, and both orders' proof. |
| review | Operator notes, risks, approval status; does not enter protocol facts. |

## Boundaries

- A Dock is a static A→B subscription: the two orders are peers, and a Dock creates no order, changes no order id, and moves no facts.
- The Store only organizes declaration drafts, trial pairing, and review material, and displays on-chain fact projections; each fact's owner is defined by [Protocol Boundaries](../protocol-boundaries.md).
- The formal relation is read from the `dock_link` file record and `StageDockSupplierSelected`; output emission from `DockOutputSubmitted`; B-order progress from authorized signals / proof.
- For the full declaration and binding mechanism see [Dock and Binding](../state-machine/docking.md); for the executor view see [Dock Collaboration](../apps/zhixu-as-executor.md).
