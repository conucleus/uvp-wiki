# Version and Semantic Matrix

The executable source is `uvp-deploy/deploy/compatibility/uvp-stack.v1.json`; this page explains what each version controls.

| Boundary | Current version | Meaning |
| --- | --- | --- |
| Rust core package | `0.1.0` | Release version of the `uvp-core` crates and Node package. |
| Protocol semantics | `uvp-semantic/0.1` | Compatibility version for Hook parsing, evaluation, and replay. |
| Hook corpus | `uvp.hookSemanticsCorpus.v1` | Golden corpus schema shared by Rust and the TypeScript adapter. |
| HookPlan artifact | `uvp.hookPlan.v1` | HookPlan artifact schema. |
| OnchainHookPlan | `uvp.onchainHookPlan.v1` | EVM registration artifact schema. |
| StateMachine ABI / EIP-712 | `0.8` | Signed Plan commit, frozen metadata, and permissionless relaying. |
| IdentityRegistry ABI | `0.1` | Thin offline subject-to-wallet binding. |
| DeploymentRegistry ABI | `0.2` | Deployment cutover and canary registry ABI. |
| Derived signal domain | `0.6` | Derived signal EIP-712 domain. |
| Patch/Docking domains | `0.1` | Executor patch, resource patch, and docked order link domains. |
| Address manifest | `uvp-eth.addresses.v5` | Multi-StateMachine deployment manifest. |

## Sources of truth

- `uvp-core` and its golden corpus define normative semantics.
- Contracts and events define runtime facts for a specific deployment.
- Plan runtime identity is derived from `publisher + hooksHash + metadataHash`.
- The Identity Registry records subject/account bindings.
- Supplier capability, reputation, names, tags, contact details, search recommendations, and workflow state belong to Store storage.
- Chain projections are rebuildable; drafts, invites, notifications, and evidence objects are durable workflow state.

`pnpm verify:stack-compatibility` compares this matrix with code constants, native core versions, the corpus, and ABI fixtures. Any mismatch fails the release gate.
