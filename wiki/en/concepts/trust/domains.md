# Identity Registry: real-world identity and accounts

The first registry is explicitly the identity-admission domain operated by UVP Store. The code can index more than one registry so a future regulated entity in another jurisdiction can run its own domain, but the initial system deploys and presents one Store-operated registry.

`UVPIdentityRegistry` answers only one question: which on-chain accounts correspond to a real-world subject. It does not publish Plans, certify capability or reputation, recommend suppliers, or authorize Order and Signal actions.

```solidity
registerIdentityBinding(subjectId, account, descriptorHash, descriptorURI) -> bindingId
revokeIdentityBinding(bindingId, reasonHash, reasonURI)
activeBindingForAccount(account) -> bindingId
getIdentityBinding(bindingId) -> IdentityBinding
```

One subject may have several accounts. An account may have only one active binding in a registry. Revocation targets a specific `bindingId` and preserves history.

Revocation removes the Store's current directory resolution. It does not undo Orders, signatures, or protocol permissions, and it cannot stop a user from entering a raw address. Names, contacts, capability tags, search features, recommendations, and matching records remain off-chain Store data.
