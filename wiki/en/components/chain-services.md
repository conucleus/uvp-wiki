# Rebuildable service layer: Chain Services

Chain Services indexes `UVPDeploymentRegistry`, `UVPStateMachine`, and `UVPIdentityRegistry` events and rebuilds Product and Store views. It is replaceable and forkable; it is not the source of protocol truth.

| Question | Source | Service role |
| --- | --- | --- |
| Is a Plan finalized? | StateMachine events. | Rebuild the Plan projection. |
| Was an Order or Signal recorded? | Order, Signal, and Hook events. | Build tasks, timelines, and proof rows. |
| Which real-world subject does an account represent? | Identity Registry events. | Build name-resolution views. |
| Who may submit an action? | Signatures and order authorization. | Validate and relay, never sign for the user. |
| What can a Supplier do? | Store metadata and Store-specific models. | Search, recommendation, and workflow only. |

Databases, object storage, notifications, drafts, reviews, recommendations, and audit logs are projection or workflow state. Order/Signal proof must point to StateMachine events; identity display must point to Identity Registry bindings. Capability and matching must remain explicitly off-chain.
