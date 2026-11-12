---
title: Dock Collaboration
type: explanation
audience: 协议读者、集成工程师
preread: ../state-machine/docking.md
status: verified
---

# Dock Collaboration

> Prerequisite reading: [Dock and Binding](../state-machine/docking.md)

The single form of cross-order collaboration is a Dock: side B publishes an independent `kind: Dock` document declaring A→B emission conditions; a B order selects a dock executor once on its attach stage, writes the `dock_link` (A order id) to establish the binding, and pokes the A/B windows so satisfied B output signals are emitted into the B order. Side A keeps its own order, authorization, and lifecycle.

## Core Model

```text
Side B publishes a Dock document:
  spec.from = content-derived uid of Zhixu A + source
  spec.to   = content-derived uid of Zhixu B + stage (that stage declares supplierType: dock)
  spec.signalMap: B output signal name -> A-side validWhen expression

B order runtime:
  1. select a dock executor once on the attach stage (stage patch; fixed afterwards)
  2. write dock_link = A order id into the file map -> binding
  3. poke: when the A window (A order facts) and the B window (emission admission) intersect,
     write the B output signals into the B order
  4. B-stage hooks consume those signals and continue the local flow

A order: emits facts as usual; its order id and lifecycle keep their original identity
```

Both orders are independent `UVPStateMachine` orders with the composite identity `(planId, orderId)`; every cross-plan reference carries `planId`. A Dock only maps facts to emission conditions; order creation comes from each order's own birth channel (see [Birth Signals and Order Entries](../core/trigger.md)).

## YAML Form

The B-side target stage declares the dock executor and the binding surface:

```yaml
- name: packing
  source: seller
  executor:
    supplierType: dock
  receiveSignals:
    START: "seller::packing.start"
  sendSignals: [{name: start}, {name: cmp}]
```

Side B publishes the independent Dock document (`uvp.dock.v1`):

```yaml
apiVersion: uvp/v0
kind: Dock
metadata:
  name: packing_service
spec:
  from:
    zhixu: zx-9c41f0d27a3e5b86c4d1af0b7e285c36   # content-derived uid of side A
    source: seller
  to:
    zhixu: zx-2f7a1c9b4e6d8053a1c2b3d4e5f60718     # content-derived uid of side B
    stage: packing
  signalMap:
    cmp: "seller::washing.cmp"
```

| Field | Constraint |
| --- | --- |
| `spec.from.zhixu` / `.source` | content-derived uid of a published definition; the source is declared by one of its stages. |
| `spec.to.zhixu` / `.stage` | content-derived uid of a published definition; the stage takes `supplierType: dock`, and its output signals are declared in `sendSignals`. |
| `spec.signalMap` | key is a B-side output signal name (∈ `to.stage.sendSignals`); value is an A-side Filter expression whose header source is `from.source` and whose atoms lie on declared signals of `from.source` stages. |

## Why This Design

- **B-side static subscription**: the contract is fixed at compile time (`uvp.dock.v1`); runtime only evaluates identity and windows, and new document content yields a new `dkid`.
- **A/B are peers with independent governance**: each side has its own plan, authorization, orders, and proofs; side B decides which A facts to read and which outputs to emit.
- **One-time dock-executor selection**: responsibility is fixed inside the order, re-selection has a named rejection, and the executor must hold order-level authorization for every Dock output signal.
- **Binding expressed by the A order id**: the same A order returns to the same binding and capabilities replay; the binding identity is the seven-word `bindingId`.

## Runtime Path

```text
A order fact submitted
  -> pokeDockBinding (permissionless: reads dock_link, verifies the content hash, evaluates the A window)
  -> B-side sendSignals.validWhen admission re-check
  -> satisfied outputs written into the B order (first-win per output, provenance carries bindingId)
  -> B-stage hooks evaluate / later stages advance
  -> events land in the chain-read projection (uvp.dockBinding.v1)
```

## Proof and Read Surfaces

| Question | Proof source |
| --- | --- |
| Is the Dock declaration registered? | `DockRegistered` and `getDock(dkid)`. |
| Who takes the B stage? | `StageDockExecutorSelected` and `getActiveStageDockSelection` / `activeStageExecutor`. |
| What is the binding identity? | The seven-word `bindingId` and the `dock_link` file record. |
| What are the current A/B windows? | `dockOutputWindow` / `getStageDockBinding` and the `uvp.dockBinding.v1` read surface (relative `dueInSeconds`, no persisted window history). |
| Was a B output emitted? | `DockOutputSubmitted` and `SignalSubmitted` on the B order. |
| How is it replayed? | The selection record + `dock_link` + `DockBindingPoked` / `DockOutputSubmitted` events. |

## Store Workflow

```text
choose the B order and attach stage
  -> publish or select the Dock declaration (obtaining the dkid)
  -> select the dock executor once
  -> write dock_link (A order id)
  -> poke and monitor the window / pending / emitted read surfaces
  -> operator approval stays an off-chain workflow; formal facts come from chain events
```

Trial composition, review, and dock sessions are off-chain workflow material; formal runtime facts are Dock registration, executor selection, binding, and emission events.

## Boundaries

- A/B orders are independent with identity `(planId, orderId)`; cross-plan references carry `planId`, and the two sides are linked by the composite identity.
- A Dock establishes a binding on an existing B order and emits output signals; orders are created by their own order's birth channel.
- Terminal state is driven only by the local stage/order end; output signals express B facts mapped from the A window.
- Store records and chain facts divide as stated in [Protocol Boundaries](../protocol-boundaries.md): chain events are the fact source, and off-chain layers only project and hold workflow state.

For the executor-perspective binding details, see [Dock and Binding](../state-machine/docking.md).
