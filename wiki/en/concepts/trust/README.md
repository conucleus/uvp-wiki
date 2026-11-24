---
title: Identity, Publication, and Authorization
type: meta
audience: protocol readers
status: verified
---

# Identity, Publication, and Authorization

UVP separates identity resolution, Plan publication, and in-order action authority: `UVPIdentityRegistry` says "who this wallet is off-chain and whether this supplier account is active", the publisher's EIP-712 signature says "who published this immutable rule", and the stage's assigned supplier account says "who may submit an action in this Order". None of the three can be derived from another, and no layer can be stripped by a higher layer; see [Protocol Boundaries](../protocol-boundaries.md).

Submission authority is carried by the source stage's assigned supplier account (plan default supplier → per-order stage supplier patch → one-time dock selection). The contract resolves `accountOf(supplierId)` and requires the SID to be `active` at the `submitSignal` entry.

## Pages

| Page | Description |
| --- | --- |
| [Identity Registry](domains.md) | Store-operated identity resolution: subject-to-wallet bindings plus the supplier capability/account namespace. |
| [EIP-712 and Relayer](eip712-relayer.md) | The typed-data shape of business signatures and the boundary that a relayer only broadcasts. |
| [Stage Patch Authorization](stage-patch.md) | How stage supplier patches and stage file writes reuse assigned-supplier authority. |
