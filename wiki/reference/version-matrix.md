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
| HookPlan artifact | `uvp.hookPlan.v4` | 编译器内部/公共 artifact。 |
| OnchainHookPlan | `uvp.onchainHookPlan.v3` | EVM 编译产物 schema。 |
| Cloud artifact | `uvp.cloudArtifact.v5` | 云侧编译产物 schema。 |
| Dock interface artifact | `uvp.dockInterfaceArtifact.v2` | 目标侧具名接口承诺产物 schema。 |
| Dock route artifact | `uvp.dockRoute.v3` | 已解析 route 产物 schema（未解析动态 route 为 `uvp.dockRoute.unresolved.v1`）。 |
| Dock resolution manifest | `uvp.dock.resolution.v2` | 目标解析 manifest schema（name 目录；链轨发布面在同一 schema 上内嵌定义全文做内容寻址）。 |
| StateMachine ABI | `0.16` | signed Plan commit/finalize（八域 PlanCommit 含 executorCandidatesRoot、birthAuthorizer）、复合 `(planId, orderId)` 订单、permissionless relayer、outside 出生限计划承诺的 birthAuthorizer（`UnauthorizedBirthSubmitter` 闸）、治理分叉 `forkOrder` 出生通道。B-03 事件自包含批：`PlanCommitted` 尾参补 `birthAuthorizer`、`SignalSubmitted` 尾参补 `factStageId`、`OrderForked` 尾参补 `forkPayloadHash` + `replayedFactKeys`（fork 重放/新生事实可区分）。EIP-712 domain version 不随事件扩展变化（仍 `0.15`，签名面未动）。 |
| Plan registration library ABI | `0.5` | `commitPlan`/`finalizePlan`/`forkOrder` 执行体分段外置的 `UVPPlanRegistration` 链接库（库产物携带 B-03 同批扩展的状态机事件面）。 |
| IdentityRegistry ABI | `0.1` | 线下 subject 与钱包的薄身份绑定。 |
| DeploymentRegistry ABI | `0.2` | deployment cutover 与 canary 记录。 |
| Derived signal module ABI | `0.5` | Derived signal 模块冻结 ABI（EIP-712 domain version `0.6` 不变）；B-03：`DerivedSignalSubmitted` 尾参补 `relation`。 |
| Product submit domain | `0.15` | Product signal submit EIP-712 domain。 |
| Order-link module ABI | `0.3` | Linked-order 模块冻结 ABI（trigger EIP-712 domain version `0.8`）。 |
| Stage patch module ABI | `0.5` | Executor/resource patch 所在模块冻结 ABI（patch EIP-712 domains version `0.2`；executor patch 模式词表 assign/handoff 闭集、digest 含 authorizationsHash）。 |
| Docking module ABI | `4.7` | 统一 Zhixu DockRoute：open 建单通道与 attach 挂接通道（接口名叶、mode word）——new 经 `openDockedOrder`（单参数 `OpenDockCallV1`）铸子单，routeHash 域 V3 preimage 钉 targetPlanId（静态路由该槽 = 目标 planId；动态路由零字槽 + 候选叶 V2 `UVP_DOCK_CANDIDATE_V2` 绑定选定目标 planId），open 必过目标侧同意门（目标 plan publisher 本人调用或其 `UVPDockOpenConsentV1` EIP-712 同意签名），镜像计划无法抢注路由；existing 经 `attachDockedOrder` 挂接既有目标单（不铸子单、同意门三腿之一）；每单总挂接边数账本 `dockEdgeCountOfOrder` 上限 `MAX_DOCK_EDGES = 8`（attach 前有界祖先检查防跨单环，最长路径由索引器派生）；EIP-712 domain version `4`。 |
| Plan metadata module ABI | `0.6` | plan metadata/dock 接口端口校验（含接口名维度）。 |
| StateMachine lens ABI | `0.4` | dock/order/hook 只读视图。 |
| Deployment manifest | `uvp-eth.addresses.v1` | 部署地址清单 schema。 |

Plan runtime identity 由 `publisher + runtimePlanHash` 导出；`runtimePlanHash` 覆盖 hooks、capabilitiesRoot、dock roots 和 executorCandidatesRoot。订单身份始终是复合键 `(planId, orderId)`，不能把 bare `orderId` 当作全局主键。Identity Registry 只记录 subject/account 绑定。Supplier capability、reputation、名称、标签、联系信息、搜索推荐和 workflow 状态由 Store 独立保存。Chain Services 的链上投影可重建。完整边界见 [协议边界](../concepts/protocol-boundaries.md)。
