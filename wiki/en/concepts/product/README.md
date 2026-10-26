---
title: Product DTO and User Surfaces
type: meta
audience: 产品与前端工程师、协议读者
preread: ../protocol-boundaries.md
status: verified
---

# Product DTO and User Surfaces

> Prerequisite reading: [Protocol Boundaries](../protocol-boundaries.md)
Product DTOs and user surfaces define the object language that ordinary users and product frontends see: orders, tasks, evidence, proof, participants, trust status, and the signal container. They do not carry event replay, indexing, or HTTP runtime; those runtime capabilities belong to [Chain Services](../services/chain-services.md). Product surfaces only care how on-chain projections are expressed as DTOs and consumed by Order App and uvp-client/browser.

```text
chain events
  -> rebuildable Chain Services projection
  -> Product DTO
  -> Order App / host (uvp-client/browser) / periphery adapter
```

The most important translation is from DSL stage to Product task:

```text
stage.receiveSignals
  -> compiled Hook
  -> emitReady=true
  -> HookReady
  -> ProductTaskDTO
  -> user or executor submits a Signal
  -> Product proof row
```

## Runnable surfaces

Product DTOs land in two runnable surfaces: the Order App (participant create/invite/accept/order-room flow) and `uvp-client/browser` (host-injected Product V3 reads and signing). Module READMEs carry their own screenshots; this page embeds none.

## Protocol language and product language

| Protocol language | What a product surface may say |
| --- | --- |
| `OrderRegistered` | The order has been created and is waiting for participants or task progress. |
| `SignalSubmitterAuthorized` | A participant has been allowed to submit a class of action. |
| `HookReady` | A task is now actionable. |
| `SignalSubmitted` | A participant submitted an evidence fingerprint or confirmation action. |
| `HookStatusChanged` | Waiting on a condition, ready, cancelled, or still unmet. |

Ordinary users mainly see orders, tasks, participants, evidence, and proof. Protocol fields such as `sourceId`, `signalId`, `hookId`, gas, and ABI can live in an advanced proof view in service of verifiability.

## User surfaces

| Page | Purpose |
| --- | --- |
| [Product DTO](dto.md) | Ordinary-user order/task/proof/trust DTOs that hide hook and ABI details. |
| [Signal Container](signal-container.md) | The product packaging for task, evidence, typed data, signature, submit, and proof. |
| [Order App and client](apps.md) | How the Order App, uvp-client/browser, and periphery adapters consume the same Product projection. |
| [Product API Endpoints](../../reference/product-api-endpoints.md) | Current Product API routes and semantics. |

## Boundaries

| Layer | Responsibility |
| --- | --- |
| [Chain Services](../services/chain-services.md) | Rebuild projections from chain events; provide a generic read API, optional relay, proof verifier, and chain health. |
| Product DTO and user surfaces | Define how ordinary users and product frontends express order/task/proof/trust, and define the signal-container data contract. |
| [Order App](../apps/order-app.md) / [UVP Client](../apps/uvp-client.md) | With a host-injected wallet: consume Product DTOs, sign typed data, and read proof. |
| [zhixu-registry](../store/README.md) | Record ZhixuRecord / IdentityClaim self-descriptions and opaque refs; no UI, review, supplier, or audit workflow. |

- Registry records, signatures, and opaque refs belong to the data layer; there is no storefront, supplier profile, review workflow, or JWT-session semantic.
- The Product API can prepare typed data, verify signatures, call the relayer, and return proof; authorization checks are always enforced by contracts. The single authoritative statement of protocol invariants is [Protocol boundaries](../protocol-boundaries.md).
- If a status returned by the Product API cannot be traced to event provenance, it is a product read model or workflow state, not a chain fact.
- The Product V3 client lives in `uvp-client/browser`; production runtime, key governance, and live operator runbooks are carried by execution and operations pages.
