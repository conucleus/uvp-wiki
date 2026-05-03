# Notifications and Reconcile

Notifications and Reconcile are runtime support systems in the non-trusted execution layer. The former turns chain events and supplier profiles into retryable notification intents; the latter checks whether submissions, projections, and chain confirmation state need repair.

## Notifications Code Entry Points

| File | Responsibility |
| --- | --- |
| `src/notifications/service.ts` | notification profile, delivery intent, retry, dead-letter. |
| `src/notifications/config.ts` | delivery adapter and runtime config. |
| `src/notifications/profile.ts` | supplier notification profile. |
| `src/api/routes/notifications.ts` | supplier/admin notification routes. |

## Notification Sources

Notifications can be derived from these facts:

- `HookReady`: a stage is ready and the corresponding executor needs to be notified.
- order-level submitter authorization: who is allowed to submit a given signal.
- supplier trust projection: whether a supplier is active or revoked.
- supplier contact profile: how to reach them, notification preferences, owner, and availability window.

Notifications are derived from these facts. Delivery state only describes whether the service tried to send, failed, or entered retry/dead-letter.

## Reconcile Code Entry Points

| File | Responsibility |
| --- | --- |
| `src/reconcile/worker.ts` | background reconciliation loop. |
| `src/reconcile/status.ts` | reconcile status and diagnostics. |
| `src/reconcile/index.ts` | module export. |

Reconcile mainly checks:

- whether a submission has a tx hash while the projection has not yet seen the corresponding event.
- whether relayer retry/failure needs operator intervention.
- whether indexer sync lag affects Product API readiness.
- whether the projection lags behind the active deployment.

## Boundary

- Notification success is contact state; signal submission is reflected by state-machine events.
- Dead-letter is notification state; business failure is expressed by Zhixu/state-machine semantics.
- Reconcile may suggest repair or retry; on-chain state can only change through transactions and events.
- Ops diagnostics must be redacted; private keys, JWT secrets, RPC secrets, and storage credentials must not appear in output.
