# On-chain runtime and replay

The runtime centers on `UVPStateMachine`: a publisher signs and commits a Plan, metadata is finalized once, and participant-signed actions create Orders and submit Signals. Any relayer may broadcast valid signed payloads.

| Component | Responsibility |
| --- | --- |
| `UVPStateMachine` | Plan commit/finalization, Order and Signal facts, hook evaluation, stage overlays, and docking. |
| six modules | Specialized runtime behavior; addresses are permanently frozen after setup. |
| `UVPIdentityRegistry` | Optional Store-operated subject/account directory, not a runtime authorization source. |
| `UVPDeploymentRegistry` | Deployment cutover history. |
| Chain Services | Replay events into rebuildable product views. |

Only finalized Plans can create Orders. Signal submission authority comes from order-level authorization and the active executor overlay. Store identity, review, capability, recommendation, and matching records never substitute for these checks.
