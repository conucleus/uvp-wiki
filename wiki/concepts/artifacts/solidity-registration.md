# 链上注册参数

`OnchainHookPlanArtifact` 还不是最终交易参数。编译器会把它进一步转换为 `UVPStateMachine.registerPlan()` 需要的紧凑结构。

## CompactHook

链上 hook 只保留运行时需要的信息：

```solidity
struct CompactHook {
    bytes32 hookId;
    bytes32 stageId;
    bytes32 hookName;
    bool trigger;
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

selector binding 描述某个 selector stage 能否 patch 某个 target stage：

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
