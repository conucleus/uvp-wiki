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
| Cloud AST | `uvp.cloudAst.v4` | 云侧编译 AST wire schema。 |
| HookPlan artifact | `uvp.hookPlan.v7` | 编译器内部/公共 artifact，含 stage `trigger` 派生。 |
| OnchainHookPlan | `uvp.onchainHookPlan.v7` | EVM 编译产物 schema；`orderTriggerKind` 为 trigger/none，派生 `triggers[]` 枚举出生线。 |
| Cloud artifact | `uvp.cloudArtifact.v8` | 云侧编译产物 schema。 |
| Dock artifact | `uvp.dock.v1` | 静态 Dock 文档/编译产物 schema（uvp-core analyzeDock 生成，含 A validWhen AST/dependencies/atoms）。 |
| Dock binding read DTO | `uvp.dockBinding.v1` | 链读 binding/per-output 窗口投影 wire schema。 |
| StateMachine ABI | `0.19` | signed Plan commit/finalize（八域 PlanCommit 含 executorCandidatesRoot、birthAuthorizer）、复合 `(planId, orderId)` 订单、permissionless relayer、outside 出生由计划承诺的 birthAuthorizer 与 trigger 信号的空订单上下文 admission（`SignalAdmissionRejected`）约束、治理分叉 `forkOrder` 出生通道。B-03 事件自包含批：`PlanCommitted` 尾参补 `birthAuthorizer`、`SignalSubmitted` 尾参补 `factStageId`、`OrderForked` 尾参补 `forkPayloadHash` + `replayedFactKeys`（fork 重放/新生事实可区分）。文件 patch 入口为 `submitSignalFor`（携 `bytes32 filesDigest` 与尾部 `FilePatch`，纯文件 patch 用 `signalId == 0`）；EIP-712 domain version `0.17`（`UVPStateMachineSignal` 尾部增 `bytes32 filesDigest`）。 |
| Plan registration library ABI | `0.6` | `commitPlan`/`finalizePlan`/`forkOrder` 执行体分段外置的 `UVPPlanRegistration` 链接库（库产物携带 B-03 同批扩展的状态机事件面）。 |
| IdentityRegistry ABI | `0.1` | 线下 subject 与钱包的薄身份绑定。 |
| DeploymentRegistry ABI | `0.2` | deployment cutover 与 canary 记录。 |
| Derived signal module ABI | `0.5` | Derived signal 模块冻结 ABI（EIP-712 domain version `0.6` 不变）；B-03：`DerivedSignalSubmitted` 尾参补 `relation`。 |
| Product submit domain | `0.17` | Product signal submit EIP-712 domain。 |
| Order-link module ABI | `0.3` | Linked-order 模块冻结 ABI（trigger EIP-712 domain version `0.8`）。 |
| Stage patch module ABI | `0.9` | Executor patch 所在模块冻结 ABI（资源半边已删除；dock executor patch + poke；patch EIP-712 domain version `0.4`；executor patch 模式词表 assign/handoff 闭集、digest 含 authorizationsHash）。 |
| DockRegistry ABI | `0.1` | 静态 Dock 注册表：`registerDock`/`DockRegistered`，原子/输出 capability proof 由 plan metadata 校验。 |
| Plan metadata module ABI | `0.8` | plan metadata/dock 接口端口校验（含接口名维度），以及 file-writer capability 叶（`UVP_FILE_WRITER_V1`）的成员校验。 |
| File resource module ABI | `0.1` | 阶段文件映射模块：`key -> (contentHash, handle)`、strict `add/replace/remove` + 必填 `baseHash`、无 nonce、`patchHash` first-win 吸收。 |
| StateMachine lens ABI | `0.6` | dock/order/hook 只读视图。 |
| Deployment manifest | `uvp-eth.addresses.v1` | 部署地址清单 schema。 |

uvp-core analyze 的 wire schema 为 `uvp.zhixuAnalysis.v4`：每个 stage 输出规范化 `triggers`（`<stage>.<signal>`）与 hook 解析结果，由 compiler/hook-core 消费；它不进入链上注册参数。

Plan runtime identity 由 `publisher + runtimePlanHash` 导出；`runtimePlanHash` 覆盖 hooks、capabilitiesRoot 和 executorCandidatesRoot。订单身份始终是复合键 `(planId, orderId)`，不能把 bare `orderId` 当作全局主键。Identity Registry 只记录 subject/account 绑定。Supplier capability、reputation、名称、标签、联系信息、搜索推荐和 workflow 状态由 Store 独立保存。Chain Services 的链上投影可重建。完整边界见 [协议边界](../concepts/protocol-boundaries.md)。
