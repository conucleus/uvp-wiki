---
title: Plan
type: explanation
audience: 协议读者
preread: ../README.md
status: verified
---

# Plan

> 前置阅读：[核心概念](../README.md)
Plan 是 Zhixu 针对某条链编译出的不可变运行规则。它只承载状态机必须知道的 hooks、dependency keys、selector bindings、signal capabilities、file-writer capability 叶和 supplier 绑定（default/candidate）；供应商能力、推荐标签、履约材料与撮合逻辑不属于 Plan。

## 谁使用

publisher 签名发布 Plan；registrar 基于已 finalized 的 Plan 创建 Order；Store 把 Plan 版本组织成材料审核和 active version 展示；状态机只按 Plan 内的 hooks 和 metadata 执行。

## 产生什么结果

一次成功的发布产生 `planHash`、`planId` 和永久冻结的链上 hooks、`capabilitiesRoot` 与 `supplierBindingsRoot` 承诺；之后每个 Order 都引用这个不可变身份，规则变化只能通过发布新 Plan 表达。

## 权威来自哪里

Plan 的权威来自 publisher 的 EIP-712 签名、两步注册的 hash 校验和 module 冻结后的合约代码；编译器 artifact 只用于追溯源产物。协议分层与组件关系见 [Architecture](../architecture.md)。

## 身份与哈希（速查）

```text
hooksHash              = keccak256(abi.encode(hooks))
capabilitiesRoot       = 两张能力表（signal capability + selector binding）的单棵 Merkle root
supplierBindingsRoot   = default/candidate (stageId, supplierId, kind) 绑定的单棵 Merkle root
fileWritersHash        = keccak256(abi.encode(StageFileWriter[]))
planHash               = keccak256(abi.encode(
                           keccak256("uvp.plan.runtime.v8"),  // domain
                           hooksHash,
                           capabilitiesRoot,
                           supplierBindingsRoot,
                           fileWritersHash))
planId                 = keccak256(abi.encode(
                           keccak256("uvp.plan.id.v1"),       // domain
                           publisher,
                           planHash))
```

`planHash` 的 preimage 是四元组：hooks、能力树根、supplier 绑定树根与 file-writer 名单哈希。能力表为空时 `capabilitiesRoot` 为 `keccak256("")`；supplier 绑定为空时 `supplierBindingsRoot` 同样按 `keccak256("")` 参与计算；空 `StageFileWriter[]` 的 `fileWritersHash` 是空数组 ABI 编码的 keccak，不套用空树根。supplier route 与 resources hash 是链下调度的路由元数据（进入产物本体但不进链上 runtime `planHash`）；叶公式与树规则见 [Canonical Hash](../artifacts/canonical-hashes.md)。编译器自己的 artifact hash 继续用于追溯源产物，但不冒充链上 `planHash`。把 publisher 放进 `planId`，可以避免不同发布者对同一内容争抢全局名字。

## 两步凝固

1. publisher 对六字段 PlanCommit（`publisher + hooksHash + capabilitiesRoot + supplierBindingsRoot + fileWritersHash + deadline`）做 EIP-712 签名；任意 relayer 调用 `commitPlan`，同时提交完整 hooks、`StageSupplierBinding[]` 与 `StageFileWriter[]`。`fileWritersHash` 与 `supplierBindingsRoot` 都由合约重算校验；`fileWriters` 不生成 capability 叶。
2. 任意调用者调用 `finalizePlan(planId)` 定稿（permissionless）；本步只落定稿，不提交表数据。

pending Plan 不能创建 Order。finalized 后 hooks、`capabilitiesRoot`、`supplierBindingsRoot` 与 `fileWritersHash` 都不能修改；如果规则变化，发布新的 Plan。

## Module 冻结

StateMachine 部署并配置七个 module（stage patch、derived signal、dock registry、plan metadata、lens、file resource、identity registry）后调用 `freezeModules()`。冻结后的 module 地址不能由 owner 更换，因此“代码含义”不依赖部署者日后的善意。新实现只能通过新的 StateMachine deployment 和显式 cutover 引入。各合约与 registry 的职责分工见 [Contracts and Registries](../contracts-and-registries.md)。

## 不承担的责任

- Plan 不声明哪个公司“有能力”履约。
- Plan 不替 Store 做搜索、推荐和撮合。
- Plan 不保存文件明文、联系人或现实名称。
- 订单运行时的 executor/文件映射变化进入订单级记录，不回写 Plan。
