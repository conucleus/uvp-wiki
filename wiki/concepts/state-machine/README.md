---
title: 状态机
type: meta
audience: 协议读者
preread: ../lifecycle.md
status: verified
---

# 状态机

> 前置阅读：[Plan 与订单生命周期](../lifecycle.md)
状态机是 UVP 的核心链上执行层与事件源：`UVPStateMachine.sol` 接收 assigned supplier account 提交的 signal，按 Plan 的依赖索引找到受影响 hook，执行 stack machine 求值，然后发出 `HookStatusChanged`、`HookReady` 或 timer 相关事件；ETH runtime authority 是部署的合约，本组页面解释其运行时语义。

## 组件职责

| 组件 | 职责 |
| --- | --- |
| `UVPStateMachine` | 签名提交并冻结 Plan、注册 Order、保存 signal records、求值 hooks、发出 `HookReady`、处理 stage supplier patch 与阶段文件写入。 |
| `UVPIdentityRegistry` | 唯一链上身份边界：subject/account 绑定与 supplier capability/account 命名空间；supplier 命名空间是执行授权来源。 |
| `UVPDeploymentRegistry` | 记录部署 cutover 和 release/deployment 线索。 |
| statemachine package | reference transition model 和 replay tests，用来防止服务投影偏离合约语义。 |
| 可重建服务层 / chain-services replay | 从链事件重建 Product order/task/proof/identity projection。 |

组件与 Registry 的合约层细节另见 [Contracts 与 Registries](../contracts-and-registries.md)。

## 本篇子项

| 子页 | 说明 |
| --- | --- |
| [Hook 求值](evaluation.md) | compact hook instruction 如何求值，`submitSignal()` 的去重与授权检查。 |
| [计时器与状态](timers-and-status.md) | hook 状态、`dueAt`、`pokeTimer()` 和一次性 `HookReady`。 |
| [Stage Overlay：Supplier Patch 与阶段文件写入](stage-overlay.md) | stage supplier patch 与阶段文件写入如何在订单级覆盖计划（索引页）。 |
| [Stage Supplier Patch](executor-patch.md) | 订单级 supplier 选择与交接。 |
| [阶段文件写入](file-patch.md) | 订单级 `StageFile{key,payload}` 写入、覆盖、事件与回放。 |
| [Dock 与 Binding](docking.md) | 静态 Dock 声明、dock supplier 选择、`dock_link` binding 与 A/B 窗口 poke 发射如何落到状态机事件。 |
| [事件 Replay](replay.md) | reference reducer 如何用链事件复算状态并校验合约输出。 |

原速查条目去向：`commitPlan()` / `finalizePlan()` 两步注册见[生命周期](../lifecycle.md)与[链上注册参数](../artifacts/solidity-registration.md)；出生入口与 assigned supplier 发信权见 [出生信号与订单入口](../core/trigger.md) 与 [EIP-712 与 Relayer](../trust/eip712-relayer.md)。
