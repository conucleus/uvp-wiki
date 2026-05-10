# Store Authority Boundary and Information Architecture

The information architecture of the Store must separate three things: internal Nucleus governance, Store platform workflow, and external trust-domain endorsement. The Store gives the Nucleus a stage, gives operators a catalog and review tools, and gives trust reviewers materials and proof. Protocol facts come from registry/state-machine events.

## Information Objects

| Store object | Primary owner | On-chain fact | Store-organized information |
| --- | --- | --- | --- |
| Nucleus | Zhixu designer / Zhixu organizer | No independent contract state; it is reflected in Zhixu/Plan/Order/proof. | identity, maintenance notes, version history, design materials, and publishing materials. |
| Zhixu draft/version | Nucleus design, trust-domain endorsement | `PlanAttested` / `PlanRevoked` determine official trust. | draft, compile preview, fairness materials, platform tags, active recommendation. |
| Supplier | Nucleus organization, trust-domain endorsement | `SupplierAttested` / `SupplierRevoked` determine the trust projection. | profile, capability tags, contacts, notification channels, review status, historical participation records. |
| Order | registrar/participants/executors | `OrderRegistered` and state-machine events determine runtime status. | search, sorting, tags, operator notes, proof summary. |
| Task / performance | authorized submitters | `SignalSubmitted`, `HookReady`, and stage overlay events determine status. | fulfillment view, anomaly hints, contact reminders, SLA display. |
| Platform workflow | Store operator/reviewer/admin | registry tx and indexed events determine public claims. | approval, confirmation, audit, broadcast request, failure reason. |
| Docking relation | state-machine events and mapped signal proof on both the local/linked orders | mapped signals and proof determine local order progression. | sandbox session, peer Zhixu selection, relation metadata, operator review. |

## What the Store Home Should Organize

- Search first: the same query can hit Nucleus, Zhixu, Order, Supplier, and governance objects.
- Nucleus visible: Zhixu versions should show who designed and maintains them, and also show Store status.
- Trust visible: any plan/supplier trust must show the status from the registry projection.
- Proof reachable: orders, tasks, and supplier participation should all lead into proof/timeline views.
- Store-only metadata labeled: draft, review, note, contact, notification, and platform tag must be marked as Store/workflow information.
- Revoked visible but blocked: revoked plans/suppliers can still be found by operators, and they must be blocked from new-order creation entry points.
- Docking visible: peer Zhixu, adapter, signalMap, and local/linked proof should all be reachable from the same workflow.

## Recommended IA

```text
Store Home / Search
  -> Nucleus Workbench
       -> identity / design material / supplier organization / publish material
  -> Zhixu Catalog
       -> draft / compile preview / fairness material / trust status / active version
  -> Supplier Registry
       -> profile / nucleation fit / platform tags / contact / trust / participation
  -> Orders & Proof
       -> order detail / task timeline / proof rows / revoked warnings
  -> Docking
       -> sandbox / signalMap validation / local-linked relation / proof bridge
  -> Platform Workflow
       -> review / attestation request / revocation request / audit
```

Search can cross object types, but each object detail page must show its own authority source. For example, a supplier search hit is a Store profile, so the trust badge must come from the registry projection; a Zhixu card can show a Store-recommended version, but the official status must come from the plan attestation.

## Disallowed IA

- Store list sorting, platform tags, or operational recommendations may use workflow/metadata language.
- Do not describe Store admin as the internal Zhixu governor; the internal governance owner is the Nucleus.
- Do not let ordinary user pages take over the Store search / governance / supplier-registry functions.
- Do not let Store metadata revive a revoked plan or revoked supplier.
- Do not hide chain syncing/rebuild status, so operators do not mistake projection lag for the object not existing.
- Do not let a docking sandbox "pass" become new-order creation capability.
- Do not write contact delivered, message read, or operator note as operational records; business signals belong to state-machine events.
