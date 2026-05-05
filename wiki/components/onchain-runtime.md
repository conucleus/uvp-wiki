# 链上执行、State Machine 与 Replay

链上执行与 Replay 围绕 `UVPStateMachine` 展开。这里覆盖 contracts、registries、state machine runtime、stage overlay、timer 和事件重放。

## 组件链路

```text
ZhixuTrustRegistry attests plan/supplier
  -> UVPStateMachine registers plan/order/authorization
  -> authorized wallets submit signals or stage patches
  -> contract emits status and readiness events
  -> statemachine / Chain Services replay events
```

## 组件职责

| 组件 | 职责 |
| --- | --- |
| `UVPStateMachine` | 注册 plan/order、保存 signal records、求值 hooks、发出 `HookReady`、处理 executor/resource overlay。 |
| `ZhixuTrustRegistry` | trust registry、plan attestation/revocation、supplier attestation/revocation。 |
| `UVPDeploymentRegistry` | 记录部署 cutover 和 release/deployment 线索。 |
| statemachine package | reference transition model 和 replay tests，用来防止服务投影偏离合约语义。 |
| 可重建服务层 / chain-services replay | 从链事件重建 Product order/task/proof/trust projection。 |

## 阅读路径

| 页面 | 作用 |
| --- | --- |
| [Contracts 与 Registries](../concepts/architecture/components/contracts-registries.md) | `UVPStateMachine`、`ZhixuTrustRegistry`、`UVPDeploymentRegistry` 的职责。 |
| [状态机](../concepts/state-machine.md) | 合约保存 signal、hook runtime、timer 和 order state 的方式。 |
| [Hook 求值](../concepts/state-machine/evaluation.md) | compact hook instruction 如何求值。 |
| [计时器与状态](../concepts/state-machine/timers-and-status.md) | timer、Wait/Ready/Cancelled 状态和产品展示。 |
| [Stage Overlay：Executor Patch 与 Resource Patch](../concepts/state-machine/stage-overlay.md) | executor patch 和 resource patch 如何影响单个订单而不改 Plan。 |
| [Docked Zhixu Runtime](../concepts/state-machine/docking.md) | local/linked order、docking link、mapped signal 和 docking proof 如何落到状态机事件。 |
| [事件 Replay](../concepts/state-machine/replay.md) | reference reducer 如何从链事件复算状态。 |

## 状态机所在层级

状态机是核心组件：它是链上执行环境和事件源的一部分。核心概念页解释 Signal、Hook、Order 这些对象；状态机页面说明 contracts、registries、replay oracle 和可重建服务层投影如何围绕同一组事件工作。

## 运行时语义速查

- `registerPlan()` 检查 publisher 权限、plan 非空、未重复；plan/supplier trust 由产品配置的 registry 投影表达，不是状态机前置条件。
- `triggerOrderFromOutsideFor()` / `triggerOrderFromSignalFor()` 绑定 `orderId` 和 `planId`，记录 trigger fact 或 parent link，并可同时写入 order-level signal authorizations。
- `submitSignal()` 按 `(orderId, sourceId, signalId)` 去重，并检查授权 submitter 和 active executor overlay。
- `HookReady` 只在 `trigger=true` 的 hook 第一次 Ready 时发出。
- `StageExecutorPatchApplied` / `StageExecutorActivated` 只改变单个订单的 target stage executor，不改 Plan。
- `StageResourcePatchApplied` 只改变单个订单的 resource reference，不应与 executor patch 混用。
- `DockedOrderLinked` / `DockedSignalMapped` / `DockedSignalSubmitted` 记录 local order 与 linked order 的对接关系和 mapped signal proof。

## 运行时边界

- Chain Services projection 从事件重建 signal 和 hook truth。
- Store review 进入 workflow/audit；plan/supplier attestation 来自 trust registry。
- Relayer 广播已签名交易；业务签名来自授权参与方。
- Chain replay oracle 只校验事件语义；ETH runtime authority 是部署的合约。
- Docking relation metadata 组织 workflow；local order 继续推进需要授权 mapped signal 或 `DockedSignalSubmitted`。
