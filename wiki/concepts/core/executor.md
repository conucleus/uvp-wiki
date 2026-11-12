---
title: Executor
type: explanation
audience: 协议读者
preread: ../README.md
status: verified
---

# Executor

> 前置阅读：[核心概念](../README.md)
Executor 是某个订单运行时真正承接阶段、产生业务动作或提交 signal 的执行者。它可以是一个人、企业系统、供应商派出的钱包、adapter、AI/MCP agent；对 dock 阶段来说，执行者是另一条秩序在运行期选定的承接方。

Executor 要和 Supplier 分开：

| 对象 | 解决的问题 | 典型权威 |
| --- | --- | --- |
| Supplier | Store 目录中的现实主体及其链下能力资料。 | Store metadata + 可选 `UVPIdentityRegistry` 身份绑定。 |
| Executor | 当前订单、当前阶段实际由谁执行或提交 signal。 | `UVPStateMachine` 订单级显式授权、stage 执行者选择记录、EIP-712 签名。 |

Supplier 是能力主体和 trust subject；Executor 是运行时绑定和 signal submitter。一个 Supplier 可以派出多个 executor 钱包；一个 Executor 也可能代表一个 supplier、一个 adapter，或一条独立运行秩序的 dock 执行者。

## 谁使用

凝结核在 stage 上声明静态 executor 和 `selectedStages`；control stage 在运行中通过 executor patch 选择目标 stage 的 executor；dock 阶段的执行者由订单在挂接 stage 一次性选定。Product/Store/uvp-client 依据订单上的执行者记录路由任务、展示履约说明并组织签名提交。

## 产生什么结果

订单创建时写入订单级 signal 授权；executor patch 运行时产生 `StageExecutorPatchApplied` 与 `StageExecutorActivated`，patch 生效时为新执行者写入显式订单级授权集；dock 执行者选择产生 `StageDockExecutorSelected`。被授权的执行者提交成为链上 signal/proof。

## 权威来自哪里

谁能提交 signal 由订单级显式 `SignalAuthorization` 与 EIP-712 签名决定；Supplier 的能力资料只是 Store 链下判断（见 [Supplier](supplier.md)），不构成提交权。执行者记录只约束 patch 时序与路由，不代替提交授权。

## Executor 怎么被选出来

Executor 的生效路径通常是：

```text
Supplier 在秩序商店注册
  -> Store 维护 capability tags、联系方式、履约记录和 identity projection
  -> Registry operator 登记或撤销 supplier subject/account binding
  -> Zhixu stage 声明静态 executor，或声明 supplierType: dock 等待运行期选择
  -> Order 创建时写入订单级 signal authorization
  -> Control stage 可通过 executor patch 指定目标 stage 的 executor
  -> 新 executor 获得显式订单级授权后提交目标 stage 的业务 signal
```

Store 给凝结核和 operator 提供候选网络、联系能力和 proof 材料；链上订单级授权、执行者选择记录和 EIP-712 签名决定某个订单能否接受它提交的 signal。

## 静态 Executor

秩序 DSL 的 `executor` 是计划里的静态默认配置。它表达“这个 stage 预期由哪类主体承接”。

```yaml
executor:
  supplierType: organization
  supplierID: "{{ .customs_broker_uid }}"
```

plain 静态 executor 必须带 `supplierID`，并会进入编译产物的 executor route，帮助 Product API、Store、Order App 和 uvp-client 知道该阶段应当找谁、显示什么履约说明、需要什么资源或证据。route 是链下路由元数据；signal 是否可提交仍看订单级显式授权与签名。出生阶段只由静态 plain executor 承接，且其执行者终生不可变，不接受逐单 executor patch。

## 动态 executor patch

某些 stage 的 executor 在订单运行中由带有 selector binding 的 control stage 选择。control stage 必须在 `selectedStages` 里被授权选择目标 stage。

```yaml
selectedStages:
  - complete
sendSignals:
  - name: select_executor
```

运行时会出现类似事件：

```text
StageExecutorPatchApplied(orderId, selectorStageId, targetStageId, planId, selector, executor, mode, authorizationsHash, ...)
StageExecutorActivated(planId, orderId, targetStageId, executor, role, metadataHash, patchNonce, metadataURI)
```

executor patch 只影响这个 Order，不修改 Plan。patch 的时序门按类别钉死：`assign` 只在目标阶段首个信号之前，`handoff` 只在首信号之后（需原执行者对同一 digest 的签名）；逐单变更目标必须命中 Plan 在 `commitPlan` 时承诺的 `executorCandidatesRoot`（没有候选集的 Plan 对 executor patch fail-closed）。patch 生效时为新执行者写入显式订单级授权集（覆盖 `authorizationsHash`），因此运行时才出现的钱包也能被选择；既有显式授权不会因后续 patch 被撤销，既有 Signal 事实保持不变。契约检查口径见 [Stage Overlay](../state-machine/stage-overlay.md)。

## Dock 执行者

`supplierType: dock` 的阶段由另一条秩序承接，执行者身份在运行期确定：

- 订单在挂接 stage 经 stage patch 一次性选定 dock 执行者（`selectStageDockExecutor` 或带 selector EIP-712 签名的 `selectStageDockExecutorFor`）；同一 dkid + executor 重放幂等，换选被响亮拒绝，选中后固定。
- dock 执行者不进 Plan 级执行者路由与候选集；通用 executor patch 不承载 dock 绑定。
- binding 由该 stage 的 `dock_link` 文件项确定——其值是 A 订单号（canonical `0x` 加 64 hex）；`pokeDockBinding` 在 A/B 时间窗交集时发射 B 侧输出信号，逐 output first-win。完整注册、选择、窗口与发射语义见 [Zhixu 作为 Executor](../apps/zhixu-as-executor.md) 与语言层正本 §7。

## UVP Client 的位置

`uvp-client` 是 Executor 的公共客户端，详见 [UVP Client](../apps/uvp-client.md)。按运行位置分四个入口：

- `headless`：私钥钱包测试、监听 `HookReady`、按 handler 路由并提交授权 signal、维护 watch 状态。
- `core`：构造/解码/提交 signal、validation 与 evidence hash 的共享实现。
- `browser`：宿主注入钱包时读取 Product V3 任务、签名 typed data 并读取 proof。
- `cli`：在终端运行 wallet/doctor/watch/signal。

UVP Client 可以帮助 executor 观察任务、生成 payload hash、签名、提交和诊断失败原因；它不创建订单授权、不托管默认私钥。
