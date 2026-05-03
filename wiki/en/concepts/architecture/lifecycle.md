# Local-to-Chain Path

This page walks through a complete publish-and-execution path across the modules.

## 1. Write Zhixu

Store or a developer prepares a Zhixu definition. The definition describes task patterns, stages, executors, receive signals, selected stages, and resource requirements. At this point there are no on-chain facts yet.

## 2. Compile the Plan

`uvp-protocol/packages/compiler` produces:

| Artifact | Purpose |
| --- | --- |
| `HookPlanArtifact` | For review, Store, tests, and human reading. |
| `OnchainHookPlanArtifact` | For EVM registration and hash attestation. |
| `registerPlan` args | For `UVPStateMachine.registerPlan()`. |

The compiler also performs structural validation, such as signal references, executor reachability, and selected stage binding.

## 3. Attest the Plan

The owner of the official trust domain attests the following in `ZhixuTrustRegistry`:

```text
domainId + planId + planHash
```

If the plan has not been attested, or has already been revoked, `UVPStateMachine` should not accept it as a valid plan.

## 4. Register the Plan

An authorized publisher calls `registerPlan()`. The contract stores compact hooks, dependency indexes, and selector bindings, then emits `PlanRegistered`.

## 5. Register the Order and Authorization

An authorized registrar calls `registerOrder()`, binding a specific `planId` and writing order-level signal authorization at the same time. Each authorization states which submitter can submit which source/signal for that order.

## 6. Submit Business Actions

Participant wallets sign EIP-712 typed data. A relayer may broadcast on their behalf, but the signing party must be the authorized submitter. After the contract accepts it, the contract writes a `SignalRecord`, emits `SignalSubmitted`, and evaluates the affected hooks.

## 7. Build the Product View

`chain-services` rebuilds projections from chain events, then maps them to `ProductOrderDTO` and `ProductTaskDTO`. Store, Order App, and executor-kit all consume these DTOs or listen directly to chain events.
