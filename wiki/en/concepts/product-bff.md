---
title: Product BFF and Submission Entries
type: explanation
audience: 应用开发者
status: verified
---

# Product BFF and Submission Entries

Product BFF means Product Backend-for-Frontend: the application-layer boundary of UVP's product write path. It converts user-comprehensible drafts, invites, task actions, and evidence fingerprints into verifiable birth submissions, typed data, signed submissions, and submission status. In this repository `@uvp-eth/chain-services` carries only the read-only chain projection and operations surface; the Product BFF is maintained by the used-car application backend.

> Pending confirmation: the application backend's module paths and endpoint names are outside this repository's verification scope; consult the application implementation and API contract before citing them.

## Application-layer responsibilities

The Order BFF handles the product process of "turning an order-creatable Zhixu into a pending birth":

- create an order draft;
- generate and manage participant invites;
- record participant accept/reject;
- verify that the Zhixu has an active Store version;
- verify whether the plan is published or revoked;
- verify whether the supplier wallet is revoked;
- build `SignalAuthorization[]` from the order permission table and participant list;
- prepare the birth payload, `triggerHookId`, and initial trigger typed data;
- track the birth submission and retries.

Workflow:

```text
create order draft
  -> invite participants
  -> participants accept with wallet
  -> build SignalAuthorization[]
  -> prepare birth payload + trigger typed data
  -> wallet signs; direct submit or relay
  -> chain events: OrderRegistered / OrderTriggered / StageMaterialized
```

The BFF database stores draft and workflow state. What actually makes an order exist is a birth event on `UVPStateMachine`; what actually advances tasks are subsequent events such as `SignalSubmitted` and `HookReady`. The read side is the rebuildable `/chain/*` projection served by `@uvp-eth/chain-services`.

## Signal submission entry

After an order is born, participants or executors submit business signals through Product tasks: the product surface first prepares a readable summary and EIP-712 typed data, then the authorized wallet signs. On chain, the only fact is direct `submitSignal` (identity fixed to `msg.sender`; a contract executor may be paid for by a relayer) plus `SignalSubmitted`. The product side never signs for participants and never guesses authorization from role copy.

## Stage patch submission entry

Order-level patches split into two classes with different signing surfaces and checks:

- executor patch: `UVPStagePatchModule`'s `StageExecutorPatch` typed data (domain `stageExecutorPatch` 0.4, mode closed set `assign`/`handoff`); the signed entry `applyStageExecutorPatchFor` carries the selector and previous-executor signatures, `bindingProof`, `candidateProof`, and `executorAuthorizations`. When the patch takes effect, the Plan's pre-declared capabilities become the order's explicit authorization set.
- stage file patch: there is no separate patch typed data; it rides the trailing `bytes32 filesDigest` + `FilePatch` on direct `submitSignal` (`signalId == 0` is a pure file patch), and `UVPFileResourceModule.applyStageFilePatch` applies `add` / `replace` / `remove`. Write authorization comes from the stage-level `fileWriters` capability leaves plus order-level authorization rows.

The application backend owns product-side typed-data preparation and submission orchestration; for protocol fields and events see [Contracts and Events](../reference/contracts-and-events.md) and [Stage Overlay](state-machine/stage-overlay.md).

## Boundaries

- Does not sign on behalf of participants.
- Does not bypass plan publication and supplier identity checks.
- Does not treat drafts, invites, or birth-submission attempts as on-chain orders.
- Does not treat submission rows as on-chain `SignalSubmitted`.
- The product object is a Zhixu order; Store review is not trust publication.
- Drafts, invites, evidence metadata, and review records are application-layer facts; order, stage, signal, and hook state come from the chain and its projections.
