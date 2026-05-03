# Store

The Store is the product workbench between Nucleation, Suppliers, trust domains, operators, and ordinary execution interfaces. It provides a catalog, compile previews, resource and supplier organization, proof views, contact notifications, publish workflows, attestation requests, and audit. Nucleation handles internal Zhixu design, trust domains provide external endorsement, and `UVPStateMachine` plus `ZhixuTrustRegistry` provide on-chain facts.

```text
Nucleation
  -> Store workspace and catalog
  -> compile preview / supplier organization / proof materials
  -> Store workflow review and audit
  -> trust-domain attestation request
  -> registry/state-machine projections
```

## Three-Layer Governance

| Layer | Owner | What the Store does | Fact boundary |
| --- | --- | --- | --- |
| Internal Nucleation governance | Zhixu designers and Zhixu organizers | Provides workbenches for design, organization, versions, suppliers, and proof. | Internal rules are only verifiable after they enter Zhixu/Plan/Order/proof. |
| Store platform workflow | Store operator/reviewer/admin | Handles catalog tagging, material review, publishing workflows, attestation requests, and audit. | Store metadata/review/audit are evidence of platform workflow. |
| External trust-domain endorsement | Trust-domain owner/reviewer | The Store displays results and request status. | Only registry events such as `PlanAttested` and `SupplierAttested` are endorsement facts. |

When the Store page says "governance," it refers to platform workflow and evidence organization. The Zhixu runtime, internal fairness, and supplier organization principles are still maintained by Nucleation.

## Registry vs. Store Authority Boundary

Start with [Store Authority Boundary and Information Architecture](authority-and-ia.md). Every Store page must first say who is responsible for the object, then explain how the Store organizes it.

| Question | Authority source | What the Store can do |
| --- | --- | --- |
| Is the Zhixu design reasonable? | Nucleation design materials + external trust-domain review. | Show design, compile preview, resource requirements, supplier slots, and fairness explanations. |
| Is the Plan officially trusted? | `ZhixuTrustRegistry.PlanAttested` / `PlanRevoked`. | Start and track attestation requests and show the trust projection. |
| Is the Supplier endorsed? | `SupplierAttested` / `SupplierRevoked`. | Organize profile, capability tags, contact info, fulfillment proof, and endorsement materials. |
| Is the Order registered? | `UVPStateMachine.OrderRegistered`. | Search, locate, and show status and proof. |
| Was the Signal submitted? | `SignalSubmitted` and proof rows. | Show fulfillment records, evidence hash, tx/block/event. |
| Did the Store review pass? | Store metadata / audit. | Show how far the platform workflow has progressed; the trust badge still comes from the registry projection. |

Store metadata, platform tags, contact information, notification state, review, audit, fulfillment views, and search ranking are product and workflow read models. Protocol facts come from registry/state-machine events.

## Store Information Architecture

| Area | Primary objects | Read first |
| --- | --- | --- |
| Nucleation workbench | nucleation id, design materials, versions, supplier organization, endorsement request materials. | [Nucleation Workbench](nucleation-workbench.md) |
| Zhixu Catalog | draft, compiled artifact, plan hash, fairness materials, active recommendation, trust projection. | [Zhixu Catalog, Configuration, and Publishing](zhixu-management.md) |
| Supplier Registry | supplier subject, capability, contact, participation, proof, attestation request. | [Supplier Registry, Capability, and Contact](supplier-registry.md) |
| Trust / Proof | plan/supplier trust, order/task timeline, proof rows, revoked history. | [Fulfillment Status, Proof, and Trust Checks](runtime-proof.md) |
| Contact / Notification | delivery intent, retry, failure reason, owner, SLA. | [Contact and Notifications](contact-notifications.md) |
| Platform Workflow / Audit | review, attestation request, revocation request, operator audit. | [Operator Permissions, Governance, and Audit](governance-audit.md) |
| Docking Sandbox | trial pairing of peer Zhixu, adapter, signalMap, and capability plugin. | [Docking Sandbox](docking-sandbox.md) |
| Service Surface | Store Console API, draft routes, supplier routes, docking routes, audit storage. | [Untrusted Execution Layer: Chain Services](../components/chain-services.md) |

## Zhixu Publication Path in the Store

See [Zhixu Catalog, Configuration, and Publishing](zhixu-management.md).

The Zhixu pages in the Store should help Nucleation turn a Zhixu design into a version that can be reviewed, endorsed, and used to create orders:

```text
Nucleation imports Zhixu
  -> compile preview
  -> Product Schema / resource / supplier requirement validation
  -> Nucleation prepares fairness and transparency notes
  -> Store workflow review
  -> governance admin requests attestation
  -> indexed PlanAttested
  -> active/order-creatable version
```

`approved_for_broadcast` is a platform workflow state. Displaying an official trusted plan must match the indexed `PlanAttested` for the plan id/hash.

## Suppliers Are Part of the Nucleation Organization Network

See [Supplier Registry, Capability, and Contact](supplier-registry.md).

The Store supplier registry helps Nucleation organize real fulfillment capacity:

- supplier profile, display name, wallet, and subject id;
- internal Nucleation role/stage/capability requirements;
- Store platform catalog tags and search tags;
- contact information, notification settings, owner, availability windows, SLA, and operational notes;
- fulfillment participation history, open tasks, and historical proof;
- supplier attestation/revocation requests and trust projections.

This information helps Nucleation select, contact, and organize suppliers. Order-level signal authorization and the active executor overlay are still checked by the contracts.

## Related Pages

- [Nucleation Workbench](nucleation-workbench.md)
- [Store Authority Boundary and Information Architecture](authority-and-ia.md)
- [Zhixu Catalog, Configuration, and Publishing](zhixu-management.md)
- [Supplier Registry, Capability, and Contact](supplier-registry.md)
- [Fulfillment Status, Proof, and Trust Checks](runtime-proof.md)
- [Contact and Notifications](contact-notifications.md)
- [Operator Permissions, Governance, and Audit](governance-audit.md)
- [Docking Sandbox](docking-sandbox.md)
- [Untrusted Execution Layer: Chain Services](../components/chain-services.md)
