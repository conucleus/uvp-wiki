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
- Hooks and metadata hashes bind at commit time; metadata freezes once at finalize time.
- Only finalized Plans are allowed to create Orders.
- Creator/submitter signatures create order-level rights; relayers need no allowlist.
- Signal, HookReady, stage patch, resource patch, docking, and derived signals all leave replayable events.
- Once configured, the six modules' addresses are permanently frozen.

## UVPIdentityRegistry

The Registry is operated by Store, recording hashed/URI identity bindings of `subjectId <-> account` plus revocation history. It does not certify Plans, does not record capability/reputation, and is not an admission condition for the StateMachine. The code supports multiple Registry addresses; the first deployment uses one.

## UVPDeploymentRegistry

The Deployment Registry records Candidate, Canary, Active, Deprecated, and Retired cutover leads for StateMachine deployments. It cannot modify deployed contracts; it only tells observers which deployment the product currently selects.

## Centralization and Decentralization

Centralization lives in Store's identity verification, name display, cataloging, tagging, recommendations, compliance operations, and default deployment selection. Decentralization shows in: anyone can read and replay events, any relayer can broadcast valid signatures, users can bypass Store with bare wallet addresses, and frozen contracts cannot be silently rewritten by a Store backend. Trust comes from verifiable signatures and immutable records, not from claims that "there is no operator". For the full discussion of this trust boundary, see [Protocol Boundaries](protocol-boundaries.md).
