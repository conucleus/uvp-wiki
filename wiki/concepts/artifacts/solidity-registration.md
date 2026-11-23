---
title: 链上注册参数
type: reference
audience: 工程贡献者
status: verified
---

# 链上注册参数

`OnchainHookPlanArtifact`（`uvp.onchainHookPlan.v1`）还不是最终交易参数。编译器把它压缩成紧凑结构后，CompactHook 等参数构成 `commitPlan()` 的提交载荷；三张能力表（signal capability + selector binding + file writer）在链下折叠为单棵 Merkle 树的 `capabilitiesRoot`，与 `supplierBindingsRoot` 一起随 commit 被 publisher 承诺，`finalizePlan(bytes32)` 只落定稿。表规模与注册 gas 成本脱钩，没有条目上限。

链上 runtime 承诺面是 `planHash`（域 `uvp.plan.runtime.v7`），preimage 为 `(hooksHash, capabilitiesRoot, supplierBindingsRoot)`；`birthAuthorizer` 只进 PlanCommit digest 与链上存储，不进 `planHash`。artifact 的派生读面 `triggers[]` 枚举全部 order-trigger hook 的出生事实，不进 planHash 承诺面。

## PlanCommit 与注册入口

publisher 对六字段 PlanCommit 做 EIP-712 签名：

```text
publisher, hooksHash, capabilitiesRoot, supplierBindingsRoot, birthAuthorizer, deadline
```

任意 relayer 调 `commitPlan` 提交签名与完整 hooks，任意调用者调 `finalizePlan(planId)` 定稿。`birthAuthorizer` 是 plan 级出生提交者承诺：outside 出生提交必须来自它，零地址表示该计划关闭 outside 出生通道（order-link 与 fork 通道不受影响）。

## CompactHook

链上 hook 只保留运行时需要的信息：

```solidity
struct CompactHook {
    bytes32 hookId;
    bytes32 stageId;
    bytes32 hookName;
    uint8 flags; // ORDER_TRIGGER_MINT=1, EMIT_READY=4, ADMISSION=8, DOCK_EXECUTOR=16
    Instruction[] instructions;
    bytes32[] dependencyKeys;
}
```

位标志全集是 `1 = ORDER_TRIGGER_MINT`（出生钩子的冻结 ABI 名）、`4 = EMIT_READY`、`8 = HOOK_FLAG_ADMISSION`、`16 = HOOK_FLAG_DOCK_EXECUTOR`。人类可读标签、原始表达式、AST 调试信息不会写入合约存储，它们留在 artifact 和审计材料中。

- 每条 `sendSignals[].trigger: true` 出生信号合成一条 order-trigger hook：单条 `SIGNAL` 指令、置位 1 与 4、`orderTriggerKind=trigger`。
- `validWhen` 编译为独立的 admission 条目（kind `admission`，flag 8），随 hooksHash 进 plan 承诺。
- dock 阶段的 receive hook 置位 16；它不改变 `orderTriggerKind`，也不承载出生。
- 一个 plan 可以注册多条 order-trigger hook；出生入口用 `triggerHookId` + `triggerStageId` 显式选择，`birthAuthorizer` 是 plan 级配置。

## Instruction 与 Dependency Index

compact instructions 的操作码是 `SIGNAL` / `NOT` / `AND` / `OR` / `DELAY`；`DELAY` 由状态机的显式 `pokeTimer` 补时重算。编译器把每个 hook 的依赖整理成：

```text
signalKey -> [hookId]
```

合约注册计划时把它写入 `Plan.dependencyIndex`。提交 signal 时，合约只评估受该 `signalKey` 影响的 hook。依赖键全计划去重后 ≤1024（超限注册期 revert `TooManyDependencies`）。

## Selector Binding 与 File Writer

selector binding 描述某个 stage 能否 patch 某个 target stage：

```text
selectorStageIdentifier -> targetStageIdentifier
```

链上形式是 `selectorStageId = keccak256(selectorStageIdentifier)`、`targetStageId = keccak256(targetStageIdentifier)`。`stages[].fileWriters` 同理折叠为 `(targetStageId, writerStageId)` 的 file-writer 叶。两类叶都不逐条存储：它们混入 `capabilitiesRoot` 那棵 Merkle 树，executor patch 与文件 patch 在检查时按字段重算叶并携 proof 验证成员资格（`UVPPlanMetadataModule.verifySignalCapability` / `verifyStageSelectorBinding` / `verifyFileWriter`）。叶公式与树规则见 [Canonical Hash](canonical-hashes.md)。

## Executor Route

executor route（stage 的静态 executor 与 fileResources）是链下路由元数据：编译器把它保留在 artifact 里供 Product API 与 uvp-client 调度，routeId/routeHash 不进链上 runtime `planHash`。dock 阶段没有 plan 级 route，也没有执行者候选；它的执行者由运行期一次性选择。

## ABI Fixture

公共 ABI 和冻结校验在合约包中维护。当前冻结组合统一为 `0.1`（state-machine、plan-registration、stage-patch、dock-registry、file-resource、lens、plan-metadata、derived-signal、supplier-registry、deployment-registry、identity-registry）；EIP-712 域版本以兼容矩阵为准，全部为 `1`（productSubmit、derivedSignal、stageSupplierPatch）。验证命令：

```bash
pnpm verify:protocol-freeze
```

ABI、bytecode、selector、event topic、typed-data 字段、canonical hash 或 artifact schema 的变化都应进入发布说明和迁移判断。CompactHook、事件、selector 和 EIP-712 字段已经由 state-machine fixture、各 module fixture 以及 `pnpm verify:protocol-freeze` 固定；变更必须同步 bindings、indexer、executor 和 bootstrap，不能只更新单侧 fixture。

## 相关页面

- [编译输入](compiler-input.md)
- [Canonical Hash](canonical-hashes.md)
- [合约与事件](../../reference/contracts-and-events.md)
- [发布与验证](../../how-to/release-checklist.md)
