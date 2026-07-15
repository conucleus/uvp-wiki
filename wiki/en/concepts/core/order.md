# Order

An Order is an independent fact stream forked from a registered Plan. Once opened and assigned an `orderId`, the protocol promises only that it is registered and can continue accepting rule-compliant facts. Core does not define Order lifecycle states such as `running`, `completed`, or `cancelled`.

## Order Creation

An Order is created against a previously registered Plan through a trigger-order entrypoint:

```text
triggerOrderFromOutsideFor(trigger, authorizations, signature)
triggerOrderFromSignalFor(trigger, authorizations, signature)
```

During creation, the contract:

- checks that the registrar transaction sender is allowed;
- verifies the trigger typed-data signature and recovers the business submitter;
- checks that the plan exists;
- writes order-level signal authorization;
- records the trigger fact or trigger-origin link;
- materializes the ready trigger stage;
- emits `OrderRegistered`, `OrderTriggered`, `OrderMaterialized`, `StageMaterialized`, and `SignalSubmitterAuthorized`.

## Dynamic Facts Inside an Order

| Fact | Source |
| --- | --- |
| signal records | `SignalSubmitted`. |
| hook runtime | `HookStatusChanged`, `HookReady`, `TimerPoked`. |
| executor overlay | `StageExecutorPatchApplied`, `StageExecutorActivated`. |
| resource overlay | `StageResourcePatchApplied`. |
| task projection | Rebuilt by chain-services from `HookReady` and authorization events. |
| proof rows | Event provenance. |
| docking relation | `DockedOrderLinked`, `DockedSignalMapped`, `DockedSignalSubmitted`, plus each side’s own signal/proof records. |

## Order and Product Order

The on-chain Order is a protocol fact container. `ProductOrderDTO` is the product view. Its Order status only says `registered`; stage readiness, pending work, and business outcomes are represented separately by hooks, tasks, and signals and must not be promoted into an Order terminal state.

Product task IDs, Store docking session IDs, and adapter job IDs are workflow indexes. The on-chain identity of the Order is still `orderId`, and its facts come from `UVPStateMachine` events.

## An Order Can Branch and Converge

An Order can contain multiple source causal chains. For example, in cross-border supply, supply, payment, logistics, on-site delivery, and buyer acceptance all progress independently and converge at specific hooks. Its dynamics come from authorized signals entering the same replayable event stream, not from a mutable aggregate lifecycle state.

## No Close or Rewrite Entry Point

An Order does not need to be “closed” to remain consistent. Business participants may stop writing or create a new Order from the same Zhixu. Signals are first-writer-wins. If the first write is wrong, core does not overwrite or delete it; participants create a new Order and the product layer explains the relationship between the two auditable fact streams.

If a stage is taken over by another Zhixu, it usually creates signal binding between the local Order and the linked Order:

```text
local order
  -> trigger hook ready
  -> linked Zhixu order executes
  -> linked proof checked
  -> authorized mapped signal submitted to local order
```

The current contract already exposes runtime docking on a public event surface: `linkDockedOrder` records the local/linked order relationship and signal binding, and `submitDockedSignal` maps an existing signal from the linked Order onto the local Order. Store/Product may keep the sandbox, contacts, operator review, and display state; runtime proof is still determined by the chain events of both Orders.
