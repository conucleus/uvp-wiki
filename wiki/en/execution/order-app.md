# Order App

`uvp-order-app/app` is the ordinary participant interface for order fulfillment. Like executor-kit, it is a signal producer, but its default user is human: a participant opens tasks, checks wallet responsibility, prepares evidence fingerprints, confirms signatures, submits, and reads proof.

It does not own order facts. Order, signal, hook, attestation, and proof facts come from `UVPStateMachine`, `ZhixuTrustRegistry`, and replayable chain events. Order App consumes Product DTOs and signal containers exposed by Chain Services.

```text
Product API /product/me/tasks
  -> task inbox and readiness
  -> evidence fingerprint
  -> prepare-submit typed data
  -> participant wallet signature
  -> submit
  -> proof display
```

## Current Code Boundary

| Surface | Code entry | Meaning |
| --- | --- | --- |
| API client | `uvp-order-app/app/src/api/productApi.ts` | Reads Product DTOs, tasks, and proof, and calls prepare/submit. |
| Participant identity | `uvp-order-app/app/src/auth/`, `src/wallet/` | Handles wallet filtering and browser wallet interaction. |
| Onboarding | `uvp-order-app/app/src/onboarding/` | Invite onboarding and participant entry. |
| Order room | `uvp-order-app/app/src/order-room/`, `src/tasks/` | Shows todos, readiness, blocked reasons, and submit actions. |
| Evidence | `uvp-order-app/app/src/evidence/` | Creates or displays evidence fingerprints without putting business plaintext on chain. |
| Proof | `uvp-order-app/app/src/proof/` | Shows proof rows, submission status, and chain provenance. |
| Notifications | `uvp-order-app/app/src/notifications/` | Shows coordination reminders without changing on-chain state. |

## Split From Executor Kit

| Entry | Best for | Shared boundary |
| --- | --- | --- |
| Order App | Ordinary participants, human confirmation, browser wallets. | Product API prepare/sign/submit/proof. |
| Executor Kit Product API mode | Enterprise scripts, supervised agents, MCP tools. | The same signal container and participant signature. |
| Executor Kit chain-native mode | Advanced chain-native executors. | Watches `HookReady` directly and submits authorized signals. |

Neither surface can bypass order-level signal authorization, active executor overlay, EIP-712 business signatures, or first-writer-wins signal semantics.

## Interface Language Boundary

The ordinary participant interface uses words like todo, submit confirmation, evidence fingerprint, proof, fulfiller, executor, and supplier backing. HookPlan, sourceId, signalId, ABI, calldata, gas, and registryAddress belong in engineering or advanced debug views.

## Related Pages

- [Order App and Executor Kit](../concepts/architecture/components/order-app-executor-kit.md)
- [Product DTO and User Surfaces](../product/README.md)
- [Executor Kit](executor-kit.md)
- [Chain Services](../components/chain-services.md)
