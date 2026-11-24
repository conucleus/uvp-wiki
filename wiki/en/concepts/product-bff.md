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
- resolve the birth stage's assigned supplier account and the plan artifact, and prepare the birth payload and `UVPStateMachineSignalSubmission` typed data;
- not generate a submitter authorization table: submission authority is decided by on-chain assigned-supplier state;
- track the birth submission and retries.

Workflow:

```text
create order draft
  -> invite participants
  -> participants accept with wallet
  -> prepare birth payload + signal-submission typed data
  -> wallet signs; direct submit or relay
  -> chain events: OrderRegistered / OrderTriggered / StageMaterialized
```

The BFF database stores draft and workflow state. What actually makes an order exist is a birth event on `UVPStateMachine`; what actually advances tasks are subsequent events such as `SignalSubmitted` and `HookReady`. The read side is the rebuildable `/chain/*` projection served by `@uvp-eth/chain-services`.

## Signal submission entry

After an order is born, participants or executors submit business signals through Product tasks: the product surface first prepares a readable summary and EIP-712 typed data, then the assigned supplier account signs. On chain, the fact is `submitSignal` (with an empty signature, `msg.sender` must equal the submitter; with a non-empty signature, `msg.sender` is only the relayer) plus `SignalSubmitted`. The product side never signs for participants and never guesses authority from role copy.

## Stage patch submission entry

Order-level patches split into two classes with different signing surfaces and checks:

- stage supplier patch: `UVPStagePatchModule`'s `StageSupplierPatch` typed data (domain `stageSupplierPatch` 1, with `previousSupplierId` distinguishing assign/handoff); the signed entry `applyStageSupplierPatchFor` carries the selector and previous supplier signatures, `bindingProof`, and `candidateProof`. When the patch takes effect it only changes `stage -> supplierId`; it writes no authorization set.
- stage file write: there is no separate typed data; it is submitted with `submitSignal`'s `files: StageFile[]` (`signalId == 0` is a pure file write), and `UVPFileResourceModule.applyStageFiles` overwrites the same key. Write authority comes from the target/writer stage's assigned supplier account and the `fileWriters` allowlist.

The application backend owns product-side typed-data preparation and submission orchestration; for protocol fields and events see [Contracts and Events](../reference/contracts-and-events.md) and [Stage Overlay](state-machine/stage-overlay.md).

## Boundaries

- Does not sign on behalf of participants.
- Does not bypass plan publication and supplier identity checks.
- Does not treat drafts, invites, or birth-submission attempts as on-chain orders.
- Does not treat submission rows as on-chain `SignalSubmitted`.
- The product object is a Zhixu order; Store review is not trust publication.
- Drafts, invites, evidence metadata, and review records are application-layer facts; order, stage, signal, and hook state come from the chain and its projections.
