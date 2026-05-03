# Plan

Plan 是某个 Zhixu 针对某条链编译出来的确定性产物。它不是 DSL 源文件，也不是某个订单。Plan 的职责是把静态秩序定义变成链上可注册、可认证、可求值的 artifact。

## 从 Zhixu 到 Plan

```text
Zhixu DSL
  -> HookPlanArtifact
  -> OnchainHookPlanArtifact
  -> registerPlan args
  -> planId / planHash
```

同一条 Zhixu，如果平台、版本、编译器、stage、hook、source、signal 或 selector binding 变化，都会得到不同的 plan identity 或 plan hash。

## Plan 里有什么

| 内容 | 说明 |
| --- | --- |
| `planId` | 计划身份，来自编译器、平台、版本、Zhixu ID 和名称。 |
| `planHash` | 链上 artifact 的哈希，被 trust registry 认证。 |
| `compiledHooks` | 编译后的 hook。 |
| `dependencyIndex` | `signalKey -> hookIds`，用于局部求值。 |
| `executorRoutes` | 阶段默认 executor/supplier 路由。 |
| `selectorBindings` | selector stage 到 target stage 的选择权绑定。 |
| resource defaults | stage-level `fileResources` 句柄，用于 Product/Store 展示和后续 resource overlay 解释。 |

## Plan 不是什么

- Plan 不是订单。它没有参与方提交记录、证据、HookReady 运行时状态或 active executor。
- Plan 不是 Store draft。Store 可以保存草稿和 review 状态，但 official 可用 claim 只来自 trust registry attestation。
- Plan 不是资源仓库。`fileResources` 是句柄和默认说明，业务文件明文不应进入链上 artifact。
- Plan 不是支付或结算系统。USDC、escrow、fiat bridge 只能作为 adapter 或 periphery workflow 消费 Plan/Order signal。

## 注册前要被背书

`UVPStateMachine.registerPlan()` 会检查 official trust domain 对 `(planId, planHash)` 的认证。如果 plan 没有被背书，或者已经撤销，不能作为有效计划注册。

这个边界对 Store 很重要：`approved_for_broadcast` 只是 Store workflow 状态；只有被 indexer 观察到的 `PlanAttested` 才能支撑 official trusted plan 的展示。

## Plan 不应被订单修改

Plan 是静态、可审计、被认证的版本。运行时变化，例如 executor 选择、resource manifest、业务 evidence、docked child order proof，都应进入 Order 的动态事件或 Product/Store workflow projection，而不是改 Plan。
