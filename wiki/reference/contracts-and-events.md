---
title: 合约与事件
type: reference
audience: 工程贡献者
status: verified
---

# 合约与事件

合约源码在 `uvp-protocol/contracts/uvp-contracts/`。

## Contracts

| 合约 | 作用 |
| --- | --- |
| `UVPIdentityRegistry` | 线下 subject 与钱包的身份绑定及逐 binding 撤销。 |
| `UVPStateMachine` | plan/order/signal/hook/timer/stage overlay runtime。 |
| `UVPPlanRegistration` | 计划生命周期外部链接库：`commitPlan` / `finalizePlan` 与全部注册边界校验，经 DELEGATECALL 写主合约存储。 |
| `UVPPlanMetadataModule` | plan 元数据存储与校验：`capabilitiesRoot`（能力/绑定 Merkle 树）与 dock route/interface Merkle root 的存储、叶公式和 proof 验证。 |
| `UVPStagePatchModule` | 阶段 executor/resource patch 的应用与 active patch 记录（`applyStageExecutorPatch` / `applyStageResourcePatch`）。 |
| `UVPDerivedSignalModule` | 订单间派生信号的签名提交入口，两端绑定 `(planId, orderId)` 复合身份。 |
| `UVPOrderLinkModule` | 订单间派生建单：signed `triggerOrderFromSignalFor` 与 `OrderTriggerLink` 登记。 |
| `UVPDockingModule` | 统一 Zhixu DockRoute：`openDockedOrder`（单参数 `OpenDockCallV1`，必过目标 plan publisher 同意门）原子创建 linked order 并写 entrance fact，`attachDockedOrder` 对等挂接既有目标单，`submitDockedInput` / `submitDockedSignal` 回写交付。 |
| `UVPStateMachineLens` | 状态机与各模块的只读 lens 视图聚合（active patch、docking、plan 元数据）。 |
| `UVPDeploymentRegistry` | versioned state-machine deployment cutover ledger。 |
| `ECDSA` | minimal signature recovery helper。 |
| `UVPSignatures` | relayed state-machine signal submission shared signature structs。 |

## Public Interface

`UVPStateMachine` public boundary 包括：

- constructor args；
- module 配置与一次 `freezeModules`；
- signed `commitPlan` 与一次 `finalizePlan`；
- signed `triggerOrderFromOutsideFor`（状态机上的开放出生入口）；
- order-link 模块合约 `UVPOrderLinkModule` 上的 signed `triggerOrderFromSignalFor`（订单间派生建单；状态机内部只有该模块可调用的 `triggerOrderFromSignalFromModule`）；
- `submitSignal`；
- `submitSignalFor`；
- docking module 通过 `openDockedOrder`（`order.mode=new`，单参数 `OpenDockCallV1` 内含请求体 v2 与目标侧同意 `DockTargetConsentV1`）原子创建 linked order 和 docking relation；
- docking module 的 `submitDockedInput` / `submitDockedSignal`；
- `applyStageExecutorPatch` / `applyStageExecutorPatchFor`；
- `applyStageResourcePatch` / `applyStageResourcePatchFor`；
- EIP-712 digest helpers；
- `DOMAIN_SEPARATOR`；
- `pokeTimer`；
- order/plan/hook/status/signal authorization view helpers；
- stage overlay view helpers；
- event topics、function selectors、ABI hash、bytecode hash。

改变这些内容必须更新 fixture 并审查 adapter。当前订单身份按 `(planId, orderId)` 解析；任何
indexer、replay、Product DTO 或 adapter 都不得只用全局 `orderId` 推断所属 Plan。

## Event Field Extensions (B-03, ABI v0.16)

事件自包含扩展（下个 ABI 版本批，2026-10）：索引器全量重建授权面、per-stage 归属、fork 血缘与治理状态不再依赖 view 调用。新字段一律追加在参数列表尾部，旧字段顺序不动；EIP-712 domain 版本不变（事件扩展不改签名面）。

| 事件 | 追加字段（尾参） | 类型 | 用途 |
| --- | --- | --- | --- |
| `PlanCommitted` | `birthAuthorizer` | `address` | outside 出生闸授权人，授权面重建不依赖 `planBirthAuthorizer` view。 |
| `SignalSubmitted` | `factStageId` | `bytes32` | 事实归属阶段（0 = 词表外事实），per-stage 归属/计数重建不依赖 `stageSignalState` view。 |
| `OrderForked` | `forkPayloadHash` | `bytes32` | fork 单号派生载荷（`forkOrderIdFor(planId, parentOrderId, forkPayloadHash)`），血缘链可重算。 |
| `OrderForked` | `replayedFactKeys` | `bytes32[]` | 重放事实键清单（`keccak256(abi.encode(sourceId, signalId))`，与合约 `_signalKey` 同式）——清单内键的 `SignalSubmitted` 是父单事实重放，清单外是 fork 单新生事实。 |
| `DerivedSignalSubmitted` | `relation` | `uint8` | 目标单关系（0 = from==target 本单生产，1 = triggerOrigin 回写），派生通道授权面重建不依赖 order-link view。 |

事件本就携带、此前索引器丢弃、现已消费的字段：`HookStatusChanged.previousStatus`（状态迁移前态）、`StageMaterialized.triggerHookId/sourceId/signalId`（阶段物化出生触发）。治理面事件 `OwnershipTransferred` 与 `StateMachineModulesFrozen` 进入投影（`contractGovernance`），治理状态可全量重建。

## Stable Events

Indexer 和 replay tooling 应把这些 event name 当作 public interface：

```text
OwnershipTransferred
StateMachineModuleSet
StateMachineModulesFrozen
PlanCommitted
PlanFinalized
PlanPublisherRecorded
OrderRelayerRecorded
SignalSubmitterAuthorized
PlanRegistered
OrderRegistered
OrderTriggered
OrderLinked
OrderMaterialized
StageMaterialized
SignalSubmitted
DerivedSignalSubmitted
DockOpened
DockAttached
DockInputSubmitted
DockOutputSubmitted
DockOutputSatisfied
StageExecutorPatchApplied
StageResourcePatchApplied
StageExecutorActivated
OrderForked
HookStatusChanged
HookReady
TimerPoked
DeploymentRegistered
DeploymentCanaryMarked
DeploymentActivated
DeploymentDeprecated
DeploymentRetired
IdentityBindingRegistered
IdentityBindingRevoked
```

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
