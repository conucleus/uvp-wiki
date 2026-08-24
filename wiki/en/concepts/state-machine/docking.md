---
title: Docked Zhixu Runtime
type: explanation
audience: 工程贡献者
status: verified
---

# Docked Zhixu Runtime

Docked Zhixu is the order-to-order docking capability inside the state-machine runtime. It lets a local order hand one stage to another linked Zhixu / linked order, then map a signal that already happened in the linked order back into the local order.

This is not a Store sandbox draft and not a normal backend integration. The formal runtime path must land in `UVPStateMachine` docking module events and proof.

## State-Machine Objects

| Object | Meaning |
| --- | --- |
| local order | The current order, waiting for output from a peer Zhixu to move a local stage forward. |
| linked order | Another Zhixu order docked into this one, with its own plan, authorization, signals, and proof. |
| docking link | The binding between local and linked orders, including selector stage, linked plan, link hash, nonce, and metadata URI. |
| signal binding | The mapping from linked source/signal to local source/signal. |
| mapped signal | A signal already present in the linked order is mapped into signal proof that the local order can consume. |

## Chain Events

| Event | Meaning |
| --- | --- |
| `DockedOrderLinked` | Records the docking relation between local and linked orders. |
| `DockedSignalMapped` | Records the linked-signal to local-signal binding. |
| `DockedSignalSubmitted` | Maps an already-submitted linked-order signal back into the local order. |

`UVPStateMachineLens` exposes `getActiveDockedOrderLink` and `getActiveDockedSignalBinding` to read the current active docking relation.

## Runtime Path

```text
local stage HookReady
  -> Store/Product or adapter selects a linked Zhixu order
  -> linkDockedOrder / linkDockedOrderFor
  -> linked order runs under its own Plan
  -> linked SignalSubmitted appears
  -> submitDockedSignal
  -> local order gets DockedSignalSubmitted
  -> local hooks continue evaluation
```

If a local stage opens the docking workflow through `externalSignals`, the backend/executor must first verify the signature of, deduplicate, and normalize the external fact; that input does not automatically create a Hook or advance UVP. If the entry comes from a canonical signal on another Order, use an explicit empty-header wrapper — `::OUTSIDE@(...)`, `::MERGE@(...)`, or `::ANCHOR@(task.stage.signal)` — and go through signal binding, docking link, and mapped-signal proof. Linked-order outputs such as `str/cmp/err` do not automatically move the local order.

## Boundaries

- The local order and the linked order are both independent on-chain orders.
- The linked Zhixu has its own plan publication, order registration, signal authorization, and proof.
- A Store docking session is only trial composition and review material; formal proof comes from `DockedOrderLinked`, `DockedSignalMapped`, `DockedSignalSubmitted`, and events on both orders.
- `signalMap` describes a mappable interface; it is not automatic business completion.
- `submitDockedSignal` maps a signal that already exists in the linked order; it does not create business facts for the linked order.

`DockedOrderLinked` / `DockedSignalMapped` / `DockedSignalSubmitted` record the docking relations and mapped-signal proof; they are docking's stable event surface. For the canonical narrative from the executor's perspective, see [Docked Zhixu / Zhixu as Executor](../apps/zhixu-as-executor.md).
