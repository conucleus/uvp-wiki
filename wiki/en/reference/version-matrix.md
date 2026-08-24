---
title: Version and Semantic Matrix
type: reference
audience: 工程贡献者
status: verified
---

# Version and Semantic Matrix

| Boundary | Current version | Meaning |
| --- | --- | --- |
| Rust core package | `0.1.0` | Normative Hook evaluation core. |
| Protocol semantics | `uvp-semantic/0.3` | Consistency boundary for Hook parsing, evaluation, and replay. |
| HookPlan artifact | `uvp.hookPlan.v1` | Compiler internal/public artifact. |
| OnchainHookPlan | `uvp.onchainHookPlan.v1` | EVM compiled-artifact schema. |
| StateMachine ABI / EIP-712 | `0.8` | Signed Plan commit, frozen metadata, permissionless relayer. |
| IdentityRegistry ABI | `0.1` | Thin offline subject-to-wallet identity binding. |
| DeploymentRegistry ABI | `0.2` | Deployment cutover and canary records. |
| Derived signal domain | `0.6` | Derived signal EIP-712 domain. |
| Patch/Docking domains | `0.1` | Executor/resource patch and docking. |

Plan runtime identity is derived from `publisher + hooksHash + metadataHash`. The Identity Registry only records subject/account bindings. Supplier capability, reputation, names, tags, contact details, search recommendations, and workflow state are stored independently by the Store. Chain projections in Chain Services are rebuildable. For the full boundary see [Protocol Boundaries](../concepts/protocol-boundaries.md).
