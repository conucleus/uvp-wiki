---
title: 产物与哈希
type: meta
audience: 工程贡献者
preread: compiler-and-hooks.md
status: verified
---

# 产物与哈希

编译器把 Zhixu 定义确定性地产出为协议产物与哈希承诺；本组页面解释哪些输入进入产物、稳定哈希如何计算，以及链上产物如何压缩成注册参数。

## 本篇子项

| 子页 | 说明 |
| --- | --- |
| [编译输入](artifacts/compiler-input.md) | `ZhixuDefinition` 哪些字段进入协议产物，编译器会拒绝哪些无效形状。 |
| [Canonical Hash](artifacts/canonical-hashes.md) | `planId`、`planHash`、`hookId`、`signalKey` 等稳定哈希如何计算。 |
| [链上注册参数](artifacts/solidity-registration.md) | on-chain artifact 如何构成 `commitPlan()` / `finalizePlan()` 的参数。 |
