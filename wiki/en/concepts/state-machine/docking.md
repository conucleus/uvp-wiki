---
title: Dock and Binding
type: explanation
audience: 工程贡献者
preread: ../core/trigger.md
status: verified
---

# Dock and Binding

> Prerequisite reading: [Birth Signals and Order Entries](../core/trigger.md)

A Dock is the single channel for cross-order collaboration: one Zhixu (side B) publishes an independent `kind: Dock` document declaring "which output signal of which stage is emitted when which fact condition on which source of another Zhixu (side A) holds." At runtime the B order selects a dock executor on its attach stage, writes the A order id, and pokes the window; when the A/B windows intersect, the B output signals are emitted into the B order.

Both orders are independent `UVPStateMachine` orders with the composite identity `(planId, orderId)`. A Dock maps facts that already happened in the A order into emission conditions on the B order; order creation still comes from each order's own birth channel. The invariant overview is in [Protocol Boundaries](../protocol-boundaries.md).

## State-Machine Objects

| Object | Meaning |
| --- | --- |
| Dock document | The B-side `kind: Dock` definition: `spec.from{zhixu,source}` / `spec.to{zhixu,stage}` / `spec.signalMap`; the compiled artifact is `uvp.dock.v1`, identity `dkid = zd-<32hex>`. |
| dock stage | The B-side target stage declaring `executor.supplierType: dock` and `receiveSignals`; its hooks carry the `HOOK_FLAG_DOCK_EXECUTOR` flag. |
| dock executor selection | The order-level patch that selects a dock executor once on the attach stage of one B order; it stays fixed afterwards. |
| binding | The A→B relation determined by the `dock_link` file entry (A order id); its on-chain identity is the seven-word `bindingId`. |
| output window | One row per B output signal: the A window (the A-side `validWhen` program) and the B window (the B-side `sendSignals.validWhen` admission). |

## Registration: the B-Side Dock Declaration

`UVPDockRegistry` (ABI 0.1) holds the static Dock registry. `registerDock` writes the from/to plans, `from.source`, `to.stage`, docHash, and every output's window instruction program (atoms + `SIGNAL` / `NOT` / `AND` / `OR` / `DELAY`). Registration is permissionless, and every output and atom must prove membership against the corresponding plan's `capabilitiesRoot`, so a Dock only references declared signals.

- Identity: `dkid = bytes32(bytes16(docHash))`; `docHash` derives from the Dock document content (domain `uvp:dock-uid:v1`, excluding `metadata.name` / `metadata.annotations`).
- Read surface: `getDock(dkid)` / `dockOutputCount(dkid)` / `getDockOutput(dkid, outputIndex)`; the argument is the **dkid word** (the artifact `dkid` right-padded).
- Event: `DockRegistered` carries the full outputs, atoms, and A-window programs.
- The cloud-track registration endpoint and error codes are in the Dock endpoints of `uvp-cloud.md`; per-syntax acceptance differences across tracks are in `uvp-chain.md` Appendix B in the `uvp-eth` repo.

## Executor Selection: a One-Time Decision of the B Order

The attach stage's dock executor is selected through the order-level stage patch: `UVPStagePatchModule` (ABI 0.1) exposes `selectStageDockSupplier` / `selectStageDockSupplierFor`, which take a `StageDockSupplierSelection`; the selector stage signs it with EIP-712 (domain `stageSupplierPatch` 1; the direct call path uses `msg.sender` as selector).

The contract checks three things: the stage's hooks carry `HOOK_FLAG_DOCK_EXECUTOR`, the selector binding relation holds, and the executor holds order-level authorization for every Dock output signal. Replaying the same dkid + executor is absorbed idempotently; replacing the selection is rejected loudly (`StageDockExecutorAlreadySelected`). The `StageDockExecutorSelected` event records dockId, fromPlanId, executor, selector, and patchHash. Once selected, the executor stays fixed and the dock stage only follows this one-time selection path (generic executor patches reject with `StageExecutorPatchForbiddenOnDockStage`).

## Binding: the A Order Id Is the Relation

A binding is determined by the attach stage's file-map entry `dock_link`: the key is `keccak("dock_link")` and the value is the canonical A order id (`0x` + 64 hex). Writing establishes the binding, rewriting switches it, and the same A order id returns to the same binding.

The on-chain binding identity is seven 32-byte words:

```text
bindingId = keccak256(abi.encode("uvp.dock.binding_id.v1",
  dkid, toPlanId, toOrderId, toStageId, fromPlanId, fromOrderId))
```

The `contentHash` of the `dock_link` file record authenticates the revealed payload only at poke time: a payload that disagrees with the record reverts with `DockBindingContentHashMismatch`. Binding identity, events, views, and fact provenance all use `bindingId`.

## Windows and Emission: Poke

`pokeDockBinding(planId, orderId, targetStageId, payloadContent, fromOrderId, outputCapabilityProofs[])` is the permissionless evaluation entry:

1. verify the `dock_link` payload and content hash, and confirm the A order belongs to the Dock's from plan;
2. evaluate the A window over A-order facts with `evaluateDockWindow` (the same evaluator as hooks; `~` closes on fact arrival, `+T` delays the anchor);
3. for every output, re-check the B-side `sendSignals.validWhen` admission (Ready over the pre-state);
4. write every satisfied output into the B order through `submitDockOutputSignalFromModule`, first-win per output; an output whose A/B windows have not yet intersected stays pending.

Events: `DockBindingPoked` (once per transaction, with bindingId, fromOrderId, executor, and emittedCount) and `DockOutputSubmitted` (once per output, with bindingId, outputIndex, signalId). The B fact's provenance carries the `bindingId`.

## Read Surface and Replay

- On-chain reads: `getStageDockBinding(planId, orderId, targetStageId, fromOrderId)` reports the current binding (dock, executor, fromPlanId, bindingId); `dockOutputWindow(...)` reports current A/B window satisfaction, relative `dueInSeconds`, and emitted status. Historical window times are carried by on-chain events.
- Chain-read DTO: `uvp.dockBinding.v1` (`binding_id`, `dkid`, from/to identities, output windows and emitted flags, `pending`), assembled by chain-services from events and read views; projections must be rebuildable from events.
- Replay: binding state is rebuilt from the dock executor selection record, the `dock_link` file entry, and poke/emission events; replay converges to the same binding set and the same B fact set.

## Boundaries

- Both orders are independent: `(planId, orderId)` composite identity; cross-plan references always carry `planId`, and the two sides are linked by the composite identity.
- Terminal state is driven only by the local stage/order end; a Dock output only expresses the B signal mapped from A-window facts.
- The target `to.stage` declares its binding surface through `receiveSignals`; birth is carried by birth signals only ([Birth Signals and Order Entries](../core/trigger.md)).
- Store trial composition, review, and dock sessions are off-chain workflow material; formal facts are `DockRegistered`, `StageDockExecutorSelected`, `DockBindingPoked`, `DockOutputSubmitted`, and the events of both orders.
- Unknown, pending, reverted, and retryable states stay distinct in the rendered result.

For the executor-perspective narrative, see [Dock Collaboration](../apps/zhixu-as-executor.md).
