# Order

An Order is one runtime instance of a Plan. It records which signals were accepted, which hooks became ready or cancelled, which executor and resource overlays were applied, and which on-chain proofs correspond to those facts.

## Order Registration

An Order is registered against a previously registered Plan:

```text
registerOrder(orderId, planId, creator, authorizations)
```

During registration, the contract:

- checks that the registrar is allowed;
- checks that the plan exists and is still endorsed by the official domain;
- initializes the runtime for each hook;
- writes order-level signal authorization;
- emits `OrderRegistered` and `SignalSubmitterAuthorized`.

## Dynamic State Inside an Order

| State | Source |
| --- | --- |
| signal records | `SignalSubmitted`. |
| hook runtime | `HookStatusChanged`, `HookReady`, `TimerPoked`. |
| executor overlay | `StageExecutorPatchApplied`, `StageExecutorActivated`. |
| resource overlay | `StageResourcePatchApplied`. |
| task projection | Rebuilt by chain-services from `HookReady` and authorization events. |
| proof rows | Event provenance. |
| docking relation | `DockedOrderLinked`, `DockedSignalMapped`, `DockedSignalSubmitted`, plus each side’s own signal/proof records. |

## Order and Product Order

The on-chain Order is protocol state. `ProductOrderDTO` is the product view. A Product Order translates on-chain fields into stages, tasks, participants, proofs, and ordinary language. The facts still come from `UVPStateMachine` events.

Product task IDs, Store docking session IDs, and adapter job IDs are workflow indexes. The on-chain identity of the Order is still `orderId`, and the on-chain state still comes from `UVPStateMachine` events.

## An Order Can Branch and Converge

An Order can contain multiple source causal chains. For example, in cross-border supply, supply, payment, logistics, on-site delivery, and buyer acceptance all progress independently and converge at specific hooks. The dynamic nature of an Order comes from different authorized signals continuously writing into the same replayable event stream under contract rules.

If a stage is taken over by another Zhixu, it usually creates signal binding between the local Order and the linked Order:

```text
local order
  -> trigger hook ready
  -> linked Zhixu order executes
  -> linked proof checked
  -> authorized mapped signal submitted to local order
```

The current contract already exposes runtime docking on a public event surface: `linkDockedOrder` records the local/linked order relationship and signal binding, and `submitDockedSignal` maps an existing signal from the linked Order onto the local Order. Store/Product may keep the sandbox, contacts, operator review, and display state; runtime proof is still determined by the chain events of both Orders.
