# Supplier Registry, Capability, and Contact

The Supplier Registry is the workbench where Nucleation organizes supplier networks, and it is also where the Store maintains the supplier catalog, contact information, fulfillment proof, and endorsement-request materials. The protocol object for Supplier is defined in the core concepts; this page only describes the Store side.

## Two Layers of Tags

| Tag layer | Who maintains it | Meaning | Authority boundary |
| --- | --- | --- | --- |
| Internal Nucleation tags | Nucleation / Zhixu organizers | A supplier is suitable for a certain stage, role slot, or resource/evidence type. | Trust and signal authorization are produced separately. |
| Store platform tags | Store operator | Catalog classification, search, industry, risk, and operational visibility. | Trust-domain endorsement is reflected by `SupplierAttested`. |
| Trust attestation | Trust domain | Whether the supplier subject has been endorsed. | Current order submission authority is determined by signal authorization. |

Whenever this document says a supplier is "tagged," it must say which layer the tag belongs to. Store platform tags, internal Nucleation tags, trust-domain endorsement, and order authorization are all shown separately.

## Supplier Information Layers

| Layer | Content | Authority |
| --- | --- | --- |
| Profile | display name, subject id, wallet, organization notes, metadata URI. | Store metadata. |
| Nucleation fit | Which Zhixu, stage, role slot, and resource/evidence types can be served. | Internal Zhixu organization semantics. |
| Platform capability | Catalog tags such as logistics, customs, inspection, payment, dispute review, and document verification. | Store metadata + audit. |
| Contact | contacts, notification channels, owner, availability windows, SLA, operational notes. | Store metadata; plaintext is not put on chain. |
| Trust | attested/revoked/not_found, domains, proof rows. | `ZhixuTrustRegistry` projection. |
| Participation | recent orders, open tasks, historical proof. | `UVPStateMachine` / Product projection. |
| Docking | peer Zhixu subject, supported signalMap, adapter endpoints, sandbox sessions. | Store workflow + proof; trust still comes from the registry. |

## Supplier Organization Path

```text
Nucleation defines supplier requirements
  -> Store records supplier profile / contact / platform tags
  -> Nucleation organizes the supplier into certain stages or role slots
  -> Store workflow reviews endorsement materials
  -> governance admin requests supplier attestation
  -> indexed SupplierAttested
  -> signal authorization is written at order registration time
  -> fulfillment proof feeds back into the supplier passport
```

Each step above has a different authority. Nucleation can organize the supplier network; the Store can maintain the platform catalog and audit; the trust domain can endorse the supplier subject; and whether the current order can submit a signal is still decided by `UVPStateMachine` authorization.

## Capability Passport

The Supplier page should read like a capability passport: show capability, endorsement, available stages, and proof first, then show contacts and notification settings.

| Section | Content |
| --- | --- |
| Identity | subject id, wallet, display name, legal/organization notes, metadata URI. |
| Nucleation usage | Which Nucleation uses it for which Zhixu, stage, and role slot. |
| Capability | Stages and resource/evidence types that can be handled, supported Product task intents, and whether it can act as a selector. |
| Trust | trust domain, attestation status, revocation reason, proof rows. |
| Operations | contacts, notification channels, SLA, service area, working hours, escalation path. |
| Runtime | open tasks, recent orders, failure/timeout history, active executor records. |
| Docking | If `supplierType` is `zhixu`, show peer Zhixu plan trust, signalMap template, and docking sandbox history. |

## Store Admin Display Language

- Nucleation decides how a supplier enters internal workflows.
- The trust domain decides whether the supplier is trustworthy.
- Platform capability tags are for catalog and search; `SupplierAttested` is for external endorsement.
- Contacts and notification success are operational workflow; fulfillment completion is shown by signal/proof.
- Supplier profile is capability material; current order submission authority is determined by signal authorization.

## As a Zhixu Supplier

When `supplierType=zhixu`, the supplier represents a peer Zhixu capability that can be called by another Zhixu. The Store should show the integration materials and proof:

- the peer Zhixu's Nucleation, active plan version, and plan trust;
- the local stage inputs it can accept;
- the output `str/cmp/err` signalMap;
- how the linked order is created or located;
- `DockedOrderLinked`, `DockedSignalMapped`, and `DockedSignalSubmitted` proof;
- proof bridge rules;
- historical docking fulfillment records.

The local order must explicitly allow mapped signals to advance through order registration, subsequent authorization paths, or the docking event path.
