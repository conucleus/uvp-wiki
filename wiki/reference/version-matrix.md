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
| Dock interface artifact | `uvp.dockInterfaceArtifact.v2` | 目标侧具名接口承诺产物 schema。 |
| Dock route artifact | `uvp.dockRoute.v2` | 已解析 route 产物 schema（未解析动态 route 为 `uvp.dockRoute.unresolved.v1`）。 |
| Dock resolution manifest | `uvp.dock.resolution.v2` | 目标解析 manifest schema（name 目录；链轨发布面在同一 schema 上内嵌定义全文做内容寻址）。 |
| StateMachine ABI / EIP-712 | `0.10` | signed Plan commit/finalize、复合 `(planId, orderId)` 订单、permissionless relayer。 |
| IdentityRegistry ABI | `0.1` | 线下 subject 与钱包的薄身份绑定。 |
| DeploymentRegistry ABI | `0.2` | deployment cutover 与 canary 记录。 |
| Derived signal domain | `0.6` | Derived signal EIP-712 domain。 |
| Product submit domain | `0.10` | Product signal submit EIP-712 domain。 |
| Order-link domain | `0.8` | linked-order trigger EIP-712 domain。 |
| Patch/resource domains | `0.1` | executor/resource patch EIP-712 domains。 |
| Docking module ABI | `4.0` | 统一 Zhixu DockRoute：open/input/output 绑定（接口名叶、mode word）；order mode new 唯一支持，existing 模式在哈希重算处显式拒绝；EIP-712 domain version `4`。 |
| Plan metadata module ABI | `0.4` | plan metadata/dock 接口端口校验（含接口名维度）。 |
| StateMachine lens ABI | `0.3` | dock/order/hook 只读视图。 |
| Deployment manifest | `uvp-eth.addresses.v1` | 部署地址清单 schema。 |

Plan runtime identity 由 `publisher + runtimePlanHash` 导出；`runtimePlanHash` 覆盖 hooks、metadata 和 dock roots。订单身份始终是复合键 `(planId, orderId)`，不能把 bare `orderId` 当作全局主键。Identity Registry 只记录 subject/account 绑定。Supplier capability、reputation、名称、标签、联系信息、搜索推荐和 workflow 状态由 Store 独立保存。Chain Services 的链上投影可重建。完整边界见 [协议边界](../concepts/protocol-boundaries.md)。
