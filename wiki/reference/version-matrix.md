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
| HookPlan artifact | `uvp.hookPlan.v8` | 编译器内部/公共 artifact；出生线由 `sendSignals[].trigger` 派生，执行者绑定（default/candidate）与 dynamic 标记进产物。 |
| OnchainHookPlan | `uvp.onchainHookPlan.v8` | EVM 编译产物 schema；`orderTriggerKind` 闭集为 `none`/`trigger`，`triggers[]` 枚举出生线，`executorBindings`/`executorBindingsRoot` 承诺计划执行者绑定。 |
| Cloud artifact | `uvp.cloudArtifact.v8` | 云侧编译产物 schema。 |
| Dock artifact | `uvp.dock.v1` | 静态 Dock 文档/编译产物 schema（uvp-core analyzeDock 生成，含 A validWhen AST/dependencies/atoms）。 |
| Dock binding read DTO | `uvp.dockBinding.v1` | 链读 binding/per-output 窗口投影 wire schema。 |
| StateMachine ABI | `0.21` | signed Plan commit/finalize（六字段 PlanCommit：publisher、hooksHash、capabilitiesRoot、executorBindingsRoot、birthAuthorizer、deadline，含 `ExecutorBinding[]`）、supplier registry 模块槽与强注册校验、dynamic 阶段（hook flag 32）与逐单 supplierId 指派、effective executor 发信权、`submitSignalFor` 代付入口（EIP-712 ECDSA/EIP-1271，msg.sender 仅 relayer）、治理分叉 `forkOrder` 出生通道；删除 `SignalAuthorization` 与订单级授权数组。事件面：`PlanCommitted` 携 `executorBindingsRoot`，`SignalSubmitted` 携 `relayer`，`StageExecutorActivated`/`StageExecutorPatchApplied` 携 supplierId/patchNonce。EIP-712 domain version `0.19`。 |
| Plan registration library ABI | `0.7` | `commitPlan`/`finalizePlan`/`forkOrder` 执行体分段外置的 `UVPPlanRegistration` 链接库（库产物携带状态机事件面）；commit 校验 `ExecutorBinding[]` 与 `executorBindingsRoot`。 |
| IdentityRegistry ABI | `0.1` | 线下 subject 与钱包的薄身份绑定。 |
| DeploymentRegistry ABI | `0.2` | deployment cutover 与 canary 记录。 |
| Derived signal module ABI | `0.7` | Derived signal 模块冻结 ABI（EIP-712 domain version `0.7`）；发信权取 from 阶段 effective executor，无目标单显式授权 fallback。 |
| Product submit domain | `0.19` | Product signal submit EIP-712 domain。 |
| Order-link module ABI | `0.4` | Linked-order 模块冻结 ABI（trigger EIP-712 domain version `0.9`）；触发请求删除 authorizations 字段。 |
| Stage patch module ABI | `0.10` | Executor patch 与 dock 执行者选择所在模块冻结 ABI（patch EIP-712 domain version `0.5`）；patch 载荷为 supplierId/previousSupplierId/patchNonce（`previousSupplierId == 0` assign、非零 handoff，无 mode/授权字段），dock selection 携 supplierId。 |
| DockRegistry ABI | `0.1` | 静态 Dock 注册表：`registerDock`/`DockRegistered`，原子/输出 capability proof 由 plan metadata 校验。 |
| Plan metadata module ABI | `0.8` | plan metadata 冻结 ABI：capability 词表与 signal capability、stage selector binding、file-writer capability 叶（`UVP_FILE_WRITER_V1`）的成员校验（按叶公式重算）。 |
| File resource module ABI | `0.2` | 阶段文件映射模块：`key -> (contentHash, handle)`、strict `add/replace/remove` + 必填 `baseHash`、无 nonce、`patchHash` first-win 吸收；写入鉴权按 effective executor。 |
| StateMachine lens ABI | `0.7` | dock/order/hook 只读视图，含 effective executor 与 active stage executor patch 读面。 |
| Deployment manifest | `uvp-eth.addresses.v1` | 部署地址清单 schema。 |

本批语义变更：删除 signalKey 单观察与跨阶段观察拒绝——依赖索引多对多、无阶段 owner，同一事实可被任意数量/阶段的 hook 观察；求值不以阶段物化为前提，Ready 在阶段物化时统一宣告（物化 flush 按本阶段 hook 注册序补发 Ready-but-unannounced hook）；`EMIT_READY` 是可物化能力位、不是求值门，trigger 只在出生交易求值。

uvp-core analyze 的 wire schema 为 `uvp.zhixuAnalysis.v4`：每个 stage 输出规范化 `triggers`（`<stage>.<signal>`）与 hook 解析结果，由 compiler/hook-core 消费；它不进入链上注册参数。

`supplierId: bytes32` 是供应商链上身份主键（`supplierID` 字符串仅作别名，编译期按固定域派生同一个 `supplierId`）；`UVPSupplierRegistry` 只存 `supplierId ↔ executor` 薄绑定，无 tier/validity/descriptor 字段，平台 store 是唯一 registrar。`UVPSupplierRegistryDebug` 是 QA-only 替身，生产部署禁止接线。Plan runtime identity 由 `publisher + runtimePlanHash` 导出；`runtimePlanHash` 覆盖 hooks、capabilitiesRoot 和 executorBindingsRoot。订单身份始终是复合键 `(planId, orderId)`。Identity Registry 只记录 subject/account 绑定。Supplier capability、reputation、名称、标签、联系信息、搜索推荐和 workflow 状态由 Store 独立保存。Chain Services 的链上投影可重建。完整边界见 [协议边界](../concepts/protocol-boundaries.md)。
