# Fulfillment Status, Proof, and Trust Checks

The Store's fulfillment view organizes orders, tasks, supplier participation, evidence hashes, and on-chain proof for operators. It is a view rebuilt around chain events, and the source of truth is registry/state-machine events.

## Fulfillment View Sources

| View | Source |
| --- | --- |
| Whether the order is registered | `OrderRegistered` projection. |
| Whether the task is ready | `HookReady` and hook status projection. |
| Whether the signal was submitted | `SignalSubmitted` proof row. |
| Whether the executor is active | `StageExecutorPatchApplied` / `StageExecutorActivated` projection. |
| Evidence binding | Product evidence metadata, content hash, metadata hash, payload hash. |
| Supplier historical participation | order/task projection + supplier metadata/identity projection. |
| Plan and identity | StateMachine Plan finalization plus Identity Registry binding projection. |
| Docked linked order | local/linked relation metadata + both sides' state-machine proof + mapped local signal. |

## What the Store Should Show

- timeline, proof rows, tx hash, block, event, state-machine address;
- supplier participation, open tasks, recent order count;
- historical proof for revoked plans/suppliers;
- indexer syncing/rebuild status;
- evidence hash and metadata URI, without showing the plaintext business file.
- trigger hook, ready time, assigned executor, blocked reason;
- local/linked order proof chain when a stage is executed by a peer Zhixu.

## Minimum Fields for a Proof Card

| Field | Description |
| --- | --- |
| event | `OrderRegistered`, `SignalSubmitted`, `HookReady`, `IdentityBindingRegistered`, etc. |
| contract | state-machine, identity-registry, or deployment-registry address. |
| deployment | deployment id / chain id / release evidence reference. |
| tx/block/log | tx hash, block number, log index. |
| subject | orderId, planId, supplier subject, stageId, hookId. |
| payload | payload hash, metadata hash, manifest hash, without plaintext. |
| projection | Which event replay produced the Product task/order row. |

## Display Boundary

- A missing proof row should be explained together with the indexer sync height.
- notification delivered is a contact state; signal submitted is shown by `SignalSubmitted`.
- Store notes or operator review are operational records; business completion is shown by signal/proof.
- A local DB row is a rebuildable read model.
- linked order completion must advance the local order through an authorized mapped signal or `DockedSignalSubmitted` on the local order.
