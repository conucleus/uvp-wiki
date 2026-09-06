---
title: Plan
type: explanation
audience: 协议读者
preread: ../README.md
status: verified
---

# Plan

> 前置阅读：[核心概念](../README.md)
Plan 是 Zhixu 针对某条链编译出的不可变运行规则。它只承载状态机必须知道的 hooks、dependency keys、selector bindings 和 signal capabilities；供应商能力、推荐标签、履约材料与撮合逻辑不属于 Plan。

## 谁使用

publisher 签名发布 Plan；registrar 基于已 finalized 的 Plan 创建 Order；Store 把 Plan 版本组织成材料审核和 active version 展示；状态机只按 Plan 内的 hooks 和 metadata 执行。

## 产生什么结果

一次成功的发布产生 `planHash`、`planId` 和永久冻结的链上 hooks/metadata；之后每个 Order 都引用这个不可变身份，规则变化只能通过发布新 Plan 表达。

## 权威来自哪里

Plan 的权威来自 publisher 的 EIP-712 签名、两步注册的 hash 校验和 module 冻结后的合约代码；编译器 artifact 只用于追溯源产物。协议分层与组件关系见 [Architecture](../architecture.md)。

## 身份与哈希（速查）

```text
hooksHash    = keccak256(abi.encode(hooks))
metadataHash = keccak256(abi.encode(selectorBindings, signalCapabilities))
planHash     = hash("uvp.plan.runtime.v1", hooksHash, metadataHash)
planId       = hash("uvp.plan.id.v1", publisher, planHash)
```

编译器自己的 artifact hash 继续用于追溯源产物，但不再冒充链上 `planHash`。把 publisher 放进 `planId`，可以避免不同发布者对同一内容争抢全局名字。

## 两步凝固

1. publisher 对 `publisher + hooksHash + metadataHash + deadline` 做 EIP-712 签名；任意 relayer 调用 `commitPlan`，同时提交完整 hooks。
2. 任意调用者提交 selector bindings 与 signal capabilities；`finalizePlan` 验证 `metadataHash` 后，由 Metadata Module 一次写入并永久冻结。

pending Plan 不能创建 Order。finalized 后 hooks 和 metadata 都不能修改；如果规则变化，发布新的 Plan。

## Module 冻结

StateMachine 部署并配置六个 module 后调用 `freezeModules()`。冻结后的 module 地址不能由 owner 更换，因此“代码含义”不再依赖部署者日后的善意。新实现只能通过新的 StateMachine deployment 和显式 cutover 引入。各合约与 registry 的职责分工见 [Contracts and Registries](../contracts-and-registries.md)。

## 不承担的责任

- Plan 不声明哪个公司“有能力”履约。
- Plan 不替 Store 做搜索、推荐和撮合。
- Plan 不保存文件明文、联系人或现实名称。
- Order 运行时的 executor/resource 变化进入 Order overlay，不回写 Plan。
