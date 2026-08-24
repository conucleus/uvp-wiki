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
| `UVPDeploymentRegistry` | versioned state-machine deployment cutover ledger。 |
| `ECDSA` | minimal signature recovery helper。 |
| `UVPSignatures` | relayed state-machine signal submission shared signature structs。 |

## Public Interface

`UVPStateMachine` public boundary 包括：

- constructor args；
- module 配置与一次 `freezeModules`；
- signed `commitPlan` 与一次 `finalizePlan`；
- signed `triggerOrderFromOutsideFor` / `triggerOrderFromSignalFor`；
- `submitSignal`；
- `submitSignalFor`；
- `linkDockedOrder` / `linkDockedOrderFor`；
- `submitDockedSignal`；
- `applyStageExecutorPatch` / `applyStageExecutorPatchFor`；
- `applyStageResourcePatch` / `applyStageResourcePatchFor`；
- EIP-712 digest helpers；
- `DOMAIN_SEPARATOR`；
- `pokeTimer`；
- order/plan/hook/status/signal authorization view helpers；
- stage overlay view helpers；
- event topics、function selectors、ABI hash、bytecode hash。

改变这些内容必须更新 fixture 并审查 adapter。

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
SignalSubmitted
DockedOrderLinked
DockedSignalMapped
DockedSignalSubmitted
StageExecutorPatchApplied
StageResourcePatchApplied
StageExecutorActivated
StageExecutorSignalDelegated
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

当前合约模块的 core boundary 聚焦 state machine、薄身份 registry 和 deployment registry。funding、escrow、custody、settlement、release、refund、dispute-payment、ERC20 或 USDC 合约属于 adapter/periphery 工作；未来资金相关工作必须有独立的 authorization、event mapping、tests 和 PRD，并消费 `UVPStateMachine` signal。完整边界见 [协议边界：外围适配](../concepts/protocol-boundaries.md#外围适配)。
