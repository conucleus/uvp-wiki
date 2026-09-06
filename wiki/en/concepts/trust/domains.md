---
title: Identity Registry: Real-World Identity and On-Chain Addresses
type: explanation
audience: 协议读者
status: verified
---

# Identity Registry: Real-World Identity and On-Chain Addresses

The current Registry is explicitly the **identity-admission domain operated by UVP Store itself**. The code keeps the ability to configure multiple Registry addresses, reserving the interface for future compliance entities in other jurisdictions or independent institutions; for the first phase only one runs, and only the Store's own Registry is presented externally.

`UVPIdentityRegistry` is thin and answers only one question: which on-chain wallets correspond to a given real-world subject. It does not certify Plans, does not claim supplier capability or reputation, makes no recommendations, and does not decide who may create an Order or submit a Signal.

```solidity
owner() -> address
transferOwnership(address newOwner)
registerIdentityBinding(subjectId, account, descriptorHash, descriptorURI) -> bindingId
revokeIdentityBinding(bindingId, reasonHash, reasonURI)
activeBindingForAccount(account) -> bindingId
getIdentityBinding(bindingId) -> IdentityBinding
```

## Data Model

| Field | Meaning |
| --- | --- |
| `registryAddress` | The Registry that emitted the identity events; different addresses are different identity domains. |
| `bindingId` | A single non-reusable identity binding record. |
| `subjectId` | The offline subject identifier inside the Store; not a capability tag. |
| `account` | The corresponding wallet address. |
| `descriptorHash` | A content commitment to the offline identity description material. |
| `descriptorURI` | Where the off-chain material lives; available to the Store for display names and audit leads. |

One subject may bind multiple wallets; within the same Registry a wallet can have only one active binding at a time. Revocation is performed per `bindingId`, and history is never deleted.

## What Revocation Actually Means

After revocation, the Store no longer resolves that wallet as the current default identity and should not keep it in the default directory. Revocation does not roll back existing Orders, does not revoke historical signatures, and cannot stop a user from manually entering a raw wallet address; genuine Order/Signal rights still come from participant signatures, order-level authorization, and the current executor overlay.

## The Store's Responsibility Boundary

Names, contact details, capability tags, search and recommendation features, matching records, and review processes are all Store off-chain data. They may vary from Store to Store but must not masquerade as UVP protocol facts. The Registry leaves only identity-binding hash/URIs and replayable events. This layering is a protocol invariant; see [Protocol Boundaries](../protocol-boundaries.md).
