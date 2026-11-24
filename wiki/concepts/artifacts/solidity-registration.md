---
title: 链上注册参数
type: reference
audience: 工程贡献者
status: verified
---

# 链上注册参数

`OnchainHookPlanArtifact`（`uvp.onchainHookPlan.v1`）还不是最终交易参数。编译器把它压缩成紧凑结构后，CompactHook 等参数构成 `commitPlan()` 的提交载荷；signal capability 与 selector binding 在链下折叠为单棵 Merkle 树的 `capabilitiesRoot`，supplier default/candidate 绑定折叠为 `supplierBindingsRoot`，`StageFileWriter[]` 折叠为 `fileWritersHash`，三者随 commit 被 publisher 承诺，`finalizePlan(bytes32)` 只落定稿。表规模与注册 gas 成本脱钩，没有条目上限。

链上 runtime 承诺面是 `planHash`（域 `uvp.plan.runtime.v8`），preimage 为四元 `(hooksHash, capabilitiesRoot, supplierBindingsRoot, fileWritersHash)`。artifact 的派生读面 `triggers[]` 枚举全部 order-trigger hook 的出生事实，不进 planHash 承诺面。

## PlanCommit 与注册入口

publisher 对六字段 PlanCommit 做 EIP-712 签名：

```text
publisher, hooksHash, capabilitiesRoot, supplierBindingsRoot, fileWritersHash, deadline
```

任意 relayer 调 `commitPlan` 提交签名、完整 hooks、`StageSupplierBinding[]` 与 `StageFileWriter[]`，任意调用者调 `finalizePlan(planId)` 定稿。`commitPlan` 重算 `supplierBindingsRoot` 与 `fileWritersHash`，并校验指令计划、dynamic 标记、候选/默认绑定。出生发信权属于出生阶段当前生效的 assigned supplier account。

## CompactHook

链上 hook 只保留运行时需要的信息：

```solidity
struct CompactHook {
    bytes32 hookId;
    bytes32 stageId;
    bytes32 hookName;
    uint8 flags; // ORDER_TRIGGER_MINT=1, EMIT_READY=4, ADMISSION=8, DOCK_EXECUTOR=16, DYNAMIC_EXECUTOR=32
    Instruction[] instructions;
    bytes32[] dependencyKeys;
}
```

位标志全集是 `1 = ORDER_TRIGGER_MINT`（出生钩子的冻结 ABI 名）、`4 = EMIT_READY`、`8 = HOOK_FLAG_ADMISSION`、`16 = HOOK_FLAG_DOCK_EXECUTOR`、`32 = HOOK_FLAG_DYNAMIC_EXECUTOR`。人类可读标签、原始表达式、AST 调试信息不会写入合约存储，它们留在 artifact 和审计材料中。

- 每条 `sendSignals[].trigger: true` 出生信号合成一条 order-trigger hook：单条 `SIGNAL` 指令、置位 1 与 4、`orderTriggerKind=trigger`。
- `validWhen` 编译为独立的 admission 条目（kind `admission`，flag 8），随 hooksHash 进 plan 承诺。
- dock 阶段的 receive hook 置位 16；dynamic 阶段的 receive hook 置位 32；二者都不改变 `orderTriggerKind`，也不承载出生。
- 一个 plan 可以注册多条 order-trigger hook；提交侧按 `(planId, sourceId, signalId)` 解析出生 hook，读面用 `triggers[].hookId` + `triggerStageId` 显式枚举出生线。

## Instruction 与 Dependency Index

compact instructions 的操作码是 `SIGNAL` / `NOT` / `AND` / `OR` / `DELAY`；`DELAY` 由状态机的显式 `pokeTimer` 补时重算。编译器把每个 hook 的依赖整理成：

```text
signalKey -> [hookId]
```

合约注册计划时把它写入 `Plan.dependencyIndex`。提交 signal 时，合约只评估受该 `signalKey` 影响的 hook。依赖键全计划去重后 ≤1024（超限注册期 revert `TooManyDependencies`），单个依赖键挂载的 hook 数 ≤16（`TooManyHooksPerDependencyKey`）。

## Selector Binding 与 File Writer

selector binding 描述某个 stage 能否 patch 某个 target stage：

```text
selectorStageIdentifier -> targetStageIdentifier
```

链上形式是 `selectorStageId = keccak256(selectorStageIdentifier)`、`targetStageId = keccak256(targetStageIdentifier)`。selector binding 混入 `capabilitiesRoot`，stage supplier patch 在检查时按字段重算叶并携 proof 验证成员资格（`UVPPlanMetadataModule.verifyStageSelectorBinding`）。

`stages[].fileWriters` **不生成 capability 叶**，也不进 `capabilitiesRoot`：编译器把它编为 `StageFileWriter{targetStageId, writerStageId}[]`，由 `fileWritersHash = keccak256(abi.encode(StageFileWriter[]))` 在 PlanCommit 中单独签名承诺。文件写入授权按 target/writer 阶段的 assigned supplier 解析，无独立 file-writer 注册面。叶公式与树规则见 [Canonical Hash](canonical-hashes.md)。

## Supplier Route

supplier route（stage 的静态 supplier 与 fileResources）是链下路由元数据：编译器把它保留在 artifact 里供 Product API 与 uvp-client 调度，routeId/routeHash 不进链上 runtime `planHash`。dock 阶段没有 plan 级 route，也没有执行者候选；它的 supplier 由运行期一次性选择。dynamic 阶段同样没有 plan 级 supplier route/binding，由 selector 在首信号前指派 supplierId。

## ABI Fixture

公共 ABI 和冻结校验在合约包中维护。当前冻结组合统一为 `0.1`（state-machine、plan-registration、stage-patch、dock-registry、file-resource、lens、plan-metadata、derived-signal、identity-registry、deployment-registry）；EIP-712 域版本以兼容矩阵为准，全部为 `1`（productSubmit、derivedSignal、stageSupplierPatch）。验证命令：

```bash
pnpm verify:protocol-freeze
```

ABI、bytecode、selector、event topic、typed-data 字段、canonical hash 或 artifact schema 的变化都应进入发布说明和迁移判断。CompactHook、事件、selector 和 EIP-712 字段已经由 state-machine fixture、各 module fixture 以及 `pnpm verify:protocol-freeze` 固定；变更必须同步 bindings、indexer、executor 和 bootstrap，不能只更新单侧 fixture。

## 相关页面

- [编译输入](compiler-input.md)
- [Canonical Hash](canonical-hashes.md)
- [合约与事件](../../reference/contracts-and-events.md)
- [发布与验证](../../how-to/release-checklist.md)
