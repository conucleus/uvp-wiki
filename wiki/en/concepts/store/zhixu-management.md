---
title: Zhixu Catalog, Configuration, and Publication
type: explanation
audience: Store 产品与运营、凝结核成员
preread: README.md
status: verified
---

The Zhixu Catalog is the Nucleus workbench for maintaining order design, compiler material, and Store-facing records. The Nucleus owns stages, fairness rules, exception handling, and supplier organization; the Store owns cataloging, review, search, version selection, and operating records.

## Nucleation workbench

The Nucleation workbench serves order designers and organizers. It provides Zhixu drafts, compile previews, a supplier directory, resource configuration, version publication material, proof, and audit.

| Participant | Identity and rights | Source of rights |
| --- | --- | --- |
| Nucleus | Designs Zhixu, organizes candidate suppliers, maintains order material. | Nucleus internal governance and Store workspace permissions. |
| Store operator/reviewer | Maintains the catalog, reviews material, sets visibility and recommendations. | Store institutional rules and access control. |
| Publisher | Signs to publish a Plan. | StateMachine publisher rights and EIP-712 signatures. |
| Registry operator | Verifies offline subjects and registers subject/account bindings. | Identity Registry owner rights. |
| Order participant | Accepts an order role and submits authorized Signals. | Order-level authorization, the active executor overlay, and signatures. |

Authority sources for each object are unified in the [README.md](README.md) "Information objects and authority sources" table; this page does not restate boundary arguments.

## Publication path

> This diagram is the single wiki-wide source for the publication path. Other pages that reference this path link here directly instead of copying the diagram or step list.

```text
Import Zhixu
  -> compile preview
  -> Product Schema and resource requirement validation
  -> Store review
  -> publisher signature
  -> PlanCommitted / metadata registration / PlanFinalized
  -> StateMachine PlanRegistered projection
  -> Store selects an active version
```

Plan publication authority comes from the publisher signature. Any relayer may broadcast a valid signature. Store review only decides whether the Store displays, recommends, or assists in publishing this version.

## Material kept by the Store

- draft source, compile preview, planId, planHash, artifact hash;
- Nucleus identity, maintenance notes, version notes, and Store lifecycle;
- stage explanations, supplier requirements, resource/evidence checklists;
- platform catalog tags, risk notices, visibility, and active recommendation;
- Product Schema bundles, add-on manifests, capability/plugin metadata;
- review, broadcast, and audit records.

## Sources of fact

For facts such as whether a Plan is published, who published it, which Plan an Order currently uses, or whether a supplier fits a stage, the authority sources are unified in the [README.md](README.md) "Information objects and authority sources" table; this page no longer keeps a separate list.

The Identity Registry only records the mapping between real-world subjects and wallets; it performs no capability certification — see the one-line version in the [README.md](README.md) authority table and the full discussion in [../protocol-boundaries.md](../protocol-boundaries.md).
