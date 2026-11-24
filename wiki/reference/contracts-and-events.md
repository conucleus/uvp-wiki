---
title: 合约与事件
type: reference
audience: 工程贡献者
status: verified
---

# 合约与事件

合约源码在 `uvp-protocol/contracts/uvp-contracts/`，冻结 ABI fixture 在同目录 `fixtures/`。ABI、事件名、EIP-712 域与 canonical hash 都是 public interface；改动必须显式更新 fixture 并审查 adapter。

## 合约与模块

| 合约 | 作用 |
| --- | --- |
| `UVPIdentityRegistry` | 唯一链上身份边界：subjectId↔account 绑定（owner 注册、可撤销），以及 supplier capability/account 命名空间（SID 铸造、永久 account 绑定、`pending/active/suspended/revoked`、registrar 管理）。 |
| `UVPStateMachine` | 核心状态机：plan 提交/定稿、`submitSignal` 出生与信号提交、hook 求值、timer、模块写回，以及 module set 的配置与冻结。 |
| `UVPPlanRegistration` | plan 生命周期外置链接库：`commitPlan` / `finalizePlan` / `submitSignal` 与全部注册边界校验，经 DELEGATECALL 写主合约存储。 |
| `UVPPlanMetadataModule` | plan 元数据：`capabilitiesRoot`（signal capability 与 stage selector binding 的 Merkle 树）的存储、叶公式与成员证明校验；`fileWriters` 不在该树中。 |
| `UVPStagePatchModule` | 订单级 stage supplier patch（`applyStageSupplierPatch` / `applyStageSupplierPatchFor`，以 `previousSupplierId` 区分首次指派/交接）；dock supplier 一次性选择（`selectStageDockSupplier` / `selectStageDockSupplierFor`）；binding 求值与输出发射（`pokeDockBinding`）。 |
| `UVPDockRegistry` | 静态 Dock 注册表：`registerDock` 存 from/to plan、source/stage、`docHash` 与每个 output 的 A 窗口指令计划、atoms；读面 `getDock` / `dockOutputCount` / `getDockOutput`。 |
| `UVPFileResourceModule` | 阶段文件映射 owner：`StageFile{string key; bytes payload}` 的 `applyStageFiles` 写入（同 key 覆盖）；只接受来自 `UVPStateMachine` 的目录调用；事件只有 `StageFileWritten`。 |
| `UVPDerivedSignalModule` | 订单内派生信号的 signed 提交入口，两端绑定 `(planId, orderId)` 复合身份。 |
| `UVPStateMachineLens` | 状态机与各模块的只读 lens：active stage supplier assignment、dock supplier selection、dock binding 与 output 窗口、plan 元数据视图。 |
| `UVPDeploymentRegistry` | versioned state-machine deployment cutover ledger。 |
| `ECDSA` | minimal signature recovery helper。 |
| `UVPSignatures` | relayed state-machine signal submission shared signature struct。 |

## Public Interface

`UVPStateMachine` public boundary 包括：

- 无参 constructor；
- module 配置与一次 `freezeModules`；7 个模块槽（stagePatch、derivedSignal、dockRegistry、planMetadata、lens、fileResource、identityRegistry）只接受有代码的地址，冻结后保持当前 module set；
- publisher 签名的六字段 `PlanCommit`（publisher、hooksHash、capabilitiesRoot、supplierBindingsRoot、fileWritersHash、deadline）经 `commitPlan` 提交，任意 relayer 可转交；`finalizePlan(bytes32)` 定稿 permissionless；
- 唯一出生/信号入口 `submitSignal(SignalSubmission, signature)`：空 `orderId` + trigger 信号建单；非空 `orderId` 提交业务信号或纯文件写入。订单号由合约 `_newOrderId` 运行期生成，按 `(submitter, idempotencyKey)` 去重；发信权是 source 阶段当前生效的 assigned supplier account；
- module-only 写回入口（derived `submitDerivedSignalFromModule`、dock output `submitDockOutputSignalFromModule`、stage supplier 激活等）；
- dock 目录与查询：`dockRegistry` / `setDockRegistry`、dock 阶段/hook 标记查询 `stageHasDockExecutorHook`、A 窗口求值 `evaluateDockWindow`、B 窗口适格查询 `isSignalAdmissionSatisfied`；
- `pokeTimer`、`getHookStatus`、`hasSignal`/`getSignal`、`sourceSignalCount`、`lastSignalSubmitter`、per-stage 原生计数 `stageSignalState`、`planRuntimeHash`/`planFileWritersHash`、`DOMAIN_SEPARATOR`；
- event topics、function selectors、ABI hash、bytecode hash。

模块 public boundary 包括：

- stage patch：`applyStageSupplierPatch` / `applyStageSupplierPatchFor`（signed 入口携带候选 SID 的 `supplierBindingsRoot` 叶证明）、`selectStageDockSupplier` / `selectStageDockSupplierFor`、`pokeDockBinding`；
- dock registry：`registerDock` / `getDock` / `dockOutputCount` / `getDockOutput`；
- file resource：`applyStageFiles`（仅 state machine 目录调用）、`getStageFile`；
- derived signal：`submitDerivedSignal` / `submitDerivedSignalFor`；
- plan metadata：`capabilitiesRoot`、`hasCapabilityVocabulary`、`verifySignalCapability`、`verifyStageSelectorBinding`；
- lens：stage supplier assignment / dock selection / binding 视图与 plan 元数据 helper。

## ABI 与 EIP-712 域版本

版本与冻结 ABI 的单一机械对照出处是兼容矩阵 `uvp-deploy/deploy/compatibility/uvp-stack.v1.json`；权威实现是合约常量本身。签名方必须按所部署合约的域版本构造 EIP-712 typed data。

全部冻结 ABI 统一 `0.1`、全部 EIP-712 域统一 `1`（单一基线）。

| 边界 | 冻结 ABI | EIP-712 域 |
| --- | --- | --- |
| `UVPStateMachine` / productSubmit | `0.1` | `1`（`UVPStateMachineSignalSubmission`，11 字段） |
| `UVPPlanRegistration` | `0.1` | 主域 `1`（与 state machine 共用常量） |
| `UVPStagePatchModule` | `0.1` | `stageSupplierPatch` `1` |
| `UVPDockRegistry` | `0.1` | 无签名域（注册 permissionless） |
| `UVPPlanMetadataModule` | `0.1` | 无 |
| `UVPDerivedSignalModule` | `0.1` | `derivedSignal` `1` |
| `UVPFileResourceModule` | `0.1` | 无（随 direct `submitSignal` 提交） |
| `UVPIdentityRegistry` | `0.1` | 无（subject 绑定与 supplier 命名空间） |
| `UVPDeploymentRegistry` | `0.1` | 无 |
| `UVPStateMachineLens` | `0.1` | 无 |

订单身份是复合键 `(planId, orderId)`：indexer、replay、Product DTO 与 adapter 都按复合身份寻址，不把 bare `orderId` 当作全局主键。Dock 不是出生通道；订单创建只有 `submitSignal(orderId=0)` 一条入口。

## Dock 注册与 Binding

- **注册（permissionless）**：`registerDock(fromPlanId, fromSourceId, toPlanId, toStageId, toSourceId, docHash, outputs[])`；每个 output 携带 B 侧信号、A 侧窗口指令计划（atoms + `SIGNAL` / `NOT` / `AND` / `OR` / `DELAY`）与逐 atom/逐 output capability proof，合约经 `UVPPlanMetadataModule` 成员证明校验（`DockOutputCapabilityNotFound` / `DockAtomCapabilityNotFound`）。
- **身份**：`dkid = bytes32(bytes16(docHash))`，docHash 由 Dock 文档内容派生（产物 `uvp.dock.v1` 的 `dkid = zd-<32hex>`）；重复注册 revert `DockAlreadyRegistered`。读面 `getDock` / `dockOutputCount` / `getDockOutput` 的入参是 **dkid word**（artifact `dkid` 右补零），不是注册调用里的 fromPlanId。
- **dock supplier 选择（一次性）**：selector 调用 `selectStageDockSupplier`，或经 `selectStageDockSupplierFor` 携 selector 的 EIP-712 签名（域 `stageSupplierPatch` 1）；合约校验该 stage 的 `HOOK_FLAG_DOCK_EXECUTOR` 标记、selector binding 与 SID active。同 dkid + supplier 重放按幂等吸收，换选 revert `StageDockSupplierAlreadySelected`。
- **binding（7 word，无 payload hash）**：`bindingId = keccak256(abi.encode("uvp.dock.binding_id.v1", dkid, toPlanId, toOrderId, toStageId, fromPlanId, fromOrderId))`；binding 由挂接 stage 的文件项 `dock_link` 确定，其值是 canonical A 订单号（`0x` + 64 hex）；`dock_link` 的 `contentHash` 只在 poke 时认证载荷正文，不匹配 revert `DockBindingContentHashMismatch`。
- **窗口与发射**：`pokeDockBinding` 按 `block.timestamp` 求 A 窗口（与 hook 同一求值器；`~` 在事实到达时关闭、`+T` 延迟锚点），再复核 B 侧 `sendSignals.validWhen` 适格；逐 output first-win 发射（已存在的 B 事实不覆盖）。历史窗口时间不上链，读面 `getStageDockBinding` / `dockOutputWindow` 只给当前态与相对 `dueInSeconds`。

## 阶段文件映射

- owner 是 `UVPFileResourceModule`；核心 `UVPStateMachine` 只经 `fileResourceModule()` 目录调用，模块以 `msg.sender == stateMachine` 为唯一信任闸。
- 键值是 `StageFile{string key; bytes payload}`；key ≤128 字节、payload ≤4096 字节、单次 ≤16 项；同 key 再写覆盖，引擎不解析 key/payload。链上不定义 `fileType`，也不携带类型/存储语义。
- 没有 `add` / `replace` / `remove` 状态机、没有 `baseHash` 滚动哈希、没有 `patchHash`、没有 handle 或 per-key 版本号；同一事务内逐项原子写入，事件逐 key 发 `StageFileWritten`。
- 入口是 direct `submitSignal` 的 `files: StageFile[]`（不是签名尾参或独立 patch 入口）；`signalId == 0` 为纯文件写入——不增业务信号计数、不触发 hook、不跑 admission。
- 写权：target 阶段 assigned supplier account，或 target 阶段 `fileWriters` 声明的 writer stage 的 assigned supplier account；self 隐式。`fileWriters` 是 PlanCommit 明文签名的 `StageFileWriter[]`，由 `fileWritersHash` 承诺。

## Stable Events

Indexer 和 replay tooling 应把这些 event name 当作 public interface：

```text
OwnershipTransferred
StateMachineModuleSet
StateMachineModulesFrozen
PlanCommitted
PlanFinalized
PlanRegistered
PlanPublisherRecorded
OrderRelayerRecorded
OrderRegistered
OrderMaterialized
OrderTriggered
SignalSubmitted
StageMaterialized
StageSupplierAssigned
HookStatusChanged
HookReady
TimerPoked
```

模块事件：

```text
DockRegistered                    # UVPDockRegistry
DockOutputDeferred                # UVPStagePatchModule
StageDockSupplierSelected         # UVPStagePatchModule
StageSupplierPatchApplied         # UVPStagePatchModule
DockBindingPoked                  # UVPStagePatchModule
DockOutputSubmitted               # UVPStagePatchModule
StageFileWritten                  # UVPFileResourceModule
DerivedSignalSubmitted            # UVPDerivedSignalModule
DeploymentRegistered              # UVPDeploymentRegistry
DeploymentCanaryMarked            # UVPDeploymentRegistry
DeploymentActivated               # UVPDeploymentRegistry
DeploymentDeprecated              # UVPDeploymentRegistry
DeploymentRetired                 # UVPDeploymentRegistry
IdentityBindingRegistered         # UVPIdentityRegistry
IdentityBindingRevoked            # UVPIdentityRegistry
SupplierRegistered                # UVPIdentityRegistry
SupplierRegistrarSet              # UVPIdentityRegistry
SupplierStatusChanged             # UVPIdentityRegistry
```

模块事件都携带复合 `(planId, orderId)` 身份；`DockRegistered` 携带完整 outputs、atoms 与 A 窗口程序。

## 事件自包含字段

事件参数自身即可重建发信权、per-stage 归属与 dock 状态，不依赖 view 调用：

| 事件 | 自包含字段 | 用途 |
| --- | --- | --- |
| `PlanCommitted` | `hooksHash`、`capabilitiesRoot`、`supplierBindingsRoot` | 重建 plan 承诺面；`fileWritersHash` 在 PlanCommit/`planHash` 内，事件不重复携带，读面用 `planFileWritersHash`。 |
| `SignalSubmitted` | `factStageId`、`submitter`、`relayer` | 事实归属阶段、业务提交者与代付者；per-stage 归属与计数可重建。 |
| `OrderTriggered` | `triggerStageId`、`triggerHookId`、`sourceId`、`signalId`、`submitter` | 出生事实与出生线；订单号由交易内 `_newOrderId` 生成。 |
| `StageSupplierAssigned` | `supplierId`、`patchNonce` | stage→SID 首次指派/物化路径。 |
| `StageSupplierPatchApplied` | `selectorStageId`、`targetStageId`、`selector`、`supplierId`、`previousSupplierId`、`patchNonce` | 逐单 assign/handoff 的完整变更。 |
| `StageDockSupplierSelected` | `targetStageId`、`dockId`、`supplierId`、`patchNonce` | dock supplier 一次性选择。 |
| `DockBindingPoked` | `dockId`、`bindingId`、`fromPlanId`、`fromOrderId`、`supplierId`、`emittedCount` | binding 窗口求值与发射批次。 |
| `DockOutputSubmitted` | `bindingId`、`outputIndex`、`signalId`、`supplierId` | 逐 output 发射事实与 provenance。 |
| `StageFileWritten` | `key`、`payload`、`submitter` | 逐 key 文件映射，索引器按日志序重放。 |

`HookStatusChanged.previousStatus`（迁移前态）与 `StageMaterialized.triggerHookId/sourceId/signalId`（阶段物化出生触发）同样进入投影；治理事件 `OwnershipTransferred` 与 `StateMachineModulesFrozen` 进入 `contractGovernance` 投影，治理状态可全量重建。

## 具名错误面

Dock 路径的错误按因具名：`DockBindingContentHashMismatch`（`dock_link` 载荷正文与记录哈希不符）、`DockBindingPayloadMissing`（挂接 stage 无 `dock_link` 文件项）、`DockOrderPlanMismatch`（A 订单不属于 Dock 的 from plan）、`StageDockSupplierAlreadySelected`（换选已选定的 dock supplier）。注册路径同理：`DockAlreadyRegistered`、`DockOutputCapabilityNotFound`、`DockAtomCapabilityNotFound`。文件路径：`FileWriterUnauthorized`、`StageFileKeyEmpty`、`StageFileKeyTooLong`、`StageFilePayloadTooLarge`、`StageFilesTooMany`、`FileTargetStageUnknown`。stage patch 路径：`StageSupplierNotCandidate`、`StageSupplierPatchForbiddenOnFixedStage`、`StageSupplierPatchForbiddenOnBirthStage`、`StageSupplierPatchForbiddenOnDockStage`、`StageSupplierPatchNonceNotIncreasing`、`StageSupplierPatchPreviousSupplierMismatch`。

## Fixture Verification

从仓库根目录：

```bash
pnpm verify:protocol-freeze
```

从合约目录：

```bash
cd uvp-protocol/contracts/uvp-contracts
forge build
forge test
```

操作步骤见 [排障](../how-to/troubleshooting.md)。

## Funding Boundary

当前合约模块的 core boundary 聚焦 state machine、身份 registry 和 deployment registry。funding、资金托管、custody、settlement、release、refund、争议赔付、ERC20 或 USDC 合约属于应用仓 adapter 工作；未来资金相关工作必须有独立的 authorization、event mapping、tests 和 PRD，并消费 `UVPStateMachine` signal。完整边界见 [协议边界：外围适配](../concepts/protocol-boundaries.md#外围适配)。
