# Zhixu as Executor

One Zhixu can act as the stage executor of another Zhixu. Here, executor means an execution interface: it receives the stage task exposed by the local Zhixu, runs under its own rules, and maps the agreed signal back to the local Zhixu.

## Core Model

```text
local Zhixu / local order
  -> stage.executor.supplierType = zhixu
  -> signalMap declares linked signal mapping
  -> local trigger opens execution
  -> linked Zhixu / linked order runs with its own plan and authorization
  -> linked proof is checked
  -> authorized mapped signal is submitted to local order
```

The local order and the linked order are both independent `UVPStateMachine` orders. Each has its own plan, authorization, events, and proof; they neither share nor require an aggregate lifecycle status. The docking relation explains which signals can be connected between the two Zhixu; the runtime relation is recorded by docking-link and mapped-signal events.

## Why This Design Exists

Real fulfillment often involves several independent Zhixu working together. A local Zhixu for cross-border supply can hand sourcing, customs clearance, settlement, logistics, and on-site delivery to different Zhixu executors. The local order does not need to expand the full internal workflow of the linked Zhixu; it only needs to know the exposed signal interface, proof, and trust status.

This brings several benefits:

- the linked Zhixu can be reused: one `customs-clearance` Zhixu can serve many local orders;
- the linked Zhixu can be governed independently: its own plan hash, trust publication, and supplier network remain auditable;
- the linked Zhixu can evolve independently: the local order can choose a specific active peer Zhixu version through Store configuration;
- the linked Zhixu can preserve internal context: the local order only consumes verifiable proof and mapped signals.

## YAML Form

A settlement stage can use another Zhixu as the execution interface like this:

```yaml
- name: fiat_bridge
  source: settlement
  trigger:
    - ROUTE_FIAT
  receiveSignals:
    ROUTE_FIAT: settlement::payment.route.use_fiat_bridge
  executor:
    supplierType: zhixu
    supplierID: "{{ .fiat_payout_bridge_zhixu_uid }}"
    zhixuExecutorConfig:
      signalMap:
        str: fiat_bridge::payout.start.str
        cmp: fiat_bridge::payout.close.cmp
        err: fiat_bridge::payout.close.err
```

The source of the local stage is `settlement`. It chooses a linked Zhixu as the executor and declares how the linked Zhixu's `str/cmp/err` outputs map into signals that the local Zhixu can consume.

If this docking stage is opened directly by the Product/registrar workflow outside the order, instead of waiting for the previous business signal, the link-stage entrance can be written as `::OUTSIDE`:

```yaml
- name: dock_customs_clearance
  source: customs
  trigger:
    - LINK_READY
  receiveSignals:
    LINK_READY: ::OUTSIDE
  executor:
    supplierType: zhixu
    supplierID: "{{ .customs_clearance_zhixu_uid }}"
    zhixuExecutorConfig:
      signalMap:
        str: customs_peer::clearance.start.str
        cmp: customs_peer::clearance.close.cmp
        err: customs_peer::clearance.close.err
```

`LINK_READY` only opens the local docking workflow. The start, completion, or failure of the linked order still returns to the local order through `signalMap`, docking links, proof checks, and authorized mapped signals.

## Runtime Proof

A complete docked Zhixu proof should cover at least:

| Question | Proof source |
| --- | --- |
| Why was the local stage opened for execution? | `HookReady` on the local order. |
| Who opened the external entrance of the link stage? | The order-level authorization and submission event for the `::OUTSIDE` signal, or the proof of the previous business signal. |
| Which plan did the linked Zhixu use? | `OrderRegistered` and the linked plan projection for the linked order. |
| Is the linked Plan usable? | The linked StateMachine's `PlanCommitted/PlanFinalized` projection. |
| How did the linked order advance? | The linked order's `SignalSubmitted` / hook proof. |
| How did the local order continue? | The mapped signal on the local order, which can come from the authorized submitter or `DockedSignalSubmitted`. |

The Store can combine these proofs into one fulfillment card; the truth of the status still comes from each side's on-chain events.

## Store Docking Workflow

The Store should manage a docked Zhixu as an auditable workflow:

```text
choose local stage
  -> search available peer Zhixu / supplierType=zhixu subjects
  -> check linked plan publication and active version
  -> validate whether signalMap matches the source/signal
  -> save docking session draft
  -> operator review
  -> publish or bind to the local order workflow
  -> linkDockedOrder records the local/linked relation
  -> submitDockedSignal or authorized submitter maps the local signal
```

Sandbox validation is for trial pairing and review materials. Formal runtime requires plan publication, order registration, signal authorization, docking links, and proof.
