# Operator Permissions, Governance, and Audit

Permissions and audit in the Store constrain platform workflow. Audit records prove that a Store action happened; the Nucleation's Zhixu design, trust-domain endorsement, and state-machine events still keep their own authority sources.

## Three Permission Classes

| Permission domain | Example | Boundary |
| --- | --- | --- |
| Nucleation workbench permissions | Import Zhixu, maintain design materials, organize supplier requirements, submit publishing materials. | Does not automatically grant trust attestation or order signal authorization. |
| Store platform permissions | review, catalog tag, visibility, attestation request, revocation request, audit export. | Does not define the internal rules of Nucleation or decide on-chain trust. |
| On-chain business permissions | register order, submit signal, stage patch, resource patch. | Determined by contracts, EIP-712, order authorization, and the active overlay. |

## Sensitive Actions

- draft import, compile preview, Product Schema save;
- design/fairness/material review;
- change platform catalog tags, risk labels, visibility, or active recommendation;
- create/update supplier profile, contact metadata, platform capability tags;
- save docking sessions, approve signalMap review materials;
- request plan/supplier attestation or revocation;
- inspect failed governance broadcasts or index state;
- mark revoked plans/suppliers as hidden from new-order creation.

These actions can be audited; chain attestation, supplier trust, and business completion still come from registry or state-machine events.

## Permissions and Confirmation

The Store should distinguish capabilities such as read, nucleation_operator, operator, reviewer, governance_admin, and auditor. Sensitive actions need an explicit confirmation target, such as Nucleation ID, Draft ID, Plan ID, Plan Hash, Supplier subject, or revocation reason.

| Capability | What it can do |
| --- | --- |
| read | Search, view proof, and view public metadata. |
| nucleation_operator | Maintain drafts, design materials, and supplier requirements under its own Nucleation. |
| operator | Edit platform metadata, supplier profile, contact, and the docking sandbox. |
| reviewer | Review publishing materials, capability materials, and fairness/transparency materials. |
| governance_admin | Start or confirm attestation/revocation requests. |
| auditor | View the audit trail and export review/proof bundles. |

## Audit Boundary

| What audit can prove | Audit boundary |
| --- | --- |
| A Store principal started, approved, or confirmed a workflow action. | The plan is already attested. |
| A metadata field, platform tag, or contact was changed. | The supplier is already trusted. |
| A Nucleation submitted design materials or publishing materials. | The trust registry has accepted its fairness. |
| A governance request was created or a broadcast was attempted. | The tx has already been accepted and indexed. |
| A docking session was saved or reviewed. | The linked order proof has already been mapped back to the local order. |

Public claims only become true after the corresponding chain event is observed.

## What an Audit Row Should Contain

- actor, role, session id;
- object type and object id;
- key references such as nucleation id, draft id, plan id, supplier subject;
- before/after hash or field summary;
- reason, review note, fairness/material checklist reference;
- related tx hash, governance request id, or proof reference;
- createdAt, broadcastAt, indexedAt;
- failure reason and retry count.
