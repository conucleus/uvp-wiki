# Executor

Executor 是某个订单运行时真正承接阶段、产生业务动作或提交 signal 的执行者。它可以是一个人、企业系统、供应商派出的钱包、adapter、AI/MCP agent，也可以是一条独立的 Zhixu 秩序。

Executor 要和 Supplier 分开：

| 对象 | 解决的问题 | 典型权威 |
| --- | --- | --- |
| Supplier | 谁具备某类现实履约能力，是否被 trust registry 背书。 | Store metadata + `ZhixuTrustRegistry` supplier attestation。 |
| Executor | 当前订单、当前阶段实际由谁执行或提交 signal。 | `UVPStateMachine` order authorization、stage executor overlay、EIP-712 签名。 |

Supplier 是能力主体和 trust subject；Executor 是运行时绑定和 signal submitter。一个 Supplier 可以派出多个 executor 钱包；一个 Executor 也可能代表一个 supplier、一个 adapter，或一条可独立运行的 Zhixu。

## Executor 怎么被选出来

Executor 的生效路径通常是：

```text
Supplier 在秩序商店注册
  -> Store 维护 capability tags、联系方式、履约记录和 trust projection
  -> Trust registry 对 supplier subject 做 attestation/revocation
  -> Zhixu stage 声明需要某类 executor 或 supplier
  -> Order 注册时写入 order-level signal authorization
  -> Control stage 可通过 executor patch 指定 active executor
  -> active executor 才能提交目标 stage 的业务 signal
```

Store 给凝结核和 operator 提供候选网络、联系能力和 proof 材料；链上 stage binding、订单级授权、active executor overlay 和 EIP-712 签名决定某个订单能否接受它提交的 signal。

## 静态 Executor

秩序 DSL 的 `executor` 是计划里的静态默认配置。它表达“这个 stage 预期由哪类主体承接”。当前订单的钱包提交权由 order authorization 和 active executor overlay 决定。

```yaml
executor:
  supplierType: organization
  supplierID: "{{ .customs_broker_uid }}"
```

静态 executor 会进入编译产物的 executor route，帮助 Product API、Store、Order App 和 executor-kit 知道该阶段应当找谁、显示什么履约说明、需要什么资源或证据。但 signal 是否可提交，仍要看订单注册授权和运行时 overlay。

## 动态 Active Executor

某些 stage 的 executor 在订单运行中由带有 `stage_executor_patch` 能力的 control stage 选择。control stage 必须在 `selectedStages` 里被授权选择目标 stage。

```yaml
selectedStages:
  - customs.complete
sendSignals:
  - select_executor
```

运行时会出现类似事件：

```text
StageExecutorPatchApplied(orderId, selectorStageId, targetStageId, selector, executor, ...)
StageExecutorActivated(orderId, targetStageId, executor, ...)
```

active executor overlay 只影响这个 Order，不修改 Plan。目标 stage 一旦有 active executor，后续该 stage 的业务 signal 必须由 active executor 提交；即使另一个钱包原本有 signal 授权，合约也会按 overlay 拒绝错误 submitter。

## Zhixu 也可以是 Executor

一条 Zhixu 可以作为另一条 Zhixu 的 stage executor。它接收本地秩序开放的执行接口，按自己的 plan、授权和 proof 路径运行，再通过 `signalMap` 把约定信号映射回本地秩序。

典型例子是跨境供货：

- 本地采购秩序负责需求确认、寻源、付款路径、物流和验收。
- 结算 stage 可以选择 `payment-settlement` 这条 Zhixu 作为 executor。
- `payment-settlement` 内部的 `fiat_bridge` stage 又可以选择 `fiat-payout-bridge` 这条 Zhixu 作为 executor。

本地 stage 的写法是：

```yaml
executor:
  supplierType: zhixu
  supplierID: "{{ .fiat_payout_bridge_zhixu_uid }}"
  zhixuExecutorConfig:
    signalMap:
      str: fiat_bridge::payout.start.str
      cmp: fiat_bridge::payout.close.cmp
      err: fiat_bridge::payout.close.err
```

这表达的是：

1. local Plan 声明这个 stage 的 executor 类型是 `zhixu`。
2. `supplierID` 指向 Store/Trust Registry 可以识别的 peer Zhixu 或其 supplier subject。
3. `signalMap` 声明 local stage 如何等待或解释 linked Zhixu 输出信号。
4. 编译器会为 `signalMap` 生成 `kind=signalMap` hook，`str` 和 `cmp` 必须存在，且同一个 signalMap 必须引用同一个 source。
5. linked 秩序的创建、通知、proof 校验和 local signal 映射由 Store/Product/adapter/executor-kit 工作流组织。
6. 运行态对接可以落到 `linkDockedOrder`、`DockedOrderLinked`、`DockedSignalMapped`、`submitDockedSignal`、`DockedSignalSubmitted`。
7. local order 和 linked order 各自以自己的 `UVPStateMachine` 事件为事实源。

Docked Zhixu 的工程模型是：linked 秩序独立运行，Store/Product 或 adapter 观察 linked proof，再用链上 docking link 和授权 signal 映射推动 local order。这个桥接动作留下 local order 上的 signal proof。

## Docked Zhixu 的运行时路径

```text
local order 某个 trigger hook Ready
  -> Product/Store 创建 local stage task
  -> Store 选择或确认 peer Zhixu 版本
  -> Product/adapter 注册或定位 linked order
  -> linked order 按自己的 Plan、授权、executor 执行
  -> linked order 产生 str/cmp/err proof
  -> adapter 或 Product workflow 校验 proof 和 signalMap
  -> linkDockedOrder / submitDockedSignal 或授权 submitter 映射 local signal
  -> local order 对应 hook Ready / Cancelled / next stage
```

这里可以出现两个编号体系：

- 链上 local `orderId` 和 linked `orderId` 由各自的 trigger order 入口创建。
- Product task、Store docking session、adapter job 可以有自己的执行编号；运行态 proof 仍回到链上 order/signal/docking events。

## signalMap 的协议含义

`signalMap` 是 local stage 接受 linked Zhixu 输出的语义契约。

| 字段 | 语义 |
| --- | --- |
| `str` | linked Zhixu 开始或已接收委托的信号。当前 compiler 要求必须存在。 |
| `cmp` | linked Zhixu 完成的信号。当前 compiler 要求必须存在。 |
| `err` | linked Zhixu 失败、拒绝或异常的信号。可选但大多数真实 workflow 应配置。 |

编译器会校验 `signalMap` 表达式能被 hook-core 解析，并校验引用的本地 stage/signal 是否存在。

## Executor Kit 的位置

`uvp-executor-kit` 是 Executor 的集成工具箱，详见 [Executor Kit](../../execution/executor-kit.md)。它有两个同等重要的入口：

- Chain-native：监听 `HookReady`，按 handler 路由并提交授权 signal。
- Product API：读取 task/signal container，准备证据、签名、提交并读取 proof。

Executor Kit 可以帮助 executor 观察任务、生成 payload hash、签名、提交和诊断 blocked reason。
