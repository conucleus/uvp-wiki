# Supplier

Supplier is a capability subject. It can be an individual, a company, a customs broker, a logistics provider, a payment adapter, a guarantor, an AI service, an MCP agent, an enterprise system, or even a dockable Zhixu. Supplier answers “who has this kind of capability.” Nucleation designs the Zhixu; the executor performs the actual submission for the current Order and stage; the Supplier provides the capability and trust subject.

## Where Supplier Comes From

In the product path, a Supplier is usually first organized by Nucleation into a Zhixu’s supplier network, and then enters the supplier registry in Store. As a platform workbench, Store maintains the supplier profile, platform capability tags, supported roles/stages, wallet, review status, contact information, and metadata. The trust domain then endorses the supplier subject on chain through `ZhixuTrustRegistry.SupplierAttested`.

The minimal relationship is:

```text
Store supplier metadata
  + Nucleation supplier requirements
  + ZhixuTrustRegistry.SupplierAttested
  + Product projection
  -> Supplier capability passport
```

Tags should be layered: Nucleation can tag a Supplier as a role/stage candidate inside a specific Zhixu; Store can use platform catalog tags for customs / logistics / inspection / payment capabilities; the trust domain can endorse the supplier subject externally. The decentralized part is responsible for storing endorsement events, revocation events, order authorization, and signal proof.

## SupplierDefinition

The compiler types include `SupplierDefinition`:

```text
apiVersion: uvp/v0
kind: Supplier
metadata
spec
  supplierType
  realIdType
  realId
  supplierName
  handlerName
  authorityID
  trustDomain
  capabilityClaims
  attestationRefs
  status
  SupplierHandlerConfig
```

This definition describes supplier identity and capability declarations. Order submission rights are determined by `SignalSubmitterAuthorized` and the active executor overlay.

## Capability Tags

The supplier capability tags currently supported in Product DTOs include:

| Tag | Description |
| --- | --- |
| `logistics` | Logistics fulfillment capability. |
| `customs` | Customs declaration / clearance capability. |
| `inspection` | Inspection, acceptance, and quality-control capability. |
| `payment` | Payment or settlement adapter capability. |
| `dispute-review` | Dispute review capability. |
| `document-verification` | Document verification capability. |

These tags help Store and the Product API recommend or validate execution networks, but the tags themselves do not create on-chain permissions.

If the tag comes from Nucleation, it means “this role/stage is suitable in the internal design of this Zhixu.” If the tag comes from Store, it means platform catalog and search semantics. Trust-domain endorsement is expressed separately by `SupplierAttested`.

## Supplier Trust

`SupplierAttested` means a trust domain recognizes a particular supplier subject. `SupplierRevoked` means the endorsement has been withdrawn. The Product BFF will reject or warn about revoked supplier wallets when creating future order authorizations.

This layer of trust answers “is this subject endorsed by an authority.” Whether the current Order can submit the current signal is solved by order-level authorization.

## Supplier vs. Executor

| Concept | Meaning |
| --- | --- |
| Supplier | The capability and identity layer, usually organized by Nucleation and maintained in Store with profiles, platform tags, and endorsement materials. |
| Executor | The wallet or executor actually bound to a specific Order stage at runtime. |

A Supplier can send different executor wallets to different Orders; an executor wallet can also represent a Supplier subject. Documentation and UI must keep “supplier trustworthiness” separate from “order submission permission.”

## Zhixu as Supplier

When `supplierType=zhixu`, the Supplier represents a peer Zhixu capability that can be called by another Zhixu. It is still a trust subject, and the fulfillment mode is to start or dock into another executable Zhixu.

This kind of Supplier should be displayed in Store with:

- the peer Zhixu’s active plan and plan trust;
- supported `signalMap`;
- available operator/contact/adapter information;
- historical docking proof;
- linked-order creation or lookup rules;
- `DockedOrderLinked`, `DockedSignalMapped`, and `DockedSignalSubmitted` proof.

For the local Order to keep advancing, a local authorized signal or a docking-mapped signal must appear. See [Executor](executor.md) and [Zhixu as Executor](../../execution/zhixu-as-executor.md).
