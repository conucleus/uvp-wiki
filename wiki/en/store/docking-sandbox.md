# Docking Sandbox

The Docking Sandbox lets Nucleation trial external Zhixu, supplier signal maps, adapter workflows, or executor integrations. It handles configuration validation, proof checklists, and operator review materials; formal publishing and runtime integration still go through Zhixu publishing, trust attestation, order registration, signal authorization, and docking events.

## What It Can Do

- create sandbox sessions;
- validate matches between signal maps, role slots, stages, and capability plugins;
- save drafts;
- generate operator review materials;
- help decide whether a supplier, adapter, or peer Zhixu can be attached to a target Zhixu.
- preview the linked order or adapter job that should be created after a local stage trigger;
- check peer Zhixu plan trust and supplier trust projections;
- generate a signalMap proof checklist.

## Handoff to the Formal Path

- Formal Zhixu publishing goes through [Zhixu Catalog, Configuration, and Publishing](zhixu-management.md).
- Plan registration goes through trust attestation and the `registerPlan()` path.
- Order creation goes through the Product/registrar signed trigger-order path.
- Signal authorization goes through the order-level authorization or stage overlay path.
- Runtime peer-order integration goes through the `linkDockedOrder` / `submitDockedSignal` event path.
- Sandbox validation produces review materials and risk hints; trust is still expressed by registry attestation.

## Page Guidance

The Docking page must keep reminding users:

```text
After trial pairing, you still have to publish, endorse, register the order, and submit on-chain proof.
```

Formal publishing still has to go through Zhixu configuration and publishing, governance attestation, `registerPlan`, signed trigger-order creation, and the Product projection path.

## Suggested Docking Session Structure

| Field | Description |
| --- | --- |
| localPlanId / localStage | The stage in the local Zhixu that will expose execution interfaces to the outside. |
| nucleationId | The Nucleation that initiated this trial pairing. |
| executorType | `zhixu`, enterprise adapter, MCP agent, manual supplier. |
| peerZhixu | The target Zhixu subject, active plan, and trust status. |
| signalMap | `str/cmp/err` mapping and source validation result. |
| resourceNeeds | Resource handles, manifests, and evidence requirements on both the local and linked sides. |
| contact | Peer operator, adapter endpoint, notification policy. |
| proofChecklist | Proof requirements for linked order registration, linked signal, and local mapped signal. |
| review | Operator notes, risks, and approval status. |

## Special Checks for `supplierType=zhixu`

- `signalMap` must contain at least `str` and `cmp`.
- The same `signalMap` should reference the same linked source.
- The peer Zhixu's plan trust must be visible.
- The linked order lifecycle must resolve into state-machine events.
- Before the local order can advance, an authorized mapped signal or `DockedSignalSubmitted` must appear on the local order.
