# Trust Domain

A trust domain is the trust subject inside `ZhixuTrustRegistry`. It declares that “a certain plan version is trusted” or “a certain supplier subject is trusted”. The contract only checks attestation and revocation status; it does not interpret business reputation.

## Stored Data

The trust registry maintains three main data sets:

```solidity
mapping(bytes32 domainId => TrustDomain domain) private _domains;
mapping(bytes32 domainId => mapping(bytes32 planId => PlanAttestation)) private _planAttestations;
mapping(bytes32 domainId => mapping(bytes32 supplierSubjectId => SupplierAttestation)) private _supplierAttestations;
```

## What Domain Owners Can Do

Domain owners can:

- Register or update a trust domain.
- Attest a plan for `(planId, planHash)`.
- Revoke plan attestation.
- Attest a supplier subject.
- Revoke supplier attestation.

## Plan Attestation

The key fields recorded in a plan attestation are:

| Field | Meaning |
| --- | --- |
| `planId` | Plan version identifier. |
| `planHash` | Hash of the on-chain plan artifact. |
| `attested` | Whether it has been attested. |
| `revoked` | Whether it has been revoked. |
| `metadataURI` | Off-chain audit or explanatory material. |

`UVPStateMachine.registerPlan()` checks through the registry:

```solidity
trustRegistry.isPlanRevoked(officialDomainId, planId)
trustRegistry.isPlanActive(officialDomainId, planId, planHash)
```

A plan without a valid attestation should not become a registerable protocol plan.

## Supplier Attestation

Supplier attestation does not directly authorize `submitSignal()`. It is input for Product / API layers to show supplier trust, capability tags, risk warnings, and audit provenance. Whether a business action can actually be submitted still depends on order-level signal authorization.

## Trust Projection

`uvp-chain-services/service/src/indexer/trust-projections.ts` rebuilds trust views from trust registry events and declares `rebuildable: true`. That means supplier trust state cannot live only in the service database either.
