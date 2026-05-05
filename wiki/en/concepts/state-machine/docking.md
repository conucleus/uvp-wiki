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
| `DockedSignalMapped` | Records the linked signal to local signal binding. |
| `DockedSignalSubmitted` | Maps an already-submitted linked order signal back into the local order. |

`UVPStateMachineLens` exposes `getActiveDockedOrderLink` and `getActiveDockedSignalBinding` to read the active docking relation.

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

If a local stage opens the docking workflow through `::OUTSIDE`, that external entrance still needs order-level authorization. Linked-order outputs such as `str/cmp/err` do not automatically move the local order; they must pass through signal binding, docking link, and mapped signal proof.

## Boundaries

- The local order and linked order are both independent on-chain orders.
- The linked Zhixu has its own plan attestation, order registration, signal authorization, and proof.
- A Store docking session is trial composition and review material; formal proof comes from `DockedOrderLinked`, `DockedSignalMapped`, `DockedSignalSubmitted`, and events on both orders.
- `signalMap` describes a mappable interface; it is not automatic business completion.
- `submitDockedSignal` maps a signal that already exists in the linked order; it does not create business facts for the linked order.

For the executor-facing view, see [Docked Zhixu / Zhixu as Executor](../../execution/zhixu-as-executor.md).
