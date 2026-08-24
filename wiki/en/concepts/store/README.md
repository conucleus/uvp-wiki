---
title: Zhixu Store
type: meta
audience: Store 产品与运营、协议读者
preread: ../protocol-boundaries.md
status: verified
---

The Store is the off-chain product workbench between the Nucleus, suppliers, operators, and ordinary execution interfaces. It provides catalog, compile preview, supplier profiles, capability tags, search and matching, proof views, notifications, review flows, and audit, but it does not promote these commercial judgments into UVP protocol facts. Terminology follows the [glossary](../../reference/glossary.md).

```text
Nucleus designs a Zhixu
  -> Store compile preview and off-chain review
  -> publisher signs, commits, and finalizes the Plan
  -> UVPStateMachine produces Plan / Order / Signal facts

Store verifies subjects offline
  -> UVPIdentityRegistry registers subjectId <-> account
  -> Store displays names with descriptors
```

## Information objects and authority sources

This table is the single authoritative version of the Store-area authority boundary for the whole wiki. When other pages run into these boundaries they only make a one-sentence reference and link to this section instead of restating them; the protocol-side overview is [Protocol boundaries](../protocol-boundaries.md).

| Information object | Authority source | Notes |
| --- | --- | --- |
| Nucleus / nucleation | Nucleus internal governance; no independent contract state — it is expressed in the Zhixu/Plan/Order/proof. | Designer of the Zhixu and organizer of the order network; the Store records identity, maintenance notes, version history, design material, and publication material. |
| Zhixu draft / Plan version | Publisher EIP-712 signature + `PlanCommitted` / `PlanFinalized` on `UVPStateMachine`. Whether a Plan can create an Order is determined by finalization. | The Store organizes drafts, compile previews, fairness material, platform catalog tags, and active recommendation; these are off-chain display and recommendation only. |
| Real-world identity (Identity binding) | After offline verification by the Store, registered in `UVPIdentityRegistry` as subjectId <-> account. | The Registry only does binding: it does not certify Plans, does not declare supplier capability or reputation, and does not perform matching. Revocation does not delete history; after revocation the Store moves the subject out of the default directory. |
| Supplier capability profile | Store metadata (profile, capability tags, contacts, review status); organization semantics belong to the Nucleus. | Off-chain commercial data that may differ per Store; capability tags do not create order or signal permissions — signal authorization arises in the Order. |
| Order | Signatures from registrar/participants/executors + `OrderRegistered` and state-machine events. | The Store only searches, ranks, adds operator notes, and summarizes proof; Order/Signal rights come from participant signatures, order-level authorization, and the active executor overlay, and the Store cannot sign on behalf of participants. |
| Task / Signal fulfillment | On-chain signals from an authorized submitter: `SignalSubmitted`, `HookReady`, and stage overlay events. | Contact is not fulfillment: notification delivery is only operational status; business completion is determined by the on-chain signal. |
| Executor authorization | Order-level authorization and the active executor overlay (patch-path events). | Decided by contracts, EIP-712, order authorization, and the active overlay; not changed by Store workflows. |
| Platform workflow | Approval and confirmation records of Store operators/reviewers/admins; public claims are settled by registry transactions and indexed events. | Approvals, confirmations, audit, and broadcast requests only prove a Store action happened; they do not make the corresponding on-chain fact true. |
| Docking relation | Each local/linked order's own state-machine events and mapped signal proof. | Mapped signals and proof advance the local order; passing docking sandbox validation does not mean an Order can be created. |

## Homepage information architecture principles

Search first, Nucleus visible, Trust visible, Proof reachable, Docking visible: one query can hit a Nucleus, a Zhixu, an Order, a Supplier, or a Governance object, but each object detail page must show its own authority source — a supplier card's trust badge comes from the registry projection, a Zhixu card's official status comes from plan publication, and Store-only metadata (drafts, reviews, notes, contacts, notifications, platform tags) must be labeled as Store/workflow information. Revoked plans/suppliers remain visible to operators with the new-order entry blocked, but Store metadata cannot revive them; chain syncing/rebuild status must never be hidden, so operators do not mistake projection lag for missing objects.

## Centralization and verifiability

The Store is explicitly centralized in taking on offline identity verification, name display, compliance, catalog, tags, recommendation, and operations. User trust in it does not come from "the Store is decentralized" but from clear responsibility boundaries: identity writes are replayable events, publisher and participant rights are proven by signatures, any relayer can broadcast, and frozen modules cannot be silently replaced by backends. Full discussion: [Protocol boundaries](../protocol-boundaries.md) and [Contracts and Registries](../contracts-and-registries.md).

## Child pages

| Page | Content |
| --- | --- |
| [Zhixu management](zhixu-management.md) | The Nucleation workbench, publisher signatures, Plan commit/finalize, and the Store publication workflow. |
| [Supplier Directory](supplier-directory.md) | Offline supplier profiles, three classes of identity and tag sources, identity bindings, and contact. |
| [Runtime and proof](runtime-proof.md) | Orders, tasks, Signals, proof, and identity display. |
| [Contact and notifications](contact-notifications.md) | Delivery intents, notification states, owners, and SLAs. |
| [Governance and audit](governance-audit.md) | Store operator permissions, identity registration/revocation, and off-chain review records. |
| [Docking Sandbox](docking-sandbox.md) | Off-chain trial pairing of peer Zhixu, adapters, and signal maps. |

Store workflow status is not an on-chain right. `approved_for_broadcast` only means the Store intends to perform the next step; whether a Plan can create an Order is decided by whether it is finalized in `UVPStateMachine`.
