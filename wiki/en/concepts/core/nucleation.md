# Nucleus / Nucleation

The **Nucleus** is the originating, designing, and maintaining core of a Zhixu. It is not the actor that executes a specific Order stage. It is the organizing core that lets a class of coordination rules take shape, gain a boundary, and keep being maintained over time. Read it first as the originating organizer of the reusable operating model: a procurement operations team, an industry program owner, a platform-side workflow designer, or another organization that can maintain the rulebook.

Use **Nucleus** for the subject. Use **nucleation** for the process, context, or existing DSL/API field names. The current protocol field remains `spec.nucleation.id`; it identifies which Nucleus originated and maintains this kind of coordination design. In an Order, the executor, Store admin, and trust registry respectively take responsibility for runtime execution, platform workflow, and external endorsement.

The Nucleus is not automatically the same as a Store operator, trust registry, registrar, or submitter wallet. It may appear in workflow materials and Store records, but on-chain authority still comes from plan attestation, publisher/registrar permissions, order-level authorization, and participant signatures.

```yaml
spec:
  nucleation:
    id: procurement-nucleus
```

## Why "Nucleus"

"Nucleus" emphasizes the core around which a coordination order forms. It is not primarily a scheduler, owner, signer, or executor. It carries three meanings:

- origin: a subject first proposes and maintains a class of coordination rules;
- aggregation: suppliers, resources, evidence requirements, choice rights, and exception paths organize around that rulebook;
- boundary: the Nucleus decides what belongs in the Zhixu and what remains in Store workflow, trust registry review, or external business systems.

For that reason, the project does not translate this role as `orchestrator`, `owner`, `creator`, or `vow-maker`. Those words overemphasize scheduling, property, one-time creation, or subjective intent, and miss the idea of a core that lets a Zhixu form and remain maintainable.

## What the Nucleus Is Responsible For

The Nucleus is responsible for the internal design and operating principles of a Zhixu:

- design the task patterns, stages, sources, signals, hooks, and triggers;
- define which stages need which Supplier capabilities;
- design choice rights, resource requirements, evidence requirements, and fairness rules;
- organize the supplier network and maintain internal coordination, fairness, and operation;
- decide when to publish a new version and when to retire an old one.

These responsibilities first appear in the Zhixu DSL, resource handles, Product schema, supplier requirements, and release materials. After compilation, they enter the Plan artifact, plan hash, and version boundary that can be reviewed by a trust registry.

## Responsibility Boundary

| Adjacent role | Division of labor |
| --- | --- |
| Store admin | Provides the platform workbench, review materials, catalog, and release flow. |
| Trust registry | External arbiter responsible for endorsing whether a plan or supplier is trustworthy, fair, and usable. |
| Supplier | Capability subject that may be organized by the Nucleus into a Zhixu. |
| Executor | Runtime executor or submitter for a given Order. |
| Registrar | Authorized subject that registers Orders. |

## Naming Rule

| Name | Use it for |
| --- | --- |
| `Nucleus` | The subject: the organizing core that originates, designs, and maintains a class of Zhixu. |
| `nucleation` | The process, context, or field name. Current DSL/API names keep `spec.nucleation.id` and `nucleationId`. |
| `Nucleus workbench` | The Store workspace for drafts, versions, suppliers, resources, and endorsement materials around a Nucleus. |
| Store operator | Platform workflow role, not the Nucleus. |
| Trust registry | External endorsement role, not the Nucleus. |

## Relation to Zhixu, Plan, and Order

```text
Nucleus
  -> designs Zhixu
  -> compiles into Plan
  -> requests trust registry endorsement
  -> creates or allows creation of Order
  -> maintains Zhixu operation through proof and supplier network
```

Zhixu is the reusable rulebook designed by a Nucleus. Plan is the chain-targeted artifact for one version of that Zhixu. Order is one runtime instance of a Plan. A Nucleus can maintain multiple Zhixu definitions or multiple versions; runtime still goes through plan attestation, order registration, signal authorization, and chain proof.

## Relation to Store

Store is the workbench and display surface for the Nucleus. Store can help a Nucleus import Zhixu definitions, preview compilation, organize supplier materials, display fulfillment proof, initiate attestation requests, and maintain audits; on-chain plan/supplier/order/signal facts still come from registry and state-machine events.

See [Nucleus Workbench](../../store/nucleation-workbench.md) for the product view on the Store side.
