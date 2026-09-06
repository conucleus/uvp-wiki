---
title: Notifications and Reconcile
type: reference
audience: 工程贡献者
status: verified
---

# Notifications and Reconcile

Notifications and Reconcile are runtime support systems in the rebuildable service layer. The former turns chain events and supplier profiles into retryable notification intents; the latter checks whether submission, projection, and chain-confirmation states need repair.

## Notifications Code Entry Points

| File | Responsibility |
| --- | --- |
| `src/notifications/service.ts` | Notification profile, delivery intent, retry, dead-letter. |
| `src/notifications/config.ts` | Delivery adapter and runtime configuration. |
| `src/notifications/profile.ts` | Supplier notification profile. |
| `src/api/routes/notifications.ts` | Supplier/admin notification routes. |

## Notification Sources

Notifications can be derived from these facts:

- `HookReady`: a stage has become ready and the corresponding executor needs to be notified.
- Order-level submitter authorization: who is eligible to submit a given signal.
- Supplier identity projection: whether a supplier is active or revoked.
- Supplier contact profile: how to reach them, notification preferences, owner, availability windows.

Notifications are derived from these facts. Delivery state says whether the service attempted to send, failed, or entered retry or dead-letter (the state enum is pending / sent / failed / skipped / dead_letter; see [Contacts and Notifications](../store/contact-notifications.md)).

## Reconcile Code Entry Points

| File | Responsibility |
| --- | --- |
| `src/reconcile/worker.ts` | Background reconciliation loop. |
| `src/reconcile/status.ts` | Reconcile status and diagnostics. |
| `src/reconcile/index.ts` | Module export. |

Reconcile mainly checks:

- Whether a submission has a tx hash while the projection has not yet seen the corresponding event.
- Whether relayer retry/failure needs operator intervention.
- Whether indexer sync lag affects Product API readiness.
- Whether the projection lags behind the active deployment.

## Boundaries

- Notification success is contact state; signal submission is determined by state-machine events.
- Dead-letter is a notification state; business failure is expressed by Zhixu/state-machine semantics.
- Reconcile can suggest repair or retry; on-chain state changes only through transactions and events.
- Ops diagnostics must be redacted; private keys, JWT secrets, RPC secrets, and storage credentials must not enter output.
