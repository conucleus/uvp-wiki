# Zhixu Catalog, Configuration, and Publication

The Zhixu Catalog is the Nucleus workspace for coordination design, compiler material, and Store-facing records. The Nucleus owns stages, fairness rules, exception handling, and supplier organization. The Store owns cataloging, review, search, version selection, and operating records.

## Publication path

```text
Import Zhixu
  -> compile preview
  -> Product Schema and resource validation
  -> Store review
  -> publisher signature
  -> PlanCommitted / metadata registration / PlanFinalized
  -> StateMachine PlanRegistered projection
  -> Store selects an active version
```

Plan publication authority comes from the publisher signature. Any relayer may broadcast a valid signature. Store review determines Store display, recommendation, and publishing assistance.

## Store-managed records

- draft source, compile preview, planId, planHash, and artifact hash;
- Nucleus identity, maintenance notes, version notes, and Store lifecycle;
- stage explanations, supplier requirements, and resource/evidence checklists;
- catalog tags, risk notices, visibility, and active recommendation;
- Product Schema bundles, add-on manifests, and capability/plugin metadata;
- review, broadcast, and audit records.

## Sources of fact

| Fact | Source |
| --- | --- |
| DSL compilation | Compiler output. |
| Plan publication | `UVPStateMachine` Plan-event projection. |
| Plan publisher | Publisher signature and publisher event. |
| Store recommendation | Store database and audit records. |
| Plan bound to an Order | `OrderRegistered` and the Order projection. |
| Supplier fit for a stage | Nucleus judgment and Store matching records. |

The Identity Registry records real-world subject-to-wallet mappings. StateMachine, the Nucleus, and the Store respectively own Plan publication, capability judgment, and version recommendation.
