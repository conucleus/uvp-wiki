# 协议主干

本页是上一版导航留下的协议主干入口。新的主导航已经把内容拆成
[核心概念](../core/README.md)、[核心组件](../components/README.md)、[秩序商店](../store/README.md) 和
[执行者与集成](../execution/README.md)。本页继续保留，作为从 DSL 到链上状态机的短路径索引。

协议主干回答一个问题：一份 Zhixu 协作定义如何变成可验证、可重放、可授权的链上状态机。

```text
Zhixu DSL
  -> nucleation id and design boundary
  -> deterministic HookPlan / OnchainHookPlan artifacts
  -> trust registry plan attestation
  -> UVPStateMachine plan/order registration
  -> order-level signal authorization
  -> wallet-bound signal submission
  -> HookReady / HookStatusChanged events
  -> replayable Product projection
```

## 阅读路径

| 页面 | 作用 |
| --- | --- |
| [核心概念](../concepts/overview.md) | 系统词表和最短协议路径。 |
| [Zhixu DSL](../concepts/core/zhixu.md) | 可复用协作规则书和可编译字段。 |
| [Nucleus / 凝结核](../concepts/core/nucleation.md) | Zhixu 的发起核、设计者和秩序组织者；`nucleation` 是字段和成核上下文。 |
| [Plan](../concepts/core/plan.md) | 静态、可认证、可注册的编译产物。 |
| [Order](../concepts/core/order.md) | 某个 Plan 的动态运行实例和可重放事件流。 |
| [Source 因果链](../concepts/core/source.md) | signal 如何按因果语境分叉、串联和交汇。 |
| [Signal](../concepts/core/signal.md) | 状态机接受的最小业务输入。 |
| [Hook](../concepts/core/hook.md) | readiness 和状态变化的条件表达式。 |
| [Trigger](../concepts/core/trigger.md) | 哪个 hook Ready 后正式打开执行入口。 |
| [File Resources](../concepts/core/file-resources.md) | stage 资源句柄和链下对象边界。 |

## 三条协议线

| 主线 | 页面 |
| --- | --- |
| 运行时语义 | [状态机](../concepts/state-machine.md)、[Hook 求值](../concepts/state-machine/evaluation.md)、[计时器与状态](../concepts/state-machine/timers-and-status.md)、[Stage Overlay](../concepts/state-machine/stage-overlay.md)、[事件 Replay](../concepts/state-machine/replay.md) |
| 确定性产物 | [产物与哈希](../concepts/artifacts-and-hashes.md)、[编译输入](../concepts/artifacts/compiler-input.md)、[Canonical Hash](../concepts/artifacts/canonical-hashes.md)、[链上注册参数](../concepts/artifacts/solidity-registration.md) |
| 信任与授权 | [信任与授权](../concepts/trust-and-authorization.md)、[Trust Domain](../concepts/trust/domains.md)、[Signal 授权](../concepts/trust/signal-authorization.md)、[EIP-712 与 Relayer](../concepts/trust/eip712-relayer.md)、[Stage Patch 授权](../concepts/trust/stage-patch.md) |

## 协议边界

- 合约与链事件决定 plan、order、signal、hook、attestation、deployment cutover 的真实状态。
- 后端、Store、Order App、executor-kit 和 periphery adapter 只能消费、投影、展示、中继或扩展核心状态。
- 业务文档、invoice、logistics、vehicle evidence 和 object bytes 不上链，只进入 hash、metadata URI 或私有存储。
- Relayer 可以提交交易和付 gas，但不能生成参与方业务签名。
- Funding、USDC、escrow、guarantee、settlement 和 AI/MCP agent 都是 adapter/periphery 语境，不属于状态机核心事实。
- `supplierType=zhixu` 是组合执行模式；local/linked order都必须回到各自 state-machine events 和 proof。
- Store 平台 workflow 不能替代凝结核内部治理，也不能替代 trust-domain 外部背书。
