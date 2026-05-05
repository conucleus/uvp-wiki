# Trust Registry

In protocol v0.5/v0.2, a registry address is the trust boundary. `UVPStateMachine`
does not store a registry address, does not ask a registry before `registerPlan`,
and does not revert order runtime after a registry revocation.

`ZhixuTrustRegistry` is owner-based:

```solidity
owner() -> address
transferOwnership(address newOwner)
attestPlan(planId, planHash, artifactHash, policyHash, metadataHash, metadataURI)
revokePlan(planId, reasonHash, reasonURI)
attestSupplier(supplierSubjectId, wallet, profileHash, capabilityHash, reputationHash, metadataURI)
revokeSupplier(supplierSubjectId, reasonHash, reasonURI)
```

Products and Stores choose which registry address they trust through deployment
configuration. Another ecosystem can deploy its own registry and use the same
state machine without entering or being endorsed by the official product
registry.

## Plan Attestation

The key fields recorded in a plan attestation are:

| Field | Meaning |
| --- | --- |
| `registryAddress` | The registry contract that emitted the attestation event. |
| `planId` | Plan version identifier. |
| `planHash` | Hash of the on-chain plan artifact. |
| `attested` | Whether it has been attested. |
| `revoked` | Whether it has been revoked. |
| `metadataURI` | Off-chain audit or explanatory material. |

An attested plan is product trust data, not a state-machine precondition. The
state machine checks publisher/registrar permissions and order-level signal
authorization; Store/Product may use registry projections to show warnings or
gate official catalog flows.

## Supplier Attestation

Supplier attestation does not authorize `submitSignal()`. It is input for
Product/API layers to show supplier trust, capability tags, risk warnings, and
audit provenance. Whether a business action can actually be submitted still
depends on order-level signal authorization.
