# Product BFF

Product BFF means Product Backend-for-Frontend. It lives in `uvp-chain-services/service/src/product/bff/`. It handles the workflow for order drafts, invitations, participant confirmation, authorization building, and order registration submission.

## Responsibilities

The Product BFF handles the product flow of “turn a Zhixu that can create an order into an order that is ready to register”:

- Create order drafts.
- Generate and manage participant invites.
- Record participant accept/reject actions.
- Check whether the Zhixu has an active Store version.
- Check whether the plan is attested or revoked.
- Check whether a supplier wallet is revoked.
- Generate `SignalAuthorization[]` from `orderPermissionTable` and the participant list.
- Prepare the order registration payload and the initial trigger.
- Track registration submission and retries.

## Code Entry Points

| File | Responsibility |
| --- | --- |
| `registration.ts` | Order registration adapter and submission path. |
| `authorization.ts` | Product authorization builder. |
| `service.ts` | Draft, invite, participant, and submit workflow. |
| `store.ts` | BFF storage contract. |
| `sqlite-store.ts`, `postgres-store.ts` | Durable draft / workflow store. |
| `types.ts` | Draft, invite, participant, and registration types. |
| `src/api/routes/product-bff.ts` | HTTP route. |

## Workflow

```text
create order draft
  -> invite participants
  -> participants accept with wallet
  -> build SignalAuthorization[]
  -> prepare registration payload
  -> submit through configured adapter
  -> indexer later observes OrderRegistered
```

The BFF database stores drafts and workflow state. What actually makes the order exist is `UVPStateMachine.OrderRegistered`. What actually advances tasks is later `SignalSubmitted`, `HookReady`, and related events.

## Boundary

- It does not sign on behalf of participants.
- It does not bypass plan attestation or supplier trust checks.
- It does not write drafts, invites, or registration attempts as on-chain orders.
- It does not expose `/product/flows`; the product object is a Zhixu order.
- It does not treat Store review as trust attestation.
