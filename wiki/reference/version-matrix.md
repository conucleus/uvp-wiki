---
title: 版本与语义矩阵
type: reference
audience: 工程贡献者
status: verified
---

# 版本与语义矩阵

所有版本收敛到单一基线：合约 ABI 夹具 `0.1`、EIP-712 域版本 `1`、产物 schema `v1`。逐项权威值见 `uvp-deploy/deploy/compatibility/uvp-stack.v1.json`。

| 边界 | 当前版本 | 含义 |
| --- | --- | --- |
| Rust core package | `0.1.0` | Hook 规范求值核心。 |
| Zhixu analysis | `uvp.zhixuAnalysis.v1` | uvp-core analyze wire schema。 |
| 协议语义 | `uvp.semantic.v1` | Hook 解析、求值和 replay 一致性边界。 |
| Cloud AST | `uvp.cloudAst.v1` | 云侧编译 AST wire schema。 |
| HookPlan artifact | `uvp.hookPlan.v1` | 编译器内部/公共 artifact；出生线由 `sendSignals[].trigger` 派生，执行者绑定（default/candidate）与 dynamic 标记进产物。 |
| OnchainHookPlan | `uvp.onchainHookPlan.v1` | EVM 编译产物 schema；`orderTriggerKind` 闭集为 `none`/`trigger`，`triggers[]` 枚举出生线，`supplierBindings`/`supplierBindingsRoot` 承诺计划执行者绑定。 |
| Cloud artifact | `uvp.cloudArtifact.v1` | 云侧编译产物 schema。 |
| Dock artifact | `uvp.dock.v1` | 静态 Dock 文档/编译产物 schema（uvp-core analyzeDock 生成，含 A validWhen AST/dependencies/atoms）。 |
| Dock binding read DTO | `uvp.dockBinding.v1` | 链读 binding/per-output 窗口投影 wire schema。 |
| StateMachine ABI | `0.1` | signed Plan commit/finalize（五字段 PlanCommit：publisher、hooksHash、capabilitiesRoot、supplierBindingsRoot、deadline，含 `StageSupplierBinding[]`）、supplier registry 模块槽与强注册校验、dynamic 阶段（hook flag 32）与逐单 supplierId 指派、effective executor 发信权、`submitSignal` 代付入口（EIP-712 ECDSA/EIP-1271，msg.sender 仅 relayer）。事件面：`PlanCommitted` 携 `supplierBindingsRoot`，`SignalSubmitted` 携 `relayer`，`StageSupplierAssigned`/`StageSupplierPatchApplied` 携 supplierId/patchNonce。EIP-712 domain version `1`。 |
| Plan registration library ABI | `0.1` | `commitPlan`/`finalizePlan`/`submitSignal` 执行体分段外置的 `UVPPlanRegistration` 链接库（库产物携带状态机事件面）；commit 校验 `StageSupplierBinding[]` 与 `supplierBindingsRoot`。 |
| IdentityRegistry ABI | `0.1` | 线下 subject 与钱包的薄身份绑定；不参与执行授权（StateMachine 不读取）。 |
| DeploymentRegistry ABI | `0.1` | deployment cutover 与 canary 记录。 |
| Derived signal module ABI | `0.1` | Derived signal 模块冻结 ABI（EIP-712 domain version `1`）；发信权取 from 阶段 effective executor，无目标单显式授权 fallback。 |
| Product submit domain | `1` | Product signal submit EIP-712 domain。 |
| Stage patch module ABI | `0.1` | Executor patch 与 dock 执行者选择所在模块冻结 ABI（patch EIP-712 domain version `1`）；patch 载荷为 supplierId/previousSupplierId/patchNonce（`previousSupplierId == 0` assign、非零 handoff，无 mode/授权字段），dock selection 携 supplierId。 |
| DockRegistry ABI | `0.1` | 静态 Dock 注册表：`registerDock`/`DockRegistered`，原子/输出 capability proof 由 plan metadata 校验。 |
| Plan metadata module ABI | `0.1` | plan metadata 冻结 ABI：capability 词表与 signal capability、stage selector binding、file-writer capability 叶（`UVP_FILE_WRITER_V1`）的成员校验（按叶公式重算）。 |
| File resource module ABI | `0.1` | 阶段文件映射模块：`key -> (contentHash, handle)`、strict `add/replace/remove` + 必填 `baseHash`、无 nonce、`patchHash` first-win 吸收；写入鉴权按 effective executor。 |
| StateMachine lens ABI | `0.1` | dock/order/hook 只读视图，含 effective executor 与 active stage executor patch 读面。 |
| Deployment manifest | `uvp-eth.addresses.v1` | 部署地址清单 schema。 |

语义边界：依赖索引多对多、无阶段 owner，同一事实可被任意数量/阶段的 hook 观察；求值不以阶段物化为前提，Ready 在阶段物化时统一宣告（物化 flush 按本阶段 hook 注册序补发 Ready-but-unannounced hook）；`EMIT_READY` 是可物化能力位、不是求值门，trigger 只在出生交易求值。

`uvp-core analyze` 的 wire schema 为 `uvp.zhixuAnalysis.v1`：每个 stage 输出规范化 `triggers`（`<stage>.<signal>`）与 hook 解析结果，由 compiler/hook-core 消费；它不进入链上注册参数。链轨 TS 编译器只消费该结果做 lowering/装饰/壳层总装，不重复校验定义。

`supplierId: bytes32` 是供应商链上身份主键（`supplierID` 字符串仅作别名，编译期按固定域派生同一个 `supplierId`）；`UVPSupplierRegistry` 是唯一链上执行身份，只存 `supplierId ↔ account` 薄绑定与 `pending/active/suspended/revoked` 状态，无 tier/validity/descriptor 字段，平台 store 是唯一 registrar。`UVPSupplierRegistryDebug` 是 QA-only 替身，生产部署禁止接线。Plan runtime identity 由 `publisher + runtimePlanHash` 导出；`runtimePlanHash` 覆盖 hooks、capabilitiesRoot 和 supplierBindingsRoot（域 `uvp.plan.runtime.v7`，跨轨冻结承诺域，不是发布版本）。订单身份始终是复合键 `(planId, orderId)`。`UVPIdentityRegistry` 只记录 subject/account 绑定，不授权执行；`zhixu-registry` 是链下数据登记层，同样不参与链上执行授权。Supplier capability、reputation、名称、标签、联系信息、搜索推荐和 workflow 状态由 Store 独立保存。Chain Services 的链上投影可重建。完整边界见 [协议边界](../concepts/protocol-boundaries.md)。
