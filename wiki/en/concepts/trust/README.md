---
title: Identity, Publication, and Authorization
type: meta
audience: 协议读者
status: verified
---

# Identity, Publication, and Authorization

UVP separates identity resolution, Plan publication, and order-level action authorization: the Registry says "who this wallet is off-chain", the publisher's EIP-712 signature says "who published this immutable rule set", and order-level authorization says "who may submit which action in this Order". None of the three implies another, and no layer can be stripped away by a layer above it. For the full boundary statement, see [Protocol Boundaries](../protocol-boundaries.md).

## Pages in This Section

| Subpage | Description |
| --- | --- |
| [Identity Registry](domains.md) | The Store-operated identity resolution domain: what subject-to-wallet bindings and their revocation mean. |
| [Signal Authorization](signal-authorization.md) | Order-level explicit authorization and dynamic delegation via Executor patches. |
| [EIP-712 and Relayer](eip712-relayer.md) | The typed-data shape of business signatures, and the boundary that a relayer broadcasts but never decides. |
| [Stage Patch Authorization](stage-patch.md) | How executor/resource patches reuse the order-level authorization model. |
