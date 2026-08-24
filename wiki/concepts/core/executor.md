---
title: Executor
type: explanation
audience: 协议读者
preread: README.md
status: verified
---

# Executor

Executor 是某个订单运行时真正承接阶段、产生业务动作或提交 signal 的执行者。它可以是一个人、企业系统、供应商派出的钱包、adapter、AI/MCP agent，也可以是一条独立的 Zhixu 秩序。

Executor 要和 Supplier 分开：

| 对象 | 解决的问题 | 典型权威 |
| --- | --- | --- |
| Supplier | Store 目录中的现实主体及其链下能力资料。 | Store metadata + 可选 `UVPIdentityRegistry` 身份绑定。 |
| Executor | 当前订单、当前阶段实际由谁执行或提交 signal。 | `UVPStateMachine` order authorization、stage executor overlay、EIP-712 签名。 |

Supplier 是能力主体和 trust subject；Executor 是运行时绑定和 signal submitter。一个 Supplier 可以派出多个 executor 钱包；一个 Executor 也可能代表一个 supplier、一个 adapter，或一条可独立运行的 Zhixu。

## 谁使用

凝结核在 stage 上声明静态 executor 和 `selectedStages`；control stage 在运行中通过 executor patch 选择 active executor；Product/Store/executor-kit 依据 active executor 路由任务、展示履约说明并组织签名提交。

## 产生什么结果

订单注册时写入 order-level signal authorization；executor patch 运行时产生 `StageExecutorPatchApplied` 和 `StageExecutorActivated`，把 Plan 预声明的 signal capability 委任给当前钱包；active executor 的提交成为链上 signal/proof。

## 权威来自哪里

谁能提交 signal 由 `UVPStateMachine` order authorization、stage executor overlay 和 EIP-712 签名决定；Supplier 的能力资料只是 Store 链下判断（见 [Supplier](supplier.md)），不构成提交权。

## Executor 怎么被选出来

Executor 的生效路径通常是：

```text
Supplier 在秩序商店注册
  -> Store 维护 capability tags、联系方式、履约记录和 identity projection
  -> Registry operator 登记或撤销 supplier subject/account binding
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

active executor overlay 只影响这个 Order，不修改 Plan。Patch 会把 Plan 从目标 stage `sendSignals` 编译出的 current-order signal capability 自动委任给 active executor，因此运行时才出现的钱包也能被选择；它只能提交 Plan 预声明的 signal，不能借 patch 扩张能力范围。换人只影响尚未首次写入的 Signal，既有事实不变。

## Zhixu 也可以是 Executor

一条 Zhixu 可以作为另一条 Zhixu 的 stage executor：它接收本地秩序开放的执行接口，按自己的 plan、授权和 proof 路径运行，再通过 `signalMap` 把约定信号映射回本地秩序。典型例子是跨境供货里结算 stage 选择 `payment-settlement`，其内部又可以选择 `fiat-payout-bridge` 作为 executor。完整模型、DSL 写法和约束见 [Zhixu 作为 Executor](../apps/zhixu-as-executor.md)。

## Docked Zhixu 的运行时路径

Docked 运行的骨架是：local trigger Ready 后启动对接 workflow，linked order 独立执行并产生 str/cmp/err proof，校验通过后由 `linkDockedOrder`/`submitDockedSignal` 或授权 submitter 映射回 local signal。链上 orderId 与 Product/Store/adapter 工作流编号可以并存，运行态 proof 仍回到链上事件；详细路径见 [Zhixu 作为 Executor](../apps/zhixu-as-executor.md)。

## signalMap 的协议含义

`signalMap` 是 local stage 接受 linked Zhixu 输出的语义契约：`str` 与 `cmp` 为 compiler 必填，`err` 可选但建议配置，且同一个 signalMap 必须引用同一个 source。字段级语义表与编译器校验规则见 [Zhixu 作为 Executor](../apps/zhixu-as-executor.md)。

## Executor Kit 的位置

`uvp-executor-kit` 是 Executor 的集成工具箱，详见 [Executor Kit](../apps/executor-kit.md)。它有两个同等重要的入口：

- Chain-native：监听 `HookReady`，按 handler 路由并提交授权 signal。
- Product API：读取 task/signal container，准备证据、签名、提交并读取 proof。

Executor Kit 可以帮助 executor 观察任务、生成 payload hash、签名、提交和诊断 blocked reason。
