# Contracts and registries

The on-chain fact layer consists of `UVPStateMachine`, its frozen modules, `UVPIdentityRegistry`, and `UVPDeploymentRegistry`.

## UVPStateMachine and modules

- A publisher signs a Plan commit and any relayer may broadcast it.
- Hooks and metadata hashes are bound at commit; metadata is finalized once.
- Only finalized Plans can create Orders.
- Order creators and Signal submitters derive authority from signatures and order-level authorization, not relayer allowlists.
- Six configured module addresses are permanently frozen.

## UVPIdentityRegistry

The Store-operated registry records replayable `subjectId <-> account` identity bindings with descriptor hash/URI and binding-specific revocation. It does not publish Plans or record capability and reputation. Multiple registry addresses are supported for future independent domains; the initial deployment uses one.

## UVPDeploymentRegistry

This registry records deployment cutover hints such as Candidate, Canary, Active, Deprecated, and Retired. It cannot mutate a deployed contract.

Centralization remains in Store identity checks, labels, directories, compliance, recommendation, and default deployment selection. Decentralization appears in replayable public events, permissionless relaying of valid signatures, direct raw-address use, and frozen contract configuration. Trust comes from making each centralized assertion explicit and cryptographically auditable, not from pretending no operator exists.
