# Zhixu Catalog, Configuration, and Publishing

The Zhixu Catalog in the Store is where Nucleation publishes a Zhixu design, organizes materials, asks the platform workflow to review it, and requests trust-domain endorsement. Internal stages, fairness rules, and supplier organization principles are maintained by Nucleation; this page only describes the Store side. The DSL object itself is covered in the core concept [Zhixu](../concepts/core/zhixu.md).

## Page Goals

The Zhixu Catalog should help Nucleation, Store operators, and trust reviewers each see clearly:

- which Nucleation created and maintains this Zhixu;
- which stages, sources, triggers, supplier slots, resources, and evidence requirements it defines;
- how it explains internal fairness, choice, exception handling, and transparency;
- its current draft / compiled / reviewed / attested / revoked / deprecated status;
- whether the planId, planHash, compiler/schema version are reproducible;
- whether it includes peer docking with `supplierType=zhixu`;
- whether the current version can create new orders or only browse historical orders.

## Who Is Responsible for What

| Item | Owner | Store role |
| --- | --- | --- |
| Internal Zhixu design | Nucleation | Provides authoring/import, compile preview, graph, and version workbench. |
| Supplier organization and fairness rules | Nucleation | Shows supplier requirements, resource/evidence checklist, and explanation materials. |
| Platform catalog tagging | Store operator | Adds platform tags for catalog, industry, risk, visibility, and recommended version. |
| Publishing material review | Store reviewer | Confirms the materials are complete, compilable, and reviewable; does not directly decide whether they are fair and trustworthy. |
| External trust endorsement | Trust domain | Expressed through registry attestation/revocation. |
| Order runtime facts | `UVPStateMachine` | The Store only displays projections and proof. |

## Publishing Path

```text
Nucleation imports Zhixu
  -> compile preview
  -> Product Schema / resource / supplier requirement validation
  -> Nucleation fills in fairness, transparency, and exception handling notes
  -> Store workflow review
  -> approved_for_broadcast
  -> governance admin requests attestation
  -> indexed PlanAttested
  -> active/order-creatable version
```

`approved_for_broadcast` means the platform workflow allows an endorsement request to be started. On-chain endorsement is expressed by `PlanAttested`, and Zhixu fairness is supported jointly by Nucleation materials and trust-domain review.

## What the Store Can Save

- draft source, compile preview, planId, planHash, artifact hash;
- Nucleation identity, maintenance notes, version notes, deprecated/revoked display status;
- stage explanation, source map, trigger, supplier slot, resource handle;
- fairness / transparency / exception policy materials;
- platform catalog tags, risk labels, visibility, active recommendation;
- Product Schema bundle, add-on manifest, capability/plugin metadata;
- governance request id, broadcast state, audit reference.

## Store Display Language

- Store review approved: the platform workflow has passed, and the item can move to endorsement request or publishing.
- Compile preview passed: the artifact can be generated, while on-chain registration still depends on `registerPlan()` and the registry projection.
- Active recommendation: the Store recommends a version as the new-order entry point, while existing orders stay bound to the original `planId`.
- Store copy: explains the materials and operational state; `planId`, `planHash`, and the on-chain artifact keep the compile result.
- Store admin: maintains the platform workflow, while Nucleation maintains internal Zhixu stages, fairness rules, and supplier organization principles.

## What the Trust Domain Looks At

The trust domain is the external endorsement source for the Store page. It should judge whether a Zhixu can be endorsed based on reviewable materials, for example:

- whether the stages, sources, and triggers are transparent and explainable;
- whether supplier selection and selector permissions are clear;
- whether evidence requirements, resource handles, and proof paths are verifiable;
- whether failure, disputes, revocation, and exception handling are defined;
- whether the planId/planHash match the submitted materials;
- whether this Nucleation has the reputation and ability to maintain the Zhixu.

The Store can organize and display these materials; endorsement facts can only come from the `ZhixuTrustRegistry` projection.

## Checklist

| Check | What the Store shows | Authority |
| --- | --- | --- |
| Is the DSL compilable? | compile preview, artifact hash, validation errors. | compiler output. |
| Who is the Nucleation? | `spec.nucleation.id`, maintenance notes, version history. | Zhixu metadata + Store workspace. |
| Are the fairness materials complete? | selector, supplier slot, exception handling, evidence requirements. | Nucleation-submitted materials; trust domain makes the external decision. |
| Is the Plan officially trusted? | trusted/revoked/not found badge. | `ZhixuTrustRegistry` projection. |
| Does the stage have an execution entry point? | trigger hook, Product task preview. | compiled HookPlan + state-machine events. |
| Does the Supplier capability match? | required capability vs supplier passport. | Internal Zhixu semantics + Store metadata; trust is checked in the registry. |
| Is the docked Zhixu usable? | peer plan trust, signalMap validation, relation draft. | registry projection + compiler validation + workflow audit. |
