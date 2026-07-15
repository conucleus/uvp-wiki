# Contracts and events

| Contract | Purpose |
| --- | --- |
| `UVPStateMachine` | Signed Plan commit/finalization and Order/Signal/hook/stage runtime. |
| six StateMachine modules | Plan metadata, Order linking, stage executor/resource patches, docking, and derived-signal behavior; addresses are frozen after configuration. |
| `UVPIdentityRegistry` | Thin Store-operated real-world subject-to-account directory with binding-specific revocation. |
| `UVPDeploymentRegistry` | StateMachine deployment cutover ledger. |

Current indexer-facing events include:

```text
PlanCommitted
PlanFinalized
PlanPublisherRecorded
OrderRegistered
OrderTriggered
OrderRelayerRecorded
SignalSubmitterAuthorized
SignalSubmitted
HookStatusChanged
HookReady
StageExecutorPatchApplied
StageResourcePatchApplied
DockedOrderLinked
DockedSignalMapped
DockedSignalSubmitted
IdentityBindingRegistered
IdentityBindingRevoked
DeploymentRegistered
DeploymentActivated
DeploymentDeprecated
DeploymentRetired
```

From the repository root, run `pnpm verify:protocol-freeze`, `pnpm verify:state-machine-fixture`, and `pnpm verify:identity-registry-fixture`. Contract tests run with `forge build && forge test` in `uvp-protocol/contracts/uvp-contracts`.
