---
title: 状态机
type: meta
audience: 协议读者
preread: concepts/lifecycle.md
status: verified
---

# 状态机

状态机是 UVP 的核心链上执行层与事件源：`UVPStateMachine.sol` 接收已授权钱包提交的 signal，按 Plan 的依赖索引找到受影响 hook，执行 stack machine 求值，然后发出 `HookStatusChanged`、`HookReady` 或 timer 相关事件；ETH runtime authority 是部署的合约，本组页面解释其运行时语义。

## 组件职责

| 组件 | 职责 |
| --- | --- |
| `UVPStateMachine` | 签名提交并冻结 Plan、注册 Order、保存 signal records、求值 hooks、发出 `HookReady`、处理 executor/resource overlay。 |
| `UVPIdentityRegistry` | Store 运营的薄身份目录，只记录主体与钱包绑定及按 binding 撤销。 |
| `UVPDeploymentRegistry` | 记录部署 cutover 和 release/deployment 线索。 |
| statemachine package | reference transition model 和 replay tests，用来防止服务投影偏离合约语义。 |
| 可重建服务层 / chain-services replay | 从链事件重建 Product order/task/proof/identity projection。 |

组件与 Registry 的合约层细节另见 [Contracts 与 Registries](../contracts-and-registries.md)。

## 本篇子项

| 子页 | 说明 |
| --- | --- |
| [Hook 求值](evaluation.md) | compact hook instruction 如何求值，`submitSignal()` 的去重与授权检查。 |
| [计时器与状态](timers-and-status.md) | hook 状态、`dueAt`、`pokeTimer()` 和一次性 `HookReady`。 |
| [Stage Overlay：Executor Patch 与 Resource Patch](stage-overlay.md) | executor patch、resource patch 如何在订单级覆盖计划（索引页）。 |
| [Executor Patch](executor-patch.md) | 订单级执行者选择、交接与替换。 |
| [Resource Patch](resource-patch.md) | 订单级资源 manifest 覆盖。 |
| [Docked Zhixu Runtime](docking.md) | local order、linked order、docking link 和 mapped signal 如何落到状态机事件。 |
| [事件 Replay](replay.md) | reference reducer 如何用链事件复算状态并校验合约输出。 |

原速查条目去向：`commitPlan()` / `finalizePlan()` 两步注册见[生命周期](../lifecycle.md)与[链上注册参数](../artifacts/solidity-registration.md)；trigger 入口与订单级授权见 [Signal 授权](../trust/signal-authorization.md)。
