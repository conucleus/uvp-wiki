---
title: Supplier Directory, Capability, and Contact
type: reference
audience: Store operator、supplier 接入方
preread: README.md
status: verified
---

The Supplier Directory is the Store's off-chain workbench: it maintains the supplier directory, names, contact details, capability tags, matching features, and fulfillment proof. The Identity Registry only provides the offline subject-to-wallet mapping and cannot certify capability on the Store's behalf — for the authority boundary see the [README.md](README.md) "Information objects and authority sources" table and [../protocol-boundaries.md](../protocol-boundaries.md).

## Three classes of identity and tag sources

| Tag layer | Maintained by | Meaning | Authority boundary |
| --- | --- | --- | --- |
| Nucleus internal tags | Nucleus / order organizers | A supplier fits a stage, role slot, or resource/evidence type. | Capability judgment belongs to the Nucleus; signal authorization arises in the Order. |
| Store platform tags | Store operators | Catalog classification, search, industry, risk, operational visibility. | The Store carries its own interpretation and operating responsibility. |
| Identity binding | Identity Registry owner | Which wallet an offline subject corresponds to. | Contains no capability and creates no order permissions. |

Supplier "tagging" happens in layers. Store platform tags, Nucleus internal tags, external compliance material, and order authorization are displayed separately.

## Supplier information layers and the Capability Passport

The capability passport shows identity, capability profile, servable stages, and proof first, then contacts and notification settings. This table is both the definition of the supplier information layers and the passport block structure:

| Layer / block | Content | Authority |
| --- | --- | --- |
| Identity | Display name, subject id, wallet, organization notes, metadata URI; Registry binding status, revocation reason, proof rows. | Store metadata + `UVPIdentityRegistry` projection. |
| Nucleus fit / usage | Servable Zhixu, stages, role slots, resource/evidence types; which Nuclei organized this supplier into which Zhixu. | Nucleus organization semantics. |
| Capability | Catalog tags such as logistics, customs, inspection, payment, dispute review, document verification; servable stages, supported Product task intents, selector eligibility. | Store metadata + audit. |
| Contact / Operations | Contacts, notification channels, SLAs, available regions and hours, escalation paths, operational notes. | Store metadata; never on-chain plaintext. |
| Participation / Runtime | Recent orders, open tasks, historical proof, failure/timeout history, active executor records. | `UVPStateMachine` / Product projection. |
| Docking | Peer Zhixu subjects, supported signalMaps, adapter endpoints, sandbox sessions. | Store workflow + proof; identity bindings look at the Identity Registry. |

## Supplier organization path

```text
Nucleus defines supplier requirements
  -> Store records supplier profile / contact / platform tags
  -> Nucleus organizes the supplier into certain stages or role slots
  -> Store verifies identity material offline
  -> Registry owner registers the identity binding
  -> indexed IdentityBindingRegistered
  -> order registration writes signal authorization
  -> fulfillment proof feeds back into the supplier passport
```

Each step has a different authority: the Nucleus organizes internal candidates, the Store maintains the platform catalog and audit, and the Identity Registry resolves subject/wallet (see the [README.md](README.md) authority table); whether a signal may be submitted for the current Order is decided by `UVPStateMachine` authorization.

## Store admin display rules

- The Nucleus decides how a supplier enters its internal workflow.
- The Identity Registry only decides how the current directory resolves a subject to a wallet.
- Platform capability tags serve cataloging, search, and matching; the Store owns their interpretation and maintenance.
- Contact or successful notification is operational workflow; business completion looks at on-chain signals/proof ([../protocol-boundaries.md](../protocol-boundaries.md)).
- Supplier profiles serve as capability material; current-order submission rights look at signal authorization.

## As a Zhixu supplier

`supplierType=zhixu` marks a peer-order capability that other orders can call: the Store shows the peer Zhixu's Nucleus and active Plan version, the acceptable local stage inputs, the output `str/cmp/err` signalMap, and docking proof such as `DockedOrderLinked`, `DockedSignalMapped`, and `DockedSignalSubmitted` plus historical fulfillment records. Local orders must explicitly allow mapped signals to advance them through order registration, later authorization paths, or docking event paths. For the onboarding flow and field details see [Zhixu as an execution interface](../apps/zhixu-as-executor.md).
