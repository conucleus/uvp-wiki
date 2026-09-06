---
title: Zhixu as an Execution Interface
type: explanation
audience: 协议读者、集成工程师
preread: ../core/executor.md
status: verified
---

# Zhixu as an Execution Interface

> Prerequisite reading: [Executor](../core/executor.md)
One Zhixu can act as another Zhixu's stage executor. Executor here means an execution interface: it receives the stage task the local order opens, runs by its own rules, and maps the agreed signals back to the local order.

## Core model

```text
local Zhixu / local order
  -> stage.executor.supplierType = zhixu
  -> zhixuExecutorConfig.target selects an immutable peer UID/version
  -> inputMap/signalMap bind local hooks/signals to target port names
  -> local receive hook becomes ready and opens execution
  -> linked Zhixu / linked order runs with its own plan and authorization
  -> linked proof is checked
  -> authorized mapped signal is submitted to the local order
```

The local order and the linked order are both independent `UVPStateMachine` orders. Each has its own plan, authorization, events, and proof; they do not share and do not need an aggregated lifecycle state. The docking relation states which signals between the two orders can dock; the runtime relation is recorded by docking-link and mapped-signal events.

## Why this design

Real fulfillment is often completed by several independent orders cooperating. A local order for cross-border supply can hand sourcing, customs clearance, settlement, logistics, and on-site delivery to different Zhixu executors. Nesting is also allowed: a local settlement stage can pick the `payment-settlement` Zhixu as its executor, while inside `payment-settlement` its `fiat_bridge` stage can in turn pick `fiat-payout-bridge` as executor. The local order does not need to expand the linked Zhixu's full internal flow; it only needs to know the exposed signal interface, proof, and trust status.

This brings several benefits:

- linked Zhixu are reusable: one `customs-clearance` can serve many local orders;
- linked Zhixu are independently governed: their own plan hash, trust publication, and supplier network stay auditable;
- linked Zhixu evolve independently: the local order picks an active peer Zhixu version through Store configuration;
- linked Zhixu keep internal context: the local order consumes only verifiable proof and mapped signals.

## YAML form

A settlement stage can use another Zhixu as an execution interface like this:

```yaml
- name: fiat_bridge
  source: settlement
  receiveSignals:
    ROUTE_FIAT: settlement::payment.route.use_fiat_bridge
  executor:
    supplierType: zhixu
    zhixuExecutorConfig:
      schemaVersion: uvp.dock.v1
      target:
        zhixu: fiat-payout-bridge
        version: "1"
      order:
        idPolicy: derived-v1
      inputMap:
        ROUTE_FIAT: payout
      signalMap:
        str: payout_started
        cmp: payout_completed
        err: payout_failed
```

The local stage's source is `settlement`; for the exact semantics of the `str/cmp/err` fields see [Protocol meaning of signalMap](#protocol-meaning-of-signalmap).

The docking stage still needs a local `receiveSignals` hook. When it subscribes to a fact in another domain, use `::ANCHOR(@source::task.stage.signal)`. There is no separate `trigger` or `externalSignals` entry field:

```yaml
- name: dock_customs_clearance
  source: customs
  receiveSignals:
    LINK_READY: "::ANCHOR(@customs::clearance.entry.ready)"
  executor:
    supplierType: zhixu
    zhixuExecutorConfig:
      schemaVersion: uvp.dock.v1
      target:
        zhixu: customs-clearance
        version: "1"
      order:
        idPolicy: derived-v1
      inputMap:
        LINK_READY: entrance
      signalMap:
        str: started
        cmp: completed
        err: failed
```

`LINK_READY` is the local subscription hook name. The linked order's start, completion, or failure still returns to the local order through `signalMap`, docking links, proof checks, and authorized mapped signals.

## Protocol meaning of signalMap

The `signalMap` is the semantic contract through which the local stage accepts the linked Zhixu's output.

| Local signal key | Meaning |
| --- | --- |
| `str` | Signal that the linked Zhixu started or accepted the delegation. Currently required by the compiler. |
| `cmp` | Signal that the linked Zhixu completed. Currently required by the compiler. |
| `err` | Signal that the linked Zhixu failed, rejected, or hit an exception. Optional, but most real workflows should configure it. |

The `signalMap` keys must be local stage `sendSignals` and its values must be target output-port names. The `inputMap` keys must be local `receiveSignals` hook names and its values must be target input-port names. The compiler validates target UID/version, port direction, exactly one entrance, port-name syntax, and interface/route roots; `signalMap` no longer carries Hook DSL. `str` and `cmp` mappings are required; `err` is optional.

## Docked runtime path

```text
a receive hook on the local order becomes Ready
  -> Product/Store creates the local stage task
  -> Store selects or confirms the peer Zhixu version
  -> Product/adapter registers or locates the linked order
  -> the linked order executes per its own Plan, authorization, executor
  -> the linked order produces str/cmp/err proof
  -> adapter or Product workflow checks proof and signalMap
  -> openDockedOrder / submitDockedInput / submitDockedSignal or an authorized submitter maps the local signal
  -> the matching hook on the local order goes Ready / Cancelled / next stage
```

Numbering schemes can coexist: on-chain local/linked `orderId`s are created by their own trigger-order entries; Product tasks, Store docking sessions, and adapter jobs may carry their own execution numbers, while runtime proof still resolves back to on-chain order/signal/docking events.

## Runtime proof

A complete docked Zhixu proof covers at least:

| Question | Proof source |
| --- | --- |
| Why did the local stage open for execution? | The local order's `HookReady`. |
| Why is the link-stage entrance valid? | Local `HookReady` / `DockOpened` proof plus interface/route membership proof for the target entrance port. |
| Which plan did the linked Zhixu use? | The linked order's `OrderRegistered` and linked plan projection. |
| Is the linked Zhixu's Plan usable? | The linked StateMachine's `PlanCommitted/PlanFinalized` projection. |
| How did the linked order advance? | The linked order's `SignalSubmitted` / hook proof. |
| How does the local order continue? | The mapped signal on the local order, from either an authorized submitter or `DockOutputSubmitted`. |

The Store can assemble these proofs into one fulfillment card; status truth still comes from each side's own on-chain events.

## Store docking workflow

The Store should run docked Zhixu as an auditable workflow:

```text
choose local stage
  -> search available peer Zhixu UID/version
  -> check linked plan publication and active version
  -> validate inputMap/signalMap against target ports and interface/route roots
  -> save docking session draft
  -> operator review
  -> publish or bind into the local order workflow
  -> openDockedOrder records the local/linked relation
  -> submitDockedSignal or authorized submitter maps the local signal
```

Sandbox validation is trial pairing and review material. Formal runtime requires plan publication, order registration, signal authorization, docking links, and proof.
