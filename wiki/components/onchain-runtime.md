# 链上执行、State Machine 与 Replay

链上执行与 Replay 是状态机应该所在的位置。这里覆盖 contracts、registries、state machine runtime、stage overlay、timer 和事件重放。

## 组件链路

```text
ZhixuTrustRegistry attests plan/supplier
  -> UVPStateMachine registers plan/order/authorization
  -> authorized wallets submit signals or stage patches
  -> contract emits status and readiness events
  -> statemachine / non-trusted execution replay events
```

## 组件职责

| 组件 | 职责 |
| --- | --- |
| `UVPStateMachine` | 注册 plan/order、保存 signal records、求值 hooks、发出 `HookReady`、处理 executor/resource overlay。 |
| `ZhixuTrustRegistry` | trust domain、plan attestation/revocation、supplier attestation/revocation。 |
| `UVPDeploymentRegistry` | 记录部署 cutover 和 release/deployment 线索。 |
| statemachine package | reference transition model 和 replay tests，用来防止服务投影偏离合约语义。 |
| 非可信执行层 / chain-services replay | 从链事件重建 Product order/task/proof/trust projection。 |

## 先读这些

| 页面 | 作用 |
| --- | --- |
| [Contracts 与 Registries](../concepts/architecture/components/contracts-registries.md) | `UVPStateMachine`、`ZhixuTrustRegistry`、`UVPDeploymentRegistry` 的职责。 |
| [状态机](../concepts/state-machine.md) | 合约保存 signal、hook runtime、timer 和 order state 的方式。 |
| [Hook 求值](../concepts/state-machine/evaluation.md) | compact hook instruction 如何求值。 |
| [计时器与状态](../concepts/state-machine/timers-and-status.md) | timer、Wait/Ready/Cancelled 状态和产品展示。 |
| [Stage Overlay](../concepts/state-machine/stage-overlay.md) | executor/resource patch 如何影响单个订单而不改 Plan。 |
| [事件 Replay](../concepts/state-machine/replay.md) | reference reducer 如何从链事件复算状态。 |

## 状态机所在层级

状态机是核心组件：它是链上执行环境和事件源的一部分。核心概念页可以解释 Signal、Hook、Order 这些对象，但状态机本身应该和 contracts、registries、replay oracle、非可信执行层投影放在同一条组件链路里。

## 运行时语义速查

- `registerPlan()` 检查 publisher 权限、plan 非空、未重复、official trust domain 对 `(planId, planHash)` 的 attestation。
- `registerOrder()` 绑定 `orderId` 和 `planId`，初始化 hook runtime，并可同时写入 order-level signal authorizations。
- `submitSignal()` 按 `(orderId, sourceId, signalId)` 去重，并检查授权 submitter 和 active executor overlay。
- `HookReady` 只在 `trigger=true` 的 hook 第一次 Ready 时发出。
- `StageExecutorPatchApplied` / `StageExecutorActivated` 只改变单个订单的 target stage executor，不改 Plan。
- `StageResourcePatchApplied` 只改变单个订单的 resource reference，不应与 executor patch 混用。

## 运行时边界

- 非可信执行层 projection 从事件重建 signal 和 hook truth。
- Store review 进入 workflow/audit；plan/supplier attestation 来自 trust registry。
- Relayer 广播已签名交易；业务签名来自授权参与方。
- Runtime-host 是 reference harness；ETH runtime authority 是部署的合约。
- Docking relation metadata 组织 workflow；local order 继续推进需要授权 mapped signal 或 `DockedSignalSubmitted`。
