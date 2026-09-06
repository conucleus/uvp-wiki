---
title: 链上注册参数
type: reference
audience: 工程贡献者
status: verified
---

# 链上注册参数

`OnchainHookPlanArtifact` 还不是最终交易参数。编译器把它压缩成紧凑结构后，CompactHook 等参数构成 `commitPlan()` 的提交载荷，metadata 在 `finalizePlan()` 中一次冻结；旧的单步入口 `registerPlan` 已不存在。当前 `uvp.onchainHookPlan.v2` 还承诺 `planId`、`planHash`、dock route/interface roots、selector bindings 和 signal capabilities。

## CompactHook

链上 hook 只保留运行时需要的信息：

```solidity
struct CompactHook {
    bytes32 hookId;
    bytes32 stageId;
    bytes32 hookName;
    uint8 flags; // ORDER_TRIGGER_MINT=1, ORDER_TRIGGER_DOCK=2, EMIT_READY=4
    Instruction[] instructions;
    bytes32[] dependencyKeys;
}
```

人类可读标签、原始表达式、AST 调试信息不会写入合约存储。它们留在 artifact 和审计材料中。

## Dependency Index

编译器会把每个 hook 的依赖整理成：

```text
signalKey -> [hookId]
```

合约注册计划时把它写入 `Plan.dependencyIndex`。提交 signal 时，合约只评估受该 `signalKey` 影响的 hook。

## Selector Binding

selector binding 是 wire/API 名称，描述某个 stage 能否 patch 某个 target stage：

```text
selectorStageIdentifier -> targetStageIdentifier
```

链上形式是：

```text
selectorStageId = keccak256(selectorStageIdentifier)
targetStageId = keccak256(targetStageIdentifier)
bindingKey = keccak256(abi.encode(selectorStageId, targetStageId))
```

Executor patch 和 resource patch 都要经过这个绑定检查。

## ABI Fixture

公共 ABI 和冻结校验在合约包中维护。验证命令：

```bash
pnpm verify:protocol-freeze
```

ABI、bytecode、selector、event topic、typed-data 字段、canonical hash 或 artifact schema 的变化都应进入发布说明和迁移判断。

CompactHook、事件、selector 和 EIP-712 字段已经由
`fixtures/uvp-state-machine.v0.10.json`、各 module fixture 以及
`pnpm verify:protocol-freeze` 固定；变更必须同步 bindings、indexer、executor
和 bootstrap，不能只更新单侧 fixture。

## 相关页面

- [编译输入](compiler-input.md)
- [Canonical Hash](canonical-hashes.md)
- [合约与事件](../../reference/contracts-and-events.md)
- [发布与验证](../../how-to/release-checklist.md)
