---
title: Operator Permissions, Governance, and Audit
type: explanation
audience: Store operator、governance/audit 角色
preread: README.md
status: verified
---

Permissions and audit in the Store constrain platform workflow. Audit records prove that a Store action happened; the Nucleus's order design, Store or external institution material review, and state-machine events each keep their own authority sources (see the [README.md](README.md) "Information objects and authority sources" table).

## Three permission classes

| Permission domain | Examples | Boundary |
| --- | --- | --- |
| Nucleation workbench permissions | Import Zhixu, maintain design material, organize supplier requirements, submit publication material. | Does not automatically gain trust publication or order signal authorization. |
| Store platform permissions | review, catalog tags, visibility, publication request, revocation request, audit export. | Does not design internal rules for the Nucleus and does not decide on-chain trust. |
| On-chain business permissions | register order, submit signal, stage patch, resource patch. | Decided by contracts, EIP-712, order authorization, and the active overlay. |

## Sensitive actions

- draft import, compile preview, Product Schema save;
- design/fairness/material review;
- changing platform catalog tags, risk labels, visibility, active recommendation;
- creating/updating supplier profiles, contact metadata, platform capability tags;
- saving docking sessions, approving signalMap review material;
- requesting plan/supplier publication or revocation;
- inspecting failed governance broadcasts or index state;
- marking revoked plans/suppliers as hidden from new-order creation.

These actions can be audited; chain publication, supplier identity, and business completion come respectively from registry or state-machine events.

## Permissions and confirmation

The Store should distinguish capabilities such as read, nucleation_operator, operator, reviewer, governance_admin, and auditor. Sensitive actions need an explicit confirmation target, such as Nucleus ID / nucleation id, Draft ID, Plan ID, Plan Hash, Supplier subject, or revocation reason.

| Capability | What it can do |
| --- | --- |
| read | Search, view proof, view public metadata. |
| nucleation_operator | Maintain drafts, design material, and supplier requirements under its own Nucleus. |
| operator | Edit platform metadata, supplier profile, contact, docking sandbox. |
| reviewer | Review publication material, capability material, fairness/transparency material. |
| governance_admin | Start or confirm identity binding register/revoke requests. |
| auditor | View the audit trail, export review/proof bundles. |

## Audit boundary

| Audit can prove | Audit cannot prove (check on-chain events) |
| --- | --- |
| A Store principal started, approved, or confirmed a workflow action. | The plan is already published. |
| A metadata field, platform tag, or contact was changed. | The supplier is already trusted. |
| A Nucleus submitted design material or publication material. | The Store reviewer has completed review, or the publisher has signed publication. |
| A governance request was created or a broadcast attempted. | The tx has been accepted by the chain and indexed. |
| A docking session was saved or reviewed. | The linked-order proof has already been mapped onto the local order. |

A public claim only becomes true after the corresponding chain event is observed.

## Governance handoff

Store governance actions should be delegated to an existing governance service or admin flow. It does not hold private keys directly, does not bypass the admin header, does not describe review approval as chain publication, and does not write the Store reviewer in as the Identity Registry.

The Store faces these objects for the Nucleus and platform operating organizations: nucleation identity, design material, version history; Zhixu drafts, compile previews, reviews, versions; fairness / transparency / exception policy material; supplier directory, Nucleus internal fit relations, platform capability tags; order search and proof drilldown; identity binding register/revoke requests. Status ownership of these objects follows the [README.md](README.md) "Information objects and authority sources" table.

## Why the Store is a necessary centralized component

Decentralized contracts can only verify hashes, signatures, event ordering, and authorizations. Real-world questions — "which Nucleus maintains this order network", "is this Zhixu's fairness material complete", "what is this customs broker's contact", "is this version recommended" — require a centralized product interface to organize. The Store is the productized entry point for exactly that organizing capability; trust and enforceability still come back to Store or external institution publication and state-machine events. For the boundary overview see [Protocol boundaries](../protocol-boundaries.md).

## What an audit row should contain

- actor, role, session id;
- object type and object id;
- key references such as nucleation id, draft id, plan id, supplier subject;
- before/after hash or field summary;
- reason, review note, fairness/material checklist reference;
- related tx hash, governance request id, or proof reference;
- createdAt, broadcastAt, indexedAt;
- failure reason and retry count.
