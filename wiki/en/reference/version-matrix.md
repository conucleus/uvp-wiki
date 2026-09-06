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
| Protocol semantics | `uvp.semantic.v1` | Consistency boundary for Hook parsing, evaluation, and replay. |
| Cloud AST | `uvp.cloudAst.v1` | Cloud compiler AST wire schema. |
| HookPlan artifact | `uvp.hookPlan.v2` | Compiler internal/public artifact. |
| OnchainHookPlan | `uvp.onchainHookPlan.v2` | EVM compiled-artifact schema. |
| Cloud artifact | `uvp.cloudArtifact.v2` | Cloud compiler artifact schema. |
| StateMachine ABI / EIP-712 | `0.10` | Signed Plan commit/finalize, composite `(planId, orderId)` orders, permissionless relayer. |
| IdentityRegistry ABI | `0.1` | Thin offline subject-to-wallet identity binding. |
| DeploymentRegistry ABI | `0.2` | Deployment cutover and canary records. |
| Derived signal domain | `0.6` | Derived signal EIP-712 domain. |
| Product submit domain | `0.10` | Product signal-submit EIP-712 domain. |
| Order-link domain | `0.8` | Linked-order trigger EIP-712 domain. |
| Patch/resource domains | `0.1` | Executor/resource patch EIP-712 domains. |
| Docking module ABI | `2.1` | Dock v2 open/input/output/terminal boundary. |
| Deployment manifest | `uvp-eth.addresses.v1` | Deployment address-manifest schema. |

Plan runtime identity is derived from `publisher + runtimePlanHash`; `runtimePlanHash` covers hooks, metadata, and dock roots. Order identity is always the composite key `(planId, orderId)`, so a bare `orderId` is not a global primary key. The Identity Registry only records subject/account bindings. Supplier capability, reputation, names, tags, contact details, search recommendations, and workflow state are stored independently by the Store. Chain projections in Chain Services are rebuildable. For the full boundary see [Protocol Boundaries](../concepts/protocol-boundaries.md).
