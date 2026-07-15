# Contact and Notifications

The Store can maintain contact and notification workflows because real fulfillment needs to find a person, system, or adapter. Contact and notifications are operational workflow; on-chain business actions are expressed through authorized signals.

## Organizable Information

- supplier contact, owner, team, support channel;
- notification preference, delivery channel, retry policy;
- task reminder, HookReady delivery intent, failure reason;
- operator note, SLA, availability window, escalation contact;
- adapter endpoint metadata or MCP/enterprise integration reference.
- peer Zhixu docking contact, such as owner, operator, callback adapter, and support window.

## Source and Boundary

- Notification triggers can come from `HookReady`, order-level authorization, supplier identity, and Product task projections.
- Notification state can only show whether the Store/chain-services tried to contact or remind someone.
- Business completion must be expressed by an on-chain signal from an authorized submitter.
- Contact details, credentials, private notes, certificates, contracts, invoices, and evidence plaintext must not be put on chain.
- For docked Zhixu, a notification means "the linked Zhixu executor has been notified or the adapter has been called"; linked order registration, completion, and mapped backfill are tracked through on-chain proof.

## Relationship with Chain Services

Chain services may derive supplier delivery intents and store retryable operational delivery state. That state cannot change order, task, hook, signal, or trust truth.

## Recommended Notification States

| State | Meaning | What is still needed to advance the order |
| --- | --- | --- |
| `pending` | A delivery intent was created but not sent yet. | The task has already started. |
| `sent` | The Store/chain-services tried to send it successfully. | The other side has executed. |
| `acknowledged` | The remote system or a person confirmed receipt. | The signal has been submitted. |
| `failed` | Contact failed or the adapter call failed. | The order fails; the failure still has to be interpreted against chain signals/hooks. |
| `suppressed` | Not sent because of revoked, blocked, policy, or rate-limit conditions. | No on-chain status exists. |
