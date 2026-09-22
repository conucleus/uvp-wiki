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
| OnchainHookPlan | `uvp.onchainHookPlan.v3` | EVM compiled-artifact schema. |
| Cloud artifact | `uvp.cloudArtifact.v2` | Cloud compiler artifact schema. |
| Dock interface artifact | `uvp.dockInterfaceArtifact.v2` | Target-side named-interface commitment artifact schema. |
| Dock route artifact | `uvp.dockRoute.v2` | Resolved-route artifact schema (an unresolved dynamic route is `uvp.dockRoute.unresolved.v1`). |
| Dock resolution manifest | `uvp.dock.resolution.v2` | Target-resolution manifest schema (a name directory; the chain track's publication surface embeds the definition in full on the same schema for content addressing). |
| StateMachine ABI / EIP-712 | `0.11` | Signed Plan commit/finalize, composite `(planId, orderId)` orders, permissionless relayer. |
| Plan registration library ABI | `0.2` | The `UVPPlanRegistration` library that hosts the `commitPlan`/`finalizePlan` body. |
| IdentityRegistry ABI | `0.1` | Thin offline subject-to-wallet identity binding. |
| DeploymentRegistry ABI | `0.2` | Deployment cutover and canary records. |
| Derived signal module ABI | `0.3` | Frozen ABI of the derived-signal module (EIP-712 domain version `0.6`). |
| Product submit domain | `0.11` | Product signal-submit EIP-712 domain. |
| Order-link module ABI | `0.3` | Frozen ABI of the linked-order module (trigger EIP-712 domain version `0.8`). |
| Stage patch module ABI | `0.4` | Frozen ABI of the module hosting executor/resource patch (patch EIP-712 domains version `0.1`). |
| Docking module ABI | `4.4` | Unified Zhixu DockRoute: the open order-creation channel plus the attach channel (interface-name leaves, mode word; the dynamic-selection candidate-leaf domain added in 4.4) — new mints a child order via `openDockedOrder`, existing attaches an existing target order via `attachDockedOrder` (no child order, three-legged consent gate), and `target: null` dynamic selection is settled at attach via a candidate-set membership proof; EIP-712 domain version `4`. |
| Plan metadata module ABI | `0.6` | Plan metadata / dock interface port validation (with the interface-name dimension). |
| StateMachine lens ABI | `0.4` | Read-only dock/order/hook views. |
| Deployment manifest | `uvp-eth.addresses.v1` | Deployment address-manifest schema. |

Plan runtime identity is derived from `publisher + runtimePlanHash`; `runtimePlanHash` covers hooks, capabilitiesRoot, and dock roots. Order identity is always the composite key `(planId, orderId)`, so a bare `orderId` is not a global primary key. The Identity Registry only records subject/account bindings. Supplier capability, reputation, names, tags, contact details, search recommendations, and workflow state are stored independently by the Store. Chain projections in Chain Services are rebuildable. For the full boundary see [Protocol Boundaries](../concepts/protocol-boundaries.md).
