---
title: Docking Sandbox
type: explanation
audience: 凝结核成员、docking/adapter 接入方
preread: README.md
status: verified
---

# Docking Sandbox

> Prerequisite reading: [Zhixu Store](README.md)
The Docking Sandbox lets the Nucleus trial-pair external orders, supplier signal maps, adapter workflows, or executor integrations. It handles configuration validation, proof checklists, and operator review material; formal publication and runtime integration still go through Zhixu publication, trust publication, order registration, signal authorization, and docking events.

## What it can do

- create sandbox sessions;
- validate matches between signal maps, role slots, stages, and capability plugins;
- save drafts;
- generate operator review material;
- help decide whether a supplier, adapter, or peer Zhixu can attach to a target order network.
- preview the linked order or adapter job to create atomically after a local stage with `orderTriggerKind: dock`;
- check peer Zhixu plan publication and supplier identity projections;
- generate a signalMap proof checklist.

## Formal path

```text
After trial pairing you still have to publish, review material, register the order, and submit on-chain proof.
```

Formal order publication goes through [Zhixu Catalog, Configuration, and Publication](zhixu-management.md); Plan registration goes through trust publication and the `commitPlan()` + `finalizePlan()` two-step path; order creation goes through the Product/registrar signed trigger-order path; signal authorization goes through the order-level authorization or stage overlay path; runtime peer-order integration must atomically create the linked order through `openDockedOrder` with committed route/interface proofs, then deliver facts through `submitDockedInput` / `submitDockedSignal`. Sandbox validation only outputs review material and risk hints — trust is still expressed by registry publication, and passing validation does not mean an Order can be created (see the [README.md](README.md) authority table).

## Suggested docking session structure

| Field | Description |
| --- | --- |
| localPlanId / localStage | The stage in the local Zhixu that will be opened to external execution interfaces. |
| nucleationId | The Nucleus that started this trial pairing. |
| executorType | `zhixu`, enterprise adapter, MCP agent, manual supplier. |
| peerZhixu | Target Zhixu subject, active plan, trust status. |
| signalMap | `str/cmp/err` mapping and source validation result. |
| resourceNeeds | Resource handles, manifests, and evidence requirements on both local and linked sides. |
| contact | Peer operator, adapter endpoint, notification policy. |
| proofChecklist | Proof requirements for linked-order registration, linked signals, and local mapped signals. |
| review | Operator notes, risks, approval status. |

## Special checks for `supplierType=zhixu`

The `signalMap` must contain at least `str` and `cmp`, one map should reference a single linked source, and its values must be published interface port names. The peer Zhixu's versioned plan publication must be visible, and linked-order relations and business facts must resolve into `DockOpened`, `DockInputSubmitted`, `DockOutputSubmitted`, and `DockTerminal` events rather than private lifecycle fields. Before the local order can advance, an authorized mapped signal or `DockOutputSubmitted` must appear on the local order. For full onboarding material and flow see [Zhixu as an execution interface](../apps/zhixu-as-executor.md).
