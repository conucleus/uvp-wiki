---
title: Contracts and Registries
type: explanation
audience: 协议读者
status: verified
---

# Contracts and Registries

The on-chain fact layer consists of `UVPStateMachine`, the frozen functional modules, `UVPIdentityRegistry`, and `UVPDeploymentRegistry`. Store and Chain Services may index and interpret these facts, but they cannot rewrite them.

## UVPStateMachine and Modules

- The publisher signs to commit a Plan; any relayer broadcasts.
- The publisher's signature commits the six PlanCommit fields: publisher / hooksHash / capabilitiesRoot / supplierBindingsRoot / fileWritersHash / deadline; `capabilitiesRoot` folds the signal capability and selector binding tables, `fileWriters` is committed separately by `fileWritersHash`, and `finalizePlan` only finalizes.
- Only finalized Plans are allowed to create Orders.
- Submission authority is carried by the source stage's assigned supplier account (plan default -> per-order stage supplier patch -> one-time dock selection); a relayer only broadcasts and never creates business signatures.
- Signal, HookReady, stage supplier patch, stage file writes, Dock registration and bindings, and derived signals all leave replayable events.
- Once configured, the seven module addresses (stage patch, derived signal, dock registry, plan metadata, lens, file resource, identity registry) are permanently frozen.

## UVPIdentityRegistry

The Registry is operated by Store and has two namespaces that do not authorize each other: the subject namespace records `subjectId <-> account` identity bindings with hash/URI and revocation history, purely as a trust attestation; the supplier namespace carries SID minting, a permanent account binding, and `pending/active/suspended/revoked` status, and is the StateMachine's only execution-authorization source. It does not certify Plans and does not record capability/reputation. Each StateMachine wires one `UVPIdentityRegistry` module slot.

## UVPDeploymentRegistry

The Deployment Registry records Candidate, Canary, Active, Deprecated, and Retired cutover leads for StateMachine deployments. It cannot modify deployed contracts; it only tells observers which deployment the product currently selects.

## Centralization and Decentralization

Centralization lives in Store's identity verification, name display, cataloging, tagging, recommendations, compliance operations, and default deployment selection. Decentralization shows in: anyone can read and replay events, any relayer can broadcast valid signatures, users can bypass Store with bare wallet addresses, and frozen contracts cannot be silently rewritten by a Store backend. Trust comes from verifiable signatures and immutable records, not from claims that "there is no operator". For the full discussion of this trust boundary, see [Protocol Boundaries](protocol-boundaries.md).
