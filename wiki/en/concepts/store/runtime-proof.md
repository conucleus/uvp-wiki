---
title: Fulfillment Status, Proof, and Trust Checks
type: reference
audience: Store operator、indexer/proof 维护者
preread: README.md
status: verified
---

The Store's fulfillment view organizes orders, tasks, supplier participation, evidence hashes, and on-chain proof for operators. It is a view rebuilt around chain events; the source of truth is registry/state-machine events.

<!-- StageExecutorPatchApplied is emitted via the module patch path, not listed directly in the v0.8 main ABI fixture -->

## View sources

| View | Source |
| --- | --- |
| Whether the order is registered | `OrderRegistered` projection. |
| Whether the task is ready | `HookReady` and the hook status projection. |
| Whether the signal was submitted | `SignalSubmitted` proof row. |
| Whether the executor is active | `StageExecutorPatchApplied` / `StageExecutorActivated` projection. |
| Evidence binding | Product evidence metadata, content hash, metadata hash, payload hash. |
| Supplier historical participation | order/task projection + supplier metadata/identity projection. |
| Plan and identity | `UVPStateMachine` Plan finalization + `UVPIdentityRegistry` identity binding projection. |
| Docked linked order | local/linked relation metadata + both sides' state-machine proof + mapped local signal. |

## What the Store should show

- timeline, proof rows, tx hash, block, event, state-machine address;
- supplier participation, open tasks, recent order count;
- historical proof for revoked plans/suppliers;
- indexer syncing/rebuild status;
- evidence hash and metadata URI, without showing business file plaintext.
- trigger hook, ready time, assigned executor, blocked reason;
- local/linked order proof chain when a stage is executed by a peer Zhixu.

## Minimum fields for a proof card

> This table lists UI minimum requirements; specifics follow [Product DTO](../product/dto.md).

| Field | Description |
| --- | --- |
| event | `OrderRegistered`, `SignalSubmitted`, `HookReady`, `IdentityBindingRegistered`, etc. |
| contract | state-machine, identity-registry, or deployment-registry address. |
| deployment | deployment id / chain id / release evidence reference. |
| tx/block/log | tx hash, block number, log index. |
| subject | orderId, planId, supplier subject, stageId, hookId. |
| payload | payload hash, metadata hash, manifest hash — no plaintext. |
| projection | Which event replay produced the Product task/order row. |

## Display boundary

- A missing proof row must be explained together with the indexer sync height.
- notification delivered is a contact status; signal submitted looks at `SignalSubmitted`.
- Store notes or operator reviews are operational records; business completion looks at signal/proof (contact is not fulfillment, see [../protocol-boundaries.md](../protocol-boundaries.md)).
- A local DB row is a rebuildable read model; for how read models map to authority sources see the [README.md](README.md) "Information objects and authority sources" table.
- Linked-order completion advances the local order only through an authorized mapped signal or `DockedSignalSubmitted` on the local order.
