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
| peerZhixu | The target Zhixu's definition name (the cloud track's unique registered name), active plan, trust status. |
| interface / orderMode | The selected target interface name and its allowed order modes (new/existing; the trial pairing checks `order.mode ∈ orderModes`). |
| inputMap / signalMap | The local-channel/signal to target-interface port-name mappings and their source validation result (at least one non-empty map). |
| resourceNeeds | Resource handles, manifests, and evidence requirements on both local and linked sides. |
| contact | Peer operator, adapter endpoint, notification policy. |
| proofChecklist | Proof requirements for linked-order registration, linked signals, and local mapped signals. |
| review | Operator notes, risks, approval status. |

## Special checks for `supplierType=zhixu`

At least one of `inputMap`/`signalMap` must be non-empty, its values must be published interface port names, and the bound ports must come from a single linked source; a `mode=new` route carries exactly one input binding (the birth anchor). The peer Zhixu's versioned plan publication must be visible, and linked-order relations and business facts must resolve into `DockOpened`, `DockInputSubmitted`, `DockOutputSubmitted`, and other state-machine/docking events (a `mode=existing` docking only attaches an existing target order and produces no new child order) rather than private lifecycle fields. Before the local order can advance, an authorized mapped signal or `DockOutputSubmitted` must appear on the local order. For full onboarding material and flow see [Zhixu as an execution interface](../apps/zhixu-as-executor.md).
