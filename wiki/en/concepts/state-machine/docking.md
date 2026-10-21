---
title: Docked Zhixu Runtime
type: explanation
audience: 工程贡献者
status: verified
---

# Docked Zhixu Runtime

Docked Zhixu is the order-to-order docking capability inside the state-machine
runtime. It lets a local order hand one stage to another linked Zhixu / linked
order, then map a signal that already happened in the linked order back into the
local order.

This is not a Store sandbox draft and not a normal backend integration. The
formal runtime path must land in the `UVPDockingModule` (abiVersion 4.7)
events and proof; the contract accepts only routes/interfaces
covered by their committed `dockRoutesRoot`, `dockInterfaceRoot`, and Merkle
proofs, and every binding/route hash carries an `interfaceNameId`
(keccak of the interface name) dimension.

## State-Machine Objects

| Object | Meaning |
| --- | --- |
| local order | The current order, identified by `(localPlanId, localOrderId)`, waiting for a peer Zhixu's output to move a local stage forward. |
| linked order | Another Zhixu order docked into this one, identified by `(targetPlanId, linkedOrderId)`, with its own plan, authorization, signals, and proof. |
| dock instance | One concrete docking relation containing local stage, route, target plan/order, interface, mode, source seam, input/output roots, and the parent-chain edge position (`depth`). |
| input binding | A binding from a local Hook to a target interface input port, deduplicated by `inputBindingHash`. |
| output binding | A mapping from a target interface output port to a local source/signal, deduplicated by `outputBindingHash`. |

## Chain Events

| Event | Meaning |
| --- | --- |
| `DockOpened` | Atomically records the dock instance, local/target plan/order, `interfaceNameId`, route, depth (this edge's parent-chain position = parent ledger + 1), and opener (`mode=new` mints a child order). |
| `DockAttached` | For a `mode=existing` docking onto an existing target order: records the dock instance and docking facts (the indexed `linkedOrderId` carries the target-side "who attached to me" projection; N:1 batching). |
| `DockInputSubmitted` | Records an input delivered to the linked order under a binding. |
| `DockOutputSubmitted` | Records a linked output mapped back to the local order under a binding. |

Dock outputs carry no terminal semantics: there is no dock-level terminal event,
and whether a local stage finishes is driven only by the local stage/order's own
completion semantics.

`UVPStateMachineLens.getActiveDock`, `dockInputDelivered`,
`dockOutputDelivered`, `dockByLocalRoute`, and `dockByTargetOrder` are the
authoritative views for the active relation; there are no
`getActiveDockedOrderLink` or `getActiveDockedSignalBinding` views.

## Runtime Path

```text
local stage HookReady(planId, orderId, hookId, ...)
  -> Store/Product or adapter selects a published target Zhixu by definition name
  -> openDockedOrder (single-argument OpenDockCallV1) validates route/interface roots, permit, the target-side consent gate, and the edge budget
  -> one transaction creates the linked order and submits the birth-anchor input (the single input binding of a mode=new route)
  -> the linked order runs under its own Plan, authorization, and executor
  -> submitDockedInput delivers later local signal inputs as needed
  -> linked SignalSubmitted appears
  -> submitDockedSignal submits the output binding
  -> local order receives mapped SignalSubmitted and DockOutputSubmitted proof
  -> local hooks continue evaluation
```

Every cross-plan reference must retain `planId`. An `orderId` is not a global key
and cannot be used alone to look up or merge docks, signals, or proofs.
`dockInstanceId` also includes the local plan namespace, the mode word, and
`interfaceNameId` in its preimage; the route hash (domain V3,
`UVP_DOCK_ROUTE_V3`) pins targetPlanId in its preimage's target slot for static
routes, so a mirror plan that copies interface commitments still cannot satisfy
a committed route's identity; `linkedOrderId` is derived from the dock
instance and target definition identity, preventing cross-plan preemption.

## Mode Boundaries: new / existing / dynamic selection

- `order.mode=new`: fully supported on-chain. Each route carries exactly one
  input binding (the birth anchor); `openDockedOrder` creates the child order,
  registers the link, and writes the birth-anchor fact in one transaction.
  Establishment must pass the **target-side consent gate**: a caller that is
  itself the target plan publisher (the same authority as the new-route child
  order creator — the two legs coincide) signs nothing; any other caller must
  carry the publisher's EIP-712 consent signature — typed data
  `UVPDockOpenConsentV1` (domain `UVPDockingModule` version "4"; ten-field
  digest: targetPlanId / interfaceNameId / localPlanId / localOrderId / routeId
  / routeHash / dockInstanceId / linkedOrderId / nonce / deadline, with its own
  nonce ledger); an empty signature from a non-publisher reverts
  (`DockOpenConsentRequired`). The entrance permit typed-data is
  `UVPDockEntrancePermitV2` (with `interfaceNameId`; same domain) — the permit
  is an optional delivery pre-authorization, the consent is the establishment
  precondition of open, and the two live in separate digest/nonce ledgers.
- `order.mode=existing`: supported on-chain. `attachDockedOrder`
  (`UVPDockingModule` 4.7) attaches an existing target order as a peer — no
  child order is created; the consent gate is one of three legs (target order
  creator / incumbent executor / target plan publisher pre-authorization), and
  after attaching, inputs/outputs share the same delivery surface as `new`
  (semantics: uvp-core subscription-mint-spec §2.4).
- `target: null` (dynamic selection): supported on-chain. The compiled
  artifact carries the declaration surface as `unresolvedDockRoutes`
  (`uvp.dockRoute.unresolved.v1`; the candidate set derives from the
  resolution manifest); the route hash (domain V3) leaves the target slot
  zero in its dynamic form, and `attachDockedOrder` settles the target with a
  candidate-leaf (`UVP_DOCK_CANDIDATE_V2`, binding the selected target's
  planId) membership proof, pinned for the instance's lifetime. The only
  dynamic route the chain track rejects is `order.mode=new`
  (`UNRESOLVED_DOCK_MODE`). The cloud runtime
  reads dock route selection records to fill in the target (resolved by name,
  validated against the local interface/port declaration, with the instance
  established on DB natural keys).

For the per-syntax-point acceptance comparison across the two tracks see
`uvp-chain.md` Appendix B in the `uvp-eth` repo.

## Subscriptions and Entries

The local stage entry is produced by a `receiveSignals` Hook. A cross-source
fact uses `::ANCHOR(@source::stage.signal)`; a birth stage additionally
declares `mint: per-fact`. `stage.trigger`, `externalSignals`,
`triggerEntrance`, and wrapper forms other than the subscription
(`::OUTSIDE@(...)`, `::ANCHOR@(…)`) are not part of the current DSL
and are rejected by the compiler.

The `supplierType: zhixu` configuration declares the target interface name and
`order.mode`, and expresses `inputMap`/`signalMap` as target interface port
names; at least one of the two maps must be non-empty. Resolution has two
layers: the core linker looks names up in the `uvp.dock.resolution.v2`
manifest's name directory and performs structural validation; the chain
track's publication surface embeds the target definition in full in the same
schema, and the TS compiler recomputes the content-derived identity
(`zx-<32hex>`) and artifact/interface roots as a content-addressing check
(chain-track internal). `signalMap` does not carry Hook DSL and does not
complete local business work merely by being configured.

## Edge Budget and Idempotency

The per-order total dock-edge ledger `dockEdgeCountOfOrder` is the single
authority: open mints the dock child order and counts an edge (child ledger =
parent ledger + 1), while attach counts an edge and takes the max (target
ledger raised to max(own, parent ledger + 1)). The caller-reported `parentDepth`
must match the ledger (`DockDepthMismatch` otherwise), and a ledger that has
reached `MAX_DOCK_EDGES = 8` is rejected (`DockDepthExceeded`, meaning the
per-order total dock-edge cap is exceeded). Before attach, a bounded ancestor
check walks the `dockParentOfOrder` parent-chain pointers for at most 8 hops
and rejects if the target order appears inside the parent's ancestor chain
(`DockAncestorCycle`, preventing cross-order cycles). The longest path is not
maintained on-chain; indexers derive it from the `DockOpened` / `DockAttached`
event graph. Open, birth-anchor input, linked-order registration, and
`DockOpened` complete in one EVM transaction; any failure rolls everything
back. After dock identity, route, endpoint, and permit checks pass, a repeated
open returns `false` without consuming the permit nonce. Repeated input/output
returns an idempotent result or an explicit conflict.

## Boundaries

- The local and linked orders are independent on-chain orders, each with `(planId, orderId)`, authorization, events, and lifecycle.
- The linked Zhixu has its own plan publication, order registration, signal authorization, and proof.
- A Store docking session is only trial composition and review material; formal proof comes from the birth event per mode (`DockOpened` for `mode=new`, `DockAttached` for `mode=existing` — attaching does not emit `DockOpened`), the delivery events shared by both modes (`DockInputSubmitted` / `DockOutputSubmitted`), and events on both orders.
- `submitDockedSignal` maps a signal that already exists in the linked order and satisfies the binding; it does not create business facts for the linked order and never forces a terminal state on either side.
- Unknown, pending, reverted, and retryable states must remain distinct in adapters/Store and must not be rendered as success or silently dropped.

For the canonical narrative from the executor's perspective, see [Docked Zhixu / Zhixu as Executor](../apps/zhixu-as-executor.md).
