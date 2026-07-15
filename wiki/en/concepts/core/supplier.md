# Supplier

A Supplier is a real-world or digital subject that Store may describe as offering a capability. Store keeps display names, contacts, capability tags, supported roles and stages, private matching features, reviews, and recommendation records off-chain.

`UVPIdentityRegistry` may bind the Supplier's `subjectId` to one or more accounts after a real-world identity check. This binding answers “who does this account represent in this Store directory?” It does not certify capability, reputation, suitability, or performance.

| Concept | Source |
| --- | --- |
| Identity binding | `IdentityBindingRegistered` / `IdentityBindingRevoked`. |
| Capability and recommendation | Store metadata and Store-specific models. |
| Right to submit a Signal | Order-level authorization and the active executor overlay. |

Revoking an identity binding removes default directory resolution. It does not roll back prior Orders or signatures and does not prevent raw-address interaction. A Supplier and an Executor therefore remain distinct: Supplier is a Store identity/capability concept; Executor is the account authorized for a particular Order action.
