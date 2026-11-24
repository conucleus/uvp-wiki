---
title: Contact and Notifications
type: explanation
audience: Store 产品与运营、chain-services 维护者
preread: README.md
status: verified
---

# Contact and Notifications

> Prerequisite reading: [Zhixu Store](README.md)
The Store can maintain contact and notification workflows because real fulfillment needs to reach a person, a system, or an adapter. Contact and notifications are operational workflow; on-chain business actions are expressed by authorized signals.

## Organizable information

- supplier contact, owner, team, support channel;
- notification preference, delivery channel, retry policy;
- task reminders, HookReady delivery intents, failure reasons;
- operator notes, SLAs, availability windows, escalation contacts;
- adapter endpoint metadata or MCP/enterprise integration references.
- Dock peer contacts, such as the maintainers of the from/to orders, the dock executor, adapter endpoints, and support windows.

## Sources and boundaries

- Notification triggers may come from `HookReady`, `StageSupplierAssigned`/`StageSupplierPatchApplied`, supplier status, and Product task projections.
- Notification state only shows whether the Store/chain-services attempted to contact or remind someone; contact is not fulfillment, see [../protocol-boundaries.md](../protocol-boundaries.md).
- Business completion must be expressed by an on-chain signal from an authorized submitter ([../protocol-boundaries.md](../protocol-boundaries.md)).
- Contact details, credentials, private notes, certificates, contracts, invoices, and evidence plaintext should not go on chain.
- A notification to a Dock peer means the dock executor or adapter has been reminded; whether a binding exists is read from the `dock_link` file record and `StageDockSupplierSelected`, and whether an output was emitted is read from `DockOutputSubmitted`. Notification state never changes protocol facts.

## Relationship with chain services

Chain services may derive supplier delivery intents and store retryable operational delivery state. That state cannot change order, task, hook, signal, or trust truth.

## Notification states (chain-services implementation)

The following are the actual states of the `NotificationDeliveryStatus` enum in chain-services `notifications/service.ts`:

| State | Meaning |
| --- | --- |
| `pending` | A delivery intent was created but not sent yet; retries return to this state first. |
| `sent` | Sent successfully. |
| `failed` | This send attempt failed and is waiting for retry. |
| `skipped` | Not sent because the recipient/profile could not be resolved or for policy reasons, with a reason code attached (e.g. `receiver_not_found`). |
| `dead_letter` | Retries exhausted or manually marked as dead letter; requires manual handling. |

The earlier design's `acknowledged` (the other side confirmed receipt) and `suppressed` (not sent due to revoked/blocked/policy) remain aspirational states and are not yet implemented.

> TODO(confirm): are acknowledged/suppressed still on the roadmap? If abandoned, remove them from the design material.
