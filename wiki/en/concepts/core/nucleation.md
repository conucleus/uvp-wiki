# Nucleation

Nucleation is the originating nucleus, designer, and organizer of a Zhixu. It corresponds to `spec.nucleation.id` in the DSL and identifies “who originated and maintains this kind of coordination design.” In an Order, the executor, Store admin, and trust domain respectively take responsibility for runtime execution, platform workflow, and external endorsement.

```yaml
spec:
  nucleation:
    id: procurement-nucleus
```

## What Nucleation Is Responsible For

Nucleation is responsible for the internal design and operating principles of a Zhixu:

- design the task patterns, stages, sources, signals, hooks, and triggers;
- define which stages need which Supplier capabilities;
- design choice rights, resource requirements, evidence requirements, and fairness rules;
- organize the supplier network and maintain internal coordination, fairness, and operation;
- decide when to publish a new version and when to retire an old one.

These responsibilities first appear in the Zhixu DSL, resource handles, Product schema, supplier requirements, and release materials. After compilation, they enter the Plan artifact, plan hash, and version boundary that can be reviewed by a trust domain.

## Responsibility Boundary

| Adjacent role | Division of labor |
| --- | --- |
| Store admin | Provides the platform workbench, review materials, catalog, and release flow. |
| Trust domain | External arbiter responsible for endorsing whether a plan or supplier is trustworthy, fair, and usable. |
| Supplier | Capability subject that may be organized by Nucleation into a Zhixu. |
| Executor | Runtime executor or submitter for a given Order. |
| Registrar | Authorized subject that registers Orders. |

## Relation to Zhixu, Plan, and Order

```text
Nucleation
  -> designs Zhixu
  -> compiles into Plan
  -> requests trust domain endorsement
  -> creates or allows creation of Order
  -> maintains Zhixu operation through proof and supplier network
```

Zhixu is the static definition designed by Nucleation. Plan is the chain-targeted artifact for one version of that Zhixu. Order is one runtime instance of a Plan. Nucleation can maintain multiple Zhixu definitions or multiple versions; runtime still goes through plan attestation, order registration, signal authorization, and chain proof.

## Relation to Store

Store is the workbench and display surface for Nucleation. Store can help Nucleation import Zhixu definitions, preview compilation, organize supplier materials, display fulfillment proof, initiate attestation requests, and maintain audits; on-chain plan/supplier/order/signal facts still come from registry and state-machine events.

See [Nucleation Workbench](../../store/nucleation-workbench.md) for the product view on the Store side.
