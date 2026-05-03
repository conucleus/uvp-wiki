# Plan

Plan 是某个秩序 (Zhixu) 针对某条链编译出来的确定性产物。它把静态秩序定义变成链上可注册、可认证、可求值的 artifact，也就是“这个秩序版本在 EVM 上如何运行”。

## 从 Zhixu 到 Plan

```text
秩序 (Zhixu) DSL
  -> HookPlanArtifact
  -> OnchainHookPlanArtifact
  -> registerPlan args
  -> planId / planHash
```

同一条秩序，如果平台、版本、编译器、stage、hook、source、signal 或 selector binding 变化，都会得到不同的 plan identity 或 plan hash。

## Plan 里有什么

| 内容 | 说明 |
| --- | --- |
| `planId` | 计划身份，来自编译器、平台、版本、Zhixu ID 和名称。 |
| `planHash` | 链上 artifact 的哈希，被 trust registry 认证。 |
| `compiledHooks` | 编译后的 hook。 |
| `dependencyIndex` | `signalKey -> hookIds`，用于局部求值。 |
| `executorRoutes` | 阶段默认 executor/supplier 路由。 |
| `selectorBindings` | stage 到 target stage 的 executor patch 绑定。字段名保留 selector 是 wire/API 兼容名。 |
| resource defaults | stage-level `fileResources` 句柄，用于 Product/Store 展示和后续 resource overlay 解释。 |

## 职责边界

- 订单运行态进入 Order：参与方提交记录、证据、HookReady runtime 和 active executor 都属于订单事件。
- Store draft 和 review 状态属于 Store workflow；official 可用 claim 来自 trust registry attestation。
- `fileResources` 是句柄和默认说明；业务文件明文留在链下。
- USDC、escrow、fiat bridge 作为 adapter 或 periphery workflow 消费 Plan/Order signal。

## 注册前要被背书

`UVPStateMachine.registerPlan()` 会检查 official trust domain 对 `(planId, planHash)` 的认证。只有当前仍被背书的 plan 才能作为有效计划注册。

这个边界对 Store 很重要：`approved_for_broadcast` 只是 Store workflow 状态；只有被 indexer 观察到的 `PlanAttested` 才能支撑 official trusted plan 的展示。

## Plan 不应被订单修改

Plan 是静态、可审计、被认证的版本。运行时变化，例如 executor 选择、resource manifest、业务 evidence、docked linked order proof，都进入 Order 的动态事件或 Product/Store workflow projection；Plan 继续代表原始静态版本。
