# Stage Overlay：Executor Patch 与 Resource Patch

Stage overlay 是订单级 patch。它允许某个订单在不修改 Plan 的情况下，为目标 stage 指定新的 executor 或 resource。这个机制用于运行时选择供应商、交接执行者、替换资源 manifest 等场景。

## Executor Patch

Executor patch 会改变某个目标 stage 的执行者约束。合约要求：

- 发起 patch 的 stage 与 target stage 之间存在 `StageSelectorBinding`。
- 发起 patch 的 submitter 对内部 `EXECUTOR_PATCH_SIGNAL_ID` 有订单级授权。
- nonce 必须递增，防止旧 patch 覆盖新 patch。
- assign、handoff、replacement 这些 mode 有不同的签名或 approval 要求。

patch 激活后，合约把 Plan 通过 `sendSignals` 预声明的目标 stage current-order signal capability 自动委任给 active executor。被选择的钱包不必在 Order 创建时预授权，但它只能提交 Plan 已声明的那些 signal；patch 不能扩张 Plan 的能力边界。

详见 [Executor Patch](executor-patch.md)。

## Resource Patch

Resource patch 用于订单级资源覆盖，例如某阶段需要的文件 manifest、policy 或资源包哈希。合约要求：

- stage-to-target binding 存在。
- 发起 patch 的 submitter 对内部 `RESOURCE_PATCH_SIGNAL_ID` 有订单级授权。
- 目标 stage 还没有提交目标业务 signal。
- `resourceKey`、`manifestHash`、`policyHash`、`patchHash` 非零。
- nonce 必须递增。

链上只保存哈希和 URI，不保存业务文件明文。

详见 [Resource Patch](resource-patch.md)。

## 为什么不改 Plan

Plan 是由 publisher 签名发布的流程版本。运行时的供应商选择、执行者交接、资源替换属于某个订单的执行事实，不反向修改计划语义。Stage overlay 让订单具备弹性，同时保留 Plan 的可审计性。
