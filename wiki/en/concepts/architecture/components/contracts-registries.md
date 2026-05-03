# Contracts and Registries

The on-chain fact layer is made up of three main contracts: `UVPStateMachine`, `ZhixuTrustRegistry`, and `UVPDeploymentRegistry`. Together they decide protocol state without relying on a backend database.

## UVPStateMachine

The state machine contract is responsible for:

- Registering plans.
- Registering orders.
- Writing order-level signal authorization.
- Accepting direct or relayed signal submissions.
- Evaluating hooks.
- Emitting `HookStatusChanged`, `HookReady`, and `TimerPoked`.
- Handling stage executor / resource overlays.

It does not store plaintext business documents, call executors, custody funds, or read the Store database.

## ZhixuTrustRegistry

The trust registry is responsible for:

- Registering trust domains.
- Attesting or revoking plans.
- Attesting or revoking suppliers.
- Providing trust proofs for Product projections.

`UVPStateMachine.registerPlan()` checks whether `(planId, planHash)` is active in the official domain.

## UVPDeploymentRegistry

The deployment registry records deployment status:

```text
Candidate -> Canary -> Active -> Deprecated -> Retired
```

When a new deployment is activated, the old active deployment can be marked deprecated. This is the on-chain record of deployment cutover, not order state.

## Public Interface

The ABI, event names, event topics, EIP-712 domain version, and typed data fields of these contracts are all public protocol interfaces. Any change to them requires updates to bindings, fixtures, release gates, and documentation.
