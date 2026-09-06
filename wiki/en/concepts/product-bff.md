---
title: Product BFF and Submission Entries
type: explanation
audience: 应用开发者
status: verified
---

# Product BFF and Submission Entries

Product BFF means Product Backend-for-Frontend. It is a separate boundary in UVP's write path: it converts user-comprehensible drafts, invites, task actions, and evidence fingerprints into verifiable order registrations, typed data, signed submissions, and submission status.

It mainly covers three pieces of code:

| Code entry | Responsible for |
| --- | --- |
| `uvp-chain-services/service/src/product/bff/` | Order drafts, invites, participant confirmation, authorization building, and the order registration submission workflow. |
| `uvp-chain-services/service/src/submissions/` | Prepare-submit for Product tasks, signature verification, submission tracking, and relayer handoff. |
| `uvp-chain-services/service/src/stage-patches/` | Typed data, signature verification, and submission entries for stage executor/resource patches. |

## Order BFF Responsibilities

Order BFF handles the product process of "turning an order-creatable Zhixu into a pending order registration":

- Create an order draft.
- Generate and manage participant invites.
- Record participant accept/reject.
- Verify that the Zhixu has an active Store version.
- Verify whether the plan is published and not revoked.
- Verify whether the supplier wallet is revoked.
- Build `SignalAuthorization[]` from the `orderPermissionTable` and participant list.
- Prepare the order registration payload and initial trigger.
- Track registration submission and retries.

For code-entry details of Order BFF, see [Submissions and Stage Patch](services/submissions-stage-patch.md).

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

The BFF database stores draft and workflow state. What actually makes an order exist is `UVPStateMachine.OrderRegistered`. What actually advances tasks are subsequent events such as `SignalSubmitted` and `HookReady`.

## Signal Submission Entry

After an order is registered, participants or executors submit business signals through Product tasks: the entry does not make ordinary users handle sourceId, signalId, ABI, or gas; instead it first prepares a readable summary and EIP-712 typed data, then lets the authorized wallet sign. For code-entry details, see [Submissions and Stage Patch](services/submissions-stage-patch.md).

## Stage Patch Submission Entry

Stage executor patches and resource patches are also Product write entries, but they are signed and verified separately from ordinary business signals. For code-entry details, see [Submissions and Stage Patch](services/submissions-stage-patch.md).

## Boundaries

- Does not sign on behalf of participants.
- Does not bypass plan publication and supplier identity checks.
- Does not treat drafts, invites, or registration attempts as on-chain orders.
- Does not treat submission rows as on-chain `SignalSubmitted`.
- Does not expose `/product/flows`; the Product object is a Zhixu order.
- Does not treat Store review as trust publication.
