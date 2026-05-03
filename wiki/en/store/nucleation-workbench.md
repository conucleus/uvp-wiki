# Nucleation Workbench

The Nucleation Workbench is the stage the Store gives to Zhixu designers and Zhixu organizers. The core user is Nucleation: it designs Zhixu, organizes suppliers, maintains internal fairness and operations; the Store provides tools, a catalog, proof, publishing workflows, and an entry point for endorsement requests.

## Three-Layer Governance

| Layer | Who is responsible | What they are responsible for | Authority boundary |
| --- | --- | --- | --- |
| Internal Nucleation governance | Zhixu designers / Zhixu organizers | Design stages, sources, supplier slots, resource requirements, fairness rules, and internal operating mechanisms. | Runtime still passes through plan hash, order authorization, and chain proof. |
| Store platform workflow | Store operator / reviewer / governance admin | Import, compile preview, catalog tagging, publishing material review, attestation requests, audit. | Trust status comes from the registry projection. |
| External trust-domain endorsement | Trust-domain owner / reviewer | Decide whether the Zhixu is fair, transparent, and endorsable, and whether the supplier subject is trustworthy. | Contacts and order signals belong to Store workflow and state-machine authorization, respectively. |

Whenever this document says "Store governance," it means platform workflow and evidence organization. Internal Zhixu governance is the responsibility of Nucleation.

## What the Workbench Provides

```text
Nucleation imports Zhixu
  -> compile preview and artifact/hash validation
  -> configure Product schema, resources, and supplier requirements
  -> organize supplier candidate network and contact information
  -> prepare fairness, transparency, and evidence requirement notes
  -> Store review of publishing materials
  -> governance admin starts attestation request
  -> trust domain endorses or rejects
  -> indexed PlanAttested / PlanRevoked
```

The Store provides the stage and the tools: catalog, search, drafts, compile preview, proof panel, supplier registry, notifications, audit, and governance requests. How the Zhixu is designed, how fairness is maintained, and how suppliers are organized are the responsibility of Nucleation; the trust domain makes the external decision.

## Boundary Between Tagging and Authorization

| Action | Meaning | Authority boundary |
| --- | --- | --- |
| Internal Nucleation tag | A supplier is suitable for a certain stage, role slot, or resource/evidence type. | Internal Zhixu organization semantics; chain trust or signal authorization is produced separately. |
| Store platform tag | Catalog classification, search, risk hints, industry, capability display. | Store metadata; trust-domain endorsement is expressed through registry events. |
| Trust attestation | The trust domain gives external endorsement to a plan/supplier subject. | `ZhixuTrustRegistry` events. |
| Workflow permission | Who can import, review, request attestation, or edit metadata. | Store permissions and audit. |
| Order authorization | Who can submit a certain signal for a certain order. | `UVPStateMachine` order-level authorization and the active executor overlay. |

These five things must be described separately. In particular, "authorization" has two layers: Store publishing permissions, review permissions, and attestation-request permissions are one layer, while order-level signal authorization is another.

## What the Page Should Show

- Nucleation identity: `spec.nucleation.id`, owner, maintenance notes, version history;
- Zhixu design materials: stage graph, source relations, triggers, supplier slots, resource handles;
- supplier organization: candidate suppliers, capability tags, contact channels, historical proof, and whether they have been endorsed by the trust domain;
- fairness and transparency materials: selection rules, evidence requirements, exception handling, dispute paths, and version change notes;
- publishing status: compile preview, Store review, attestation request, and PlanAttested/PlanRevoked projection;
- Audit: who submitted the materials, who requested endorsement, the related tx/proof, failure reason, and retry history.

## Documentation Language

- Store admin maintains platform workflow; Nucleation maintains internal Zhixu fairness.
- Store review means the materials passed the platform process; fair/trusted display depends on the trust-domain projection.
- A Store tag or capability label is catalog semantics; supplier on-chain endorsement is reflected by `SupplierAttested`.
- notification delivered is a contact state; fulfillment completion is shown by signal/proof.
- A Store docking session is a trial-pairing and operational record; local order progression depends on an authorized mapped signal or `DockedSignalSubmitted`.
