---
title: Product DTO
type: reference
audience: 产品与前端工程师
preread: README.md
status: verified
---

# Product DTO

> Prerequisite reading: [Product DTO and User Surfaces](README.md)
Product DTOs are stable contracts for ordinary users and product frontends. They translate protocol fields into orders, tasks, proof, participants, and trust status.

## ProductOrderDTO

`productOrderFromStateMachine()` maps `StateMachineOrderProjection` to `ProductOrderDTO`. Typical content:

| Field | Source |
| --- | --- |
| order identity | `orderId`, chain, contract, deployment. |
| plan proof | `planId`, `planHash`, plan registration event. |
| status | Mapped from the projection status. |
| tasks | Mapped from `StateMachineTaskProjection`. |
| timeline | Generated from chain events and projection effects. |
| proof | Generated from event provenance. |
| trust | Merged from the identity projection. |

The money surface is currently expressed as a placeholder; no real funds move. When a Plan declares a payment-type capability plugin, the order DTO carries a `settlementPreview`:

```text
settlementPreview.label = "稳定币模块占位" (stablecoin module placeholder)
settlementPreview.adapterStatus = "placeholder"
settlementPreview.disclaimer = "当前不托管、不划转、不释放、不退款任何资金，只记录付款条件和证明。"
(no custody, transfer, release, or refund of any funds; only payment conditions and proof are recorded)
```

This means the core UVP protocol is not a payment provider. Stablecoins, settlement custody, or guarantees should be integrated by a periphery adapter.

## ProductTaskDTO

`productTaskFromStateMachineTask()` enriches a task into a structure ordinary users can act on:

| Field | Meaning |
| --- | --- |
| assignee wallet | The wallet currently expected to handle the task. |
| supplier identity | Supplier trust information and proof. |
| capability / add-on | Execution capability or extension action. |
| resource requirements | Resource requirements, manifest, policy. |
| canSubmit | Whether the current user appears able to submit. |
| proofSummary | Summary proof. |
| proofRows | Concrete chain-event proof. |

`canSubmit` is a product-side helper judgment, not final authorization. Contracts still check explicit Signal authorization or Plan-bounded dynamic executor appointment.

## Status mapping

Orders do not carry a business lifecycle status:

| Projection status | Product status | Meaning |
| --- | --- | --- |
| `registered` | `registered` | The `orderId` is registered; later progress is read separately from Signals, Hooks, and Tasks. |

Task statuses map as:

| Projection status | Product status |
| --- | --- |
| `ready` | `open` |
| `submitted` | `submitted` |
| `cancelled` | `blocked` |
| unknown | `blocked` |

DTO field and status mapping is authoritative in the `@uvp-eth/product-dto` package type definitions.

## Related Pages

- [Product Surfaces entry](README.md)
- [Signal Container](signal-container.md)
- [Event Projections](projections.md)
- [Product API Endpoints](../../reference/product-api-endpoints.md)
