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
| `UVPIdentityRegistry` | 线下 subject 与钱包的身份绑定及逐 binding 撤销（owner 控制）。 |
| `UVPStateMachine` | 核心状态机：plan 提交/定稿、trigger 出生、signal 提交、hook 求值、timer、模块写回，以及 module set 的配置与冻结。 |
| `UVPPlanRegistration` | plan 生命周期外置链接库：`commitPlan` / `finalizePlan` / `forkOrder` 与全部注册边界校验，经 DELEGATECALL 写主合约存储。 |
| `UVPPlanMetadataModule` | plan 元数据：`capabilitiesRoot`（signal capability、stage selector binding、file-writer 三类 capability 叶的 Merkle 树）的存储、叶公式与成员证明校验。 |
| `UVPStagePatchModule` | 订单级 executor patch（`applyStageExecutorPatch` / `applyStageExecutorPatchFor`，mode 闭集 `assign`/`handoff`）；dock 执行者一次性选择（`selectStageDockExecutor` / `selectStageDockExecutorFor`）；binding 求值与输出发射（`pokeDockBinding`）。 |
| `UVPDockRegistry` | 静态 Dock 注册表：`registerDock` 存 from/to plan、source/stage、`docHash` 与每个 output 的 A 窗口指令计划、atoms；读面 `getDock` / `dockOutputCount` / `getDockOutput`。 |
| `UVPFileResourceModule` | 阶段文件映射 owner：`key -> (contentHash, handle)`；`applyStageFilePatch` 落 `add` / `replace` / `remove`，只接受来自 `UVPStateMachine` 的目录调用。 |
| `UVPDerivedSignalModule` | 订单间派生信号的 signed 提交入口，两端绑定 `(planId, orderId)` 复合身份。 |
| `UVPOrderLinkModule` | 订单间派生建单：signed `triggerOrderFromSignalFor` 与 `OrderLinked` 登记。 |
| `UVPStateMachineLens` | 状态机与各模块的只读 lens：active executor patch、dock 执行者选择、dock binding 与 output 窗口、plan 元数据视图。 |
| `UVPDeploymentRegistry` | versioned state-machine deployment cutover ledger。 |
| `ECDSA` | minimal signature recovery helper。 |
| `UVPSignatures` | relayed state-machine signal submission shared signature struct。 |

## Public Interface

`UVPStateMachine` public boundary 包括：

- 无参 constructor；
- module 配置与一次 `freezeModules`；模块槽只接受有代码的地址，冻结后保持当前 module set；
- publisher 签名的六字段 `PlanCommit`（publisher、hooksHash、capabilitiesRoot、supplierBindingsRoot、birthAuthorizer、deadline）经 `commitPlan` 提交，任意 relayer 可转交；`finalizePlan(bytes32)` 定稿 permissionless；
- 出生通道：outside trigger（`triggerOrderFromOutsideFor`；`birthAuthorizer` 为合约时用无签名直接入口 `triggerOrderFromOutsideByAuthorizer`）、order-link 模块的 `triggerOrderFromSignalFor`、治理分叉 `forkOrder`；orderId 由出生事实纯函数派生，调用方不可自报；
- `submitSignal`：唯一的外部 signal 写入口，身份固定 `msg.sender`（合约 executor 可由 relayer/keeper 代付）；calldata 尾部携带 `bytes32 filesDigest` 与 `FilePatch filePatch`，`signalId == 0` 表示纯文件 patch；
- module-only 写回入口（order-link `triggerOrderFromSignalFromModule`、derived `submitDerivedSignalFromModule`、dock output `submitDockOutputSignalFromModule`、stage executor 激活等）；
- dock 目录与查询：`dockRegistry` / `setDockRegistry`、dock 阶段/hook 标记查询 `stageHasDockExecutorHook`、A 窗口求值 `evaluateDockWindow`、B 窗口适格查询 `isSignalAdmissionSatisfied`；
- `pokeTimer`、`getHookStatus`、`isSignalSubmitterAuthorized`、`getSignalAuthorization`、`sourceSignalCount`、`lastSignalSubmitter`、per-stage 原生计数 `stageSignalState`、fork helpers、plan runtime hash helpers、`DOMAIN_SEPARATOR`；
- event topics、function selectors、ABI hash、bytecode hash。

模块 public boundary 包括：

- stage patch：executor patch（signed 入口携带 `bindingProof` + `candidateProof` + `executorAuthorizations`）、dock 执行者选择、`pokeDockBinding`；
- dock registry：`registerDock` / `getDock` / `dockOutputCount` / `getDockOutput`；
- file resource：`applyStageFilePatch`（仅 state machine 目录调用）、`getStageFile`、`stageFilesHash`、`filePatchDigest`；
- derived signal：`submitDerivedSignal` / `submitDerivedSignalFor`；
- order-link：`triggerOrderFromSignalFor`、`getTriggerOriginLink`、`targetOrderRelation`；
- plan metadata：`capabilitiesRoot`、`hasCapabilityVocabulary`、`verifySignalCapability`、`verifyStageSelectorBinding`、`verifyFileWriter`；
- lens：executor patch / dock selection / binding 视图与 plan 元数据 helper。

## ABI 与 EIP-712 域版本

版本与冻结 ABI 的单一机械对照出处是兼容矩阵 `uvp-deploy/deploy/compatibility/uvp-stack.v1.json`；权威实现是合约常量本身。签名方必须按所部署合约的域版本构造 EIP-712 typed data。

| 边界 | 冻结 ABI | EIP-712 域 |
| --- | --- | --- |
| `UVPStateMachine` / productSubmit | `0.21` | `0.19` |
| `UVPPlanRegistration` | `0.7` | 主域 `0.19`（与 state machine 共用常量） |
| `UVPStagePatchModule` | `0.10` | `stageSupplierPatch` `0.5` |
| `UVPDockRegistry` | `0.1` | 无签名域（注册 permissionless） |
| `UVPPlanMetadataModule` | `0.8` | 无 |
| `UVPOrderLinkModule` | `0.4` | `orderLink` `0.9` |
| `UVPDerivedSignalModule` | `0.7` | `derivedSignal` `0.7` |
| `UVPFileResourceModule` | `0.2` | 无（随 direct `submitSignal` 提交） |
| `UVPIdentityRegistry` | `0.1` | 无 |
| `UVPDeploymentRegistry` | `0.2` | 无 |
| `UVPStateMachineLens` | `0.7` | 无 |

订单身份是复合键 `(planId, orderId)`：indexer、replay、Product DTO 与 adapter 都按复合身份寻址，不把 bare `orderId` 当作全局主键。Dock 不是出生通道，订单创建只走本页列出的三条出生通道。

## Dock 注册与 Binding

- **注册（permissionless）**：`registerDock(fromPlanId, fromSourceId, toPlanId, toStageId, toSourceId, docHash, outputs[])`；每个 output 携带 B 侧信号、A 侧窗口指令计划（atoms + `SIGNAL` / `NOT` / `AND` / `OR` / `DELAY`）与逐 atom/逐 output capability proof，合约经 `UVPPlanMetadataModule` 成员证明校验（`DockOutputCapabilityNotFound` / `DockAtomCapabilityNotFound`）。
- **身份**：`dkid = bytes32(bytes16(docHash))`，docHash 由 Dock 文档内容派生（产物 `uvp.dock.v1` 的 `dkid = zd-<32hex>`）；重复注册 revert `DockAlreadyRegistered`。读面 `getDock` / `dockOutputCount` / `getDockOutput` 的入参是 **dkid word**（artifact `dkid` 右补零），不是注册调用里的 fromPlanId。
- **dock 执行者选择（一次性）**：selector 调用 `selectStageDockExecutor`，或经 `selectStageDockExecutorFor` 携 selector 的 EIP-712 签名（域 `stageSupplierPatch` 0.5）；合约校验该 stage 的 `HOOK_FLAG_DOCK_EXECUTOR` 标记、selector binding 与执行者对 dock 全部 output 的订单级授权。同 dkid + executor 重放按幂等吸收，换选 revert `StageDockExecutorAlreadySelected`。
- **binding（7 word，无 payload hash）**：`bindingId = keccak256(abi.encode("uvp.dock.binding_id.v1", dkid, toPlanId, toOrderId, toStageId, fromPlanId, fromOrderId))`；binding 由挂接 stage 的文件项 `dock_link` 确定，其值是 canonical A 订单号（`0x` + 64 hex）；`dock_link` 的 `contentHash` 只在 poke 时认证载荷正文，不匹配 revert `DockBindingContentHashMismatch`。
- **窗口与发射**：`pokeDockBinding` 按 `block.timestamp` 求 A 窗口（与 hook 同一求值器；`~` 在事实到达时关闭、`+T` 延迟锚点），再复核 B 侧 `sendSignals.validWhen` 适格；逐 output first-win 发射（已存在的 B 事实不覆盖）。历史窗口时间不上链，读面 `getStageDockBinding` / `dockOutputWindow` 只给当前态与相对 `dueInSeconds`。

## 阶段文件映射

- owner 是 `UVPFileResourceModule`；核心 `UVPStateMachine` 只经 `fileResourceModule()` 目录调用，模块以 `msg.sender == stateMachine` 为唯一信任闸。
- 键值是 `key -> (contentHash, handle)`；`handle` 是不透明、有界（≤512 字节）的引用，引擎不解析、不落正文。链上不定义 `fileType`，也不携带类型/存储语义。
- ops 为 `add`（键不存在）/ `replace`（键存在）/ `remove`（键存在），严格前置、整笔原子；`baseHash` 必填且等于该 stage 当前文件版本（`filesHash = keccak256(abi.encode(oldHash, patchHash))` rolling），不一致整笔拒绝。
- 映射恒只有一个当前值，没有 nonce；`patchHash` 已应用过按 first-win 吸收。
- 入口是 direct `submitSignal` 尾部的 `bytes32 filesDigest` + `FilePatch`；`signalId == 0` 为纯文件 patch——不增业务信号计数、不触发 hook、不跑 admission。

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
SignalSubmitterAuthorized
SignalSubmitterRevoked
SignalSubmitted
StageMaterialized
StageExecutorActivated
StageExecutorPatchApplied
OrderForked
HookStatusChanged
HookReady
TimerPoked
```

模块事件：

```text
DockRegistered                    # UVPDockRegistry
StageDockExecutorSelected         # UVPStagePatchModule
DockBindingPoked                  # UVPStagePatchModule
DockOutputSubmitted               # UVPStagePatchModule
StageFilePatchApplied             # UVPFileResourceModule
StageFileOpApplied                # UVPFileResourceModule
OrderLinked                       # UVPOrderLinkModule
DerivedSignalSubmitted            # UVPDerivedSignalModule
DeploymentRegistered              # UVPDeploymentRegistry
DeploymentCanaryMarked            # UVPDeploymentRegistry
DeploymentActivated               # UVPDeploymentRegistry
DeploymentDeprecated              # UVPDeploymentRegistry
DeploymentRetired                 # UVPDeploymentRegistry
IdentityBindingRegistered         # UVPIdentityRegistry
IdentityBindingRevoked            # UVPIdentityRegistry
```

模块事件都携带复合 `(planId, orderId)` 身份；`DockRegistered` 携带完整 outputs、atoms 与 A 窗口程序。

## 事件自包含字段

事件参数自身即可重建授权面、per-stage 归属、fork 血缘与治理状态，不依赖 view 调用：

| 事件 | 自包含字段 | 用途 |
| --- | --- | --- |
| `PlanCommitted` | `hooksHash`、`capabilitiesRoot`、`supplierBindingsRoot`、`birthAuthorizer` | 重建 plan 承诺面与 outside 出生授权人。 |
| `SignalSubmitted` | `factStageId` | 事实归属阶段（0 = 词表外事实），per-stage 归属与计数可重建。 |
| `OrderForked` | `forkPayloadHash`、`replayedFactKeys` | fork 单号派生载荷与血缘；清单内键是父单事实重放，清单外是 fork 单新生事实。 |
| `DerivedSignalSubmitted` | `relation` | 目标单关系（0 = from==target 本单生产，1 = triggerOrigin 回写）。 |
| `StageDockExecutorSelected` | `dockId`、`fromPlanId`、`executor`、`selector`、`patchHash`、`patchNonce`、`metadataURI` | 重建 dock 执行者选择。 |
| `DockBindingPoked` | `dockId`、`bindingId`、`fromPlanId`、`fromOrderId`、`executor`、`emittedCount` | 重建 binding 窗口求值与发射批次。 |
| `DockOutputSubmitted` | `bindingId`、`outputIndex`、`signalId`、`executor` | 逐 output 发射事实与 provenance。 |
| `StageFilePatchApplied` | `patchHash`、`baseHash`、`writerStageId`、`opCount` | 文件 patch 批次。 |
| `StageFileOpApplied` | `kind`、`key`、`contentHash`、`handle` | 逐 op 文件映射，索引器按日志序重放。 |

`HookStatusChanged.previousStatus`（迁移前态）与 `StageMaterialized.triggerHookId/sourceId/signalId`（阶段物化出生触发）同样进入投影；治理事件 `OwnershipTransferred` 与 `StateMachineModulesFrozen` 进入 `contractGovernance` 投影，治理状态可全量重建。

## 具名错误面

Dock 路径的错误按因具名：`DockBindingContentHashMismatch`（`dock_link` 载荷正文与记录哈希不符）、`DockBindingPayloadMissing`（挂接 stage 无 `dock_link` 文件项）、`DockExecutorAuthorizationMissing`（执行者对某个 dock output 无订单级授权）、`DockOrderPlanMismatch`（A 订单不属于 Dock 的 from plan）、`StageDockExecutorAlreadySelected`（换选已选定的 dock 执行者）。注册与文件路径同理：`DockAlreadyRegistered`、`DockOutputCapabilityNotFound`、`DockAtomCapabilityNotFound`；`FileBaseHashMismatch`、`FileWriterUnauthorized`、`FileOpKindInvalid`、`FileKeyExists`、`FileKeyMissing`。

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

当前合约模块的 core boundary 聚焦 state machine、薄身份 registry 和 deployment registry。funding、资金托管、custody、settlement、release、refund、争议赔付、ERC20 或 USDC 合约属于 adapter/periphery 工作；未来资金相关工作必须有独立的 authorization、event mapping、tests 和 PRD，并消费 `UVPStateMachine` signal。完整边界见 [协议边界：外围适配](../concepts/protocol-boundaries.md#外围适配)。
