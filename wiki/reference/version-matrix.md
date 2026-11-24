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
| StateMachine ABI | `0.1` | signed Plan commit/finalize（六字段 PlanCommit：publisher、hooksHash、capabilitiesRoot、supplierBindingsRoot、`fileWritersHash`、deadline，含 `StageSupplierBinding[]` 与 `StageFileWriter[]`）、identityRegistry 模块槽与 supplier 强注册校验、dynamic 阶段（hook flag 32）与逐单 supplierId 指派、assigned supplier account 发信权、`submitSignal` 单一入口（EIP-712 ECDSA/EIP-1271，msg.sender 仅 relayer）。事件面：`PlanCommitted` 携 `supplierBindingsRoot`，`SignalSubmitted` 携 `relayer`，`StageSupplierAssigned`/`StageSupplierPatchApplied` 携 supplierId/patchNonce。EIP-712 domain version `1`。 |
| Plan registration library ABI | `0.1` | `commitPlan`/`finalizePlan`/`submitSignal` 执行体分段外置的 `UVPPlanRegistration` 链接库；commit 校验 `StageSupplierBinding[]`、`StageFileWriter[]`、`supplierBindingsRoot` 与 `fileWritersHash`，并校验 `_validateInstructions`/`_registerPlanAdmission` 指令计划。 |
| IdentityRegistry ABI | `0.1` | 唯一链上身份边界：subjectId↔account 绑定（可撤销的信任存证），以及 supplier capability/account 命名空间（SID 铸造、永久 account 绑定、`pending/active/suspended/revoked`）；供应商命名空间是执行授权来源，subject 命名空间不参与发信权。 |
| DeploymentRegistry ABI | `0.1` | deployment cutover 与 canary 记录。 |
| Derived signal module ABI | `0.1` | Derived signal 模块冻结 ABI（EIP-712 domain version `1`）；发信权取 from 阶段 effective supplier，无目标单授权 fallback。 |
| Product submit domain | `1` | Product signal submit EIP-712 domain；primary type `UVPStateMachineSignalSubmission`（11 字段，含 `targetStageId`、`filesHash`、`attributionHash`）。 |
| Stage patch module ABI | `0.1` | `applyStageSupplierPatch` / `applyStageSupplierPatchFor` 与 dock 一次性选择 `selectStageDockSupplier` / `selectStageDockSupplierFor`（patch EIP-712 domain version `1`）；patch 载荷为 supplierId/previousSupplierId/patchNonce（`previousSupplierId == 0` assign、非零 handoff，无 mode/授权字段），候选关系用 `supplierBindingsRoot` 的 kind=1 candidate 叶证明。 |
| DockRegistry ABI | `0.1` | 静态 Dock 注册表：`registerDock`/`DockRegistered`，原子/输出 capability proof 由 plan metadata 校验。 |
| Plan metadata module ABI | `0.1` | plan metadata 冻结 ABI：`capabilitiesRoot` 下 capability 词表与 signal capability、stage selector binding 的成员校验；`fileWriters` 不在这里，见 PlanCommit `fileWritersHash`。 |
| File resource module ABI | `0.1` | 阶段文件映射模块：`StageFile{string key; bytes payload}`，`applyStageFiles` 同 key 覆盖；无 `add/replace/remove`、无 `baseHash`/`patchHash`、无 handle/版本号；事件只有 `StageFileWritten`；写入鉴权按 target/writer 阶段的 assigned supplier。 |
| StateMachine lens ABI | `0.1` | dock/order/hook 只读视图，含 effective supplier assignment 与 stage dock selection 读面。 |
| Deployment manifest | `uvp-eth.addresses.v1` | 部署地址清单 schema。 |

语义边界：依赖索引多对多、无阶段 owner，同一事实可被任意数量/阶段的 hook 观察；求值不以阶段物化为前提，Ready 在阶段物化时统一宣告（物化 flush 按本阶段 hook 注册序补发 Ready-but-unannounced hook）；`EMIT_READY` 是可物化能力位、不是求值门，trigger 只在出生交易求值。

`uvp-core analyze` 的 wire schema 为 `uvp.zhixuAnalysis.v1`：每个 stage 输出规范化 `triggers`（`<stage>.<signal>`）与 hook 解析结果，由 compiler/hook-core 消费；它不进入链上注册参数。链轨 TS 编译器只消费该结果做 lowering/装饰/壳层总装，不重复校验定义。

`supplierId: bytes32` 是供应商链上身份主键（定义面 `supplierID` 字符串是同一 UUID 的别名，编译期按标准 36 字符小写 UUID 解码到 bytes32 低位，不做 hash）；执行身份唯一来源是 `UVPIdentityRegistry` 的 supplier 命名空间，只存 SID↔account 永久绑定与 `pending/active/suspended/revoked` 状态，无 tier/validity/descriptor 字段，平台 store 是唯一 registrar。plan runtime hash 域为 `uvp.plan.runtime.v8`，preimage 为四元 `(hooksHash, capabilitiesRoot, supplierBindingsRoot, fileWritersHash)`（跨轨冻结承诺域，不是发布版本）；planId 由 `publisher + runtimePlanHash` 导出。订单身份始终是复合键 `(planId, orderId)`。`UVPIdentityRegistry` 的 subject/account 命名空间只作信任存证，不授权执行；`zhixu-registry` 是链下数据登记层，同样不参与链上执行授权。Supplier capability、reputation、名称、标签、联系信息、搜索推荐和 workflow 状态由 Store 独立保存。Chain Services 的链上投影可重建。完整边界见 [协议边界](../concepts/protocol-boundaries.md)。
