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

## Official Domain FAQ

| Question | Answer |
| --- | --- |
| Who owns a trust domain? | A domain owner is the governance subject recorded in `ZhixuTrustRegistry`. The owner or its controlled governance process can attest or revoke plan and supplier records. |
| What is the official domain? | The official domain is the `domainId` configured for state-machine plan registration checks. `registerPlan()` checks this domain when deciding whether a plan hash is active and not revoked. |
| Can multiple domains exist? | Yes. Multiple domains can attest the same or different plans and suppliers. Product/Store may display additional domain views, but only the configured official domain gates core plan registration unless the deployment rules change. |
| Can Store and the official domain be operated by the same organization? | They can be operated by related organizations in a staging or product setup, but the docs and UI must still separate Store workflow approval from trust-domain attestation. A Store review row is not `PlanAttested`. |
| What if domains disagree? | Store/Product should show which domain each attestation came from and whether the official domain is active or revoked. A non-official endorsement can be useful context, but it does not replace the official-domain registration check. |
| Who is responsible for revocation? | The domain owner is responsible for revoking its own plan or supplier endorsement. Store can request, display, and audit the workflow, but revocation fact comes from the registry event. |

## Supplier Attestation

Supplier attestation does not directly authorize `submitSignal()`. It is input for Product / API layers to show supplier trust, capability tags, risk warnings, and audit provenance. Whether a business action can actually be submitted still depends on order-level signal authorization.

## Trust Projection

`uvp-chain-services/service/src/indexer/trust-projections.ts` rebuilds trust views from trust registry events and declares `rebuildable: true`. That means supplier trust state cannot live only in the service database either.
