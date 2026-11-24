---
title: Executor
type: explanation
audience: 协议读者
preread: ../README.md
status: verified
---

# Executor

> 前置阅读：[核心概念](../README.md)
Executor 是 DSL 里的角色词：某个订单运行时承接阶段、产生业务动作或提交 signal 的主体。它可以是一个人、企业系统、供应商派出的钱包、adapter、AI/MCP agent；对 dock 阶段来说，是另一条秩序在运行期选定的承接方。链上不存 executor 实体，只存 `stage -> supplierId` 指派与 `supplierId -> supplier account` 永久绑定。

Executor 要和 Supplier 分开：

| 对象 | 解决的问题 | 典型权威 |
| --- | --- | --- |
| Supplier | Store 目录中的现实主体及其链下能力资料。 | Store metadata + `UVPIdentityRegistry` supplier 命名空间的 SID/status。 |
| Executor | 当前订单、当前阶段实际由谁执行或提交 signal。 | `stage -> supplierId` 指派 + `UVPIdentityRegistry.accountOf(supplierId)` + EIP-712 签名。 |

Supplier 是能力主体和 trust subject；executor 是运行时角色。一个 SID 只绑定一个 supplier account 且永不轮换；需要换地址时注册新 SID 并把 zhixu/plan 显式迁到新 SID。

## 谁使用

凝结核在 stage 上声明静态 supplier 和 `selectedStages`；control stage 在运行中通过 stage supplier patch 选择目标 stage 的 supplier；dock 阶段的 supplier 由订单在挂接 stage 一次性选定。Product/Store/uvp-client 依据订单上的 supplier 指派路由任务、展示履约说明并组织签名提交。

## 产生什么结果

订单创建写入出生事实；stage supplier patch 产生 `StageSupplierPatchApplied`（首次指派路径另有 `StageSupplierAssigned`）；dock supplier 选择产生 `StageDockSupplierSelected`。assigned supplier account 的提交成为链上 signal/proof。

## 权威来自哪里

谁能提交 signal 只由 source 阶段当前生效的 assigned supplier account 与 EIP-712 签名决定；Supplier 的能力资料只是 Store 链下判断（见 [Supplier](supplier.md)），不构成提交权。

## Executor 怎么被选出来

```text
Supplier 在 Store 注册并由链上 registrar 激活 SID
  -> Store 维护 capability tags、联系方式、履约记录和 identity projection
  -> Zhixu stage 声明静态 supplier，或声明 supplierType: dock / 不写 executor（dynamic）
  -> PlanCommit 承诺 default/candidate supplier 绑定
  -> Order 创建后，selector stage 的 assigned supplier account 通过 stage supplier patch 指派目标 stage 的 SID
  -> 该 SID 的 supplier account 提交目标 stage 的业务 signal
```

Store 给凝结核和 operator 提供候选网络、联系能力和 proof 材料；链上 `stage -> supplierId` 指派、SID active 状态和 EIP-712 签名决定某个订单能否接受它提交的 signal。

## 静态 Supplier

秩序 DSL 的 `executor` 是计划里的静态默认配置。它表达“这个 stage 预期由哪类主体承接”。

```yaml
executor:
  supplierType: organization
  supplierID: 7c1d3f52-9a4b-4e68-8f20-3b5d7a9c1e40
```

plain 静态 supplier 必须带 `supplierID`，并会进入编译产物的 supplier route，帮助 Product API、Store、Order App 和 uvp-client 知道该阶段应当找谁、显示什么履约说明、需要什么资源或证据。route 是链下路由元数据；signal 是否可提交仍看 assigned supplier account 与签名。出生阶段只由静态 plain supplier 承接，且其 `stage -> SID` 指派终生不可变，不接受逐单 stage supplier patch。

## 动态 Stage Supplier Patch

某些 stage 的 supplier 在订单运行中由带有 selector binding 的 control stage 选择。control stage 必须在 `selectedStages` 里被授权选择目标 stage。

```yaml
selectedStages:
  - complete
sendSignals:
  - name: select_supplier
```

运行时会出现类似事件：

```text
StageSupplierAssigned(planId, orderId, targetStageId, supplierId, patchNonce)
StageSupplierPatchApplied(planId, orderId, selectorStageId, targetStageId, selector, supplierId, previousSupplierId, patchNonce)
```

stage supplier patch 只影响这个 Order，不修改 Plan。patch 的时序门按类别钉死：`previousSupplierId == 0` 的 assign 只在目标阶段首个信号之前，非零的 handoff 只在首信号之后（需原 assigned supplier account 对同一 digest 的签名）；candidate 阶段必须命中 Plan 通过 `supplierBindingsRoot` 承诺的 kind=1 叶（fixed 恒拒，dynamic 免 proof，birth/dock 恒拒）。patch 只改 `stage -> supplierId`，不写任何授权集，既有 Signal 事实保持不变。契约检查口径见 [Stage Overlay](../state-machine/stage-overlay.md)。

## Dock Supplier

`supplierType: dock` 的阶段由另一条秩序承接，supplier 身份在运行期确定：

- 订单在挂接 stage 经 stage patch 一次性选定 dock supplier（`selectStageDockSupplier` 或带 selector EIP-712 签名的 `selectStageDockSupplierFor`）；同一 dkid + supplier 重放幂等，换选被响亮拒绝，选中后固定。
- dock supplier 不进 Plan 级 supplier 路由与候选集；通用 stage supplier patch 不承载 dock 绑定。
- binding 由该 stage 的 `dock_link` 文件项确定——其值是 A 订单号（canonical `0x` 加 64 hex）；`pokeDockBinding` 在 A/B 时间窗交集时发射 B 侧输出信号，逐 output first-win。完整注册、选择、窗口与发射语义见 [Zhixu 作为 Executor](../apps/zhixu-as-executor.md) 与语言层正本 §7。

## UVP Client 的位置

`uvp-client` 是 Executor 的公共客户端，详见 [UVP Client](../apps/uvp-client.md)。按运行位置分四个入口：

- `headless`：私钥钱包测试、监听 `HookReady`、按 handler 路由并提交授权 signal、维护 watch 状态。
- `core`：构造/解码/提交 signal、validation 与 evidence hash 的共享实现。
- `browser`：宿主注入钱包时读取任务、签名 typed data 并读取 proof。
- `cli`：在终端运行 wallet/doctor/watch/signal。

UVP Client 可以帮助 executor 观察任务、生成 payload hash、签名、提交和诊断失败原因；它不创建订单授权、不托管默认私钥。
