---
title: Nucleus / 凝结核
type: explanation
audience: 协议读者
preread: README.md
status: verified
---

# Nucleus / 凝结核

A nucleus (凝结核) is the initiating, designing, and maintaining core of a Zhixu — the organizational origin that lets one class of coordination rules take shape, gain boundaries, and stay maintained over time; concrete order stages are executed by participants. Read it first as the originating organizer of a reusable operating model: a procurement operations team, an industry project organizer, a platform-side workflow designer, or any organization able to maintain such a rulebook long term.

`Nucleus` is the subject name; `nucleation` is the nucleating process, context, and the DSL/API field name. `spec.nucleation.id` identifies the nucleus that initiates and maintains a class of order design. Executors in orders, Store admins, and Registry operators respectively carry runtime execution, platform workflow, and identity verification.

## Who Uses It

Nucleus organizations (procurement operations teams, industry organizers, workflow designers) use it to declare their role identity; Store provides the nucleus workbench; the Registry and contracts land authoritative facts only on its publication and registration actions.

## What It Produces

A nucleus designs and maintains Zhixu DSL, which through compilation and publication forms Plan version boundaries, and organizes supplier networks and order operation; its design decisions enter Plan artifacts, plan hashes, and auditable version records.

## Where Authority Comes From

A nucleus is not automatically a Store operator, Identity Registry authority, registrar, or submitter wallet. It may appear in workflow materials and Store records, but on-chain authority still comes from plan publication, publisher/registrar permissions, order-level authorization, and participant signatures.

```yaml
spec:
  nucleation:
    id: procurement-nucleus
```

## What a Nucleus Is Responsible For

The nucleus owns design and operating principles inside its order:

- Designing the Zhixu's task patterns, stages, sources, signals, hooks, and triggers;
- Defining which stages need which supplier capabilities;
- Designing choice rights, resource requirements, evidence requirements, and operating rules;
- Organizing supplier networks and maintaining collaboration and operation inside the order;
- Deciding when to submit new versions and when to retire old ones.

These responsibilities first appear in Zhixu DSL, resource handles, Product schema, supplier requirements, and publication materials. After compilation they enter Plan artifacts, plan hashes, and version boundaries auditable by the Identity Registry.

## Responsibility Boundaries

| Adjacent role | Division |
| --- | --- |
| Store admin / external institutions | Platform workbench, material review, cataloging, and publication processes; each makes its own judgment about compliance, capability, and recommendation. |
| Supplier | Capability subject, possibly organized into the order by the nucleus. |
| Executor | Runtime executor or submitter within one order. |
| Registrar | The authorized subject registering orders. |

For spelling conventions see the [Core Glossary](../../reference/glossary.md).

## Relation to Zhixu, Plan, and Order

```text
Nucleus / 凝结核
  -> designs Zhixu
  -> compiles into Plan
  -> publisher signs to publish Plan
  -> creates or allows creating Orders
  -> maintains order operation through proof and the supplier network
```

A Zhixu is the reusable rulebook designed by the nucleus. A Plan is the chain-target artifact of one order version. An Order is one run of one Plan. A nucleus can maintain multiple orders or multiple versions; runtime still goes through plan publication, order registration, signal authorization, and chain proof.

## Relation to Store

Store is the workbench and showcase for nuclei. Store can help nuclei import orders, preview compilation, organize supplier profiles, display fulfillment proof, initiate publication requests, and maintain audit; on-chain plan/supplier/order/signal facts come from registry and state-machine events.

For the Store-side product view see [Nucleation Workbench](../store/nucleation-workbench.md).
