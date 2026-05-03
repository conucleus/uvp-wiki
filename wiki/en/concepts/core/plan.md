# Plan

A Plan is the deterministic artifact compiled from a Zhixu for a specific chain. It turns the static Zhixu definition into an on-chain registerable, attestable, and evaluable artifact, which means “how this version of the Zhixu runs on EVM.”

## From Zhixu to Plan

```text
Zhixu DSL
  -> HookPlanArtifact
  -> OnchainHookPlanArtifact
  -> registerPlan args
  -> planId / planHash
```

If the platform, version, compiler, stage, hook, source, signal, or selector binding changes, the same Zhixu will produce a different plan identity or plan hash.

## What the Plan Contains

| Content | Description |
| --- | --- |
| `planId` | Plan identity, derived from the compiler, platform, version, Zhixu ID, and name. |
| `planHash` | The hash of the on-chain artifact, endorsed by the trust registry. |
| `compiledHooks` | The compiled hooks. |
| `dependencyIndex` | `signalKey -> hookIds`, used for local evaluation. |
| `executorRoutes` | Default executor/Supplier routing for stages. |
| `selectorBindings` | Executor patch bindings from stage to target stage. The field name keeps selector as a wire/API compatibility name. |
| resource defaults | Stage-level `fileResources` handles used for Product/Store display and for later resource overlay interpretation. |

## Responsibility Boundary

- Runtime changes belong to Order: participant submissions, evidence, HookReady runtime, and active executors are all Order events.
- Store draft and review state belong to Store workflow; the official usable claim comes from trust registry attestation.
- `fileResources` are handles and default descriptions; business files stay off chain.
- USDC, escrow, and fiat bridge flows belong to adapters or periphery workflows that consume Plan/Order signals.

## It Must Be Endorsed Before Registration

`UVPStateMachine.registerPlan()` checks the official trust domain’s attestation on `(planId, planHash)`. Only a Plan that is still endorsed can be registered as a valid plan.

This boundary matters for Store: `approved_for_broadcast` is only a Store workflow state; only a `PlanAttested` observed by the indexer can support the display of an officially trusted plan.

## A Plan Should Not Be Modified by an Order

A Plan is static, auditable, and attested. Runtime changes such as executor selection, resource manifests, business evidence, or docked linked-order proof belong in Order’s dynamic events or in Product/Store workflow projections; the Plan continues to represent the original static version.
