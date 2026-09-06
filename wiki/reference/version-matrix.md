---
title: 版本与语义矩阵
type: reference
audience: 工程贡献者
status: verified
---

# 版本与语义矩阵

| 边界 | 当前版本 | 含义 |
| --- | --- | --- |
| Rust core package | `0.1.0` | Hook 规范求值核心。 |
| 协议语义 | `uvp.semantic.v1` | Hook 解析、求值和 replay 一致性边界。 |
| Cloud AST | `uvp.cloudAst.v1` | 云侧编译 AST wire schema。 |
| HookPlan artifact | `uvp.hookPlan.v2` | 编译器内部/公共 artifact。 |
| OnchainHookPlan | `uvp.onchainHookPlan.v2` | EVM 编译产物 schema。 |
| Cloud artifact | `uvp.cloudArtifact.v2` | 云侧编译产物 schema。 |
| StateMachine ABI / EIP-712 | `0.10` | signed Plan commit/finalize、复合 `(planId, orderId)` 订单、permissionless relayer。 |
| IdentityRegistry ABI | `0.1` | 线下 subject 与钱包的薄身份绑定。 |
| DeploymentRegistry ABI | `0.2` | deployment cutover 与 canary 记录。 |
| Derived signal domain | `0.6` | Derived signal EIP-712 domain。 |
| Product submit domain | `0.10` | Product signal submit EIP-712 domain。 |
| Order-link domain | `0.8` | linked-order trigger EIP-712 domain。 |
| Patch/resource domains | `0.1` | executor/resource patch EIP-712 domains。 |
| Docking module ABI | `2.1` | dock v2 open/input/output/terminal boundary。 |
| Deployment manifest | `uvp-eth.addresses.v1` | 部署地址清单 schema。 |

Plan runtime identity 由 `publisher + runtimePlanHash` 导出；`runtimePlanHash` 覆盖 hooks、metadata 和 dock roots。订单身份始终是复合键 `(planId, orderId)`，不能把 bare `orderId` 当作全局主键。Identity Registry 只记录 subject/account 绑定。Supplier capability、reputation、名称、标签、联系信息、搜索推荐和 workflow 状态由 Store 独立保存。Chain Services 的链上投影可重建。完整边界见 [协议边界](../concepts/protocol-boundaries.md)。
