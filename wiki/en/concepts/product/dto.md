# Product DTO

Product DTOs are stable contracts for ordinary users and product frontends. They translate protocol fields into orders, tasks, proofs, participants, and trust state.

## ProductOrderDTO

`productOrderFromStateMachine()` maps `StateMachineOrderProjection` to `ProductOrderDTO`. Typical content includes:

| Field | Source |
| --- | --- |
| order identity | `orderId`, chain, contract, deployment. |
| plan proof | `planId`, `planHash`, and the plan registration event. |
| status | Mapped from projection status. |
| tasks | Mapped from `StateMachineTaskProjection`. |
| timeline | Generated from chain events and projection effects. |
| proof | Generated from event provenance. |
| trust | Merged from the trust projection. |

The funding fields are intentionally expressed as not yet integrated:

```text
totalAmount.display = "funding custody not integrated"
fundingStatus = "funding custody is not integrated into this interface"
```

This means the core UVP protocol is not a payment provider. USDC, escrow, or guarantee should be integrated by a periphery adapter.

## ProductTaskDTO

`productTaskFromStateMachineTask()` enriches a task into a structure ordinary users can act on:

| Field | Meaning |
| --- | --- |
| assignee wallet | The wallet currently expected to handle the task. |
| supplier trust | Supplier trust information and proof. |
| capability / add-on | Execution capability or extension action. |
| resource requirements | Resource requirements, manifest, and policy. |
| canSubmit | Whether the current user appears able to submit. |
| proofSummary | Summary proof. |
| proofRows | Concrete chain-event proof rows. |

`canSubmit` is only a product-side helper; it is not the final authorization. The contract still checks `SignalSubmitterAuthorized`.

## Status Mapping

Order status can be mapped as:

| Projection status | Product status |
| --- | --- |
| `registered` | `pending_participants` |
| `running` | `active` |
| `waiting` | `active` |
| `action_required` | `active` |

Task status can be mapped as:

| Projection status | Product status |
| --- | --- |
| `ready` | `open` |
| `submitted` | `submitted` |
| `cancelled` | `blocked` |
| unknown | `blocked` |
