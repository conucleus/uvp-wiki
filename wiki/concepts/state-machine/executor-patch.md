# Executor Patch

Executor patch 是 Stage Overlay 的一类运行时变更。它只影响某个 Order 的目标 stage executor，不修改 Plan，也不修改 Supplier Registry。

## 解决什么问题

有些 stage 的执行者不是在 Plan 里完全固定的，而是在订单运行时由一个 selector stage 选择、交接或替换。例如买家确认资料后，为后续报关 stage 指定具体报关行钱包。

```text
selector stage
  -> stage_executor_patch typed data
  -> selector wallet signature
  -> applyStageExecutorPatchFor
  -> StageExecutorPatchApplied
  -> StageExecutorActivated
  -> target stage future signal must match active executor
```

## 合约检查

Executor patch 至少受这些条件约束：

- selector stage 和 target stage 必须存在 `StageSelectorBinding`。
- selector 必须有订单级内部 patch 授权。
- patch nonce 必须递增。
- executor 地址不能是零地址。
- assign、handoff、replacement 等 mode 有不同的 previous executor 或 approval signal 要求。
- patch 激活后，目标 stage 的后续业务 signal 仍然要通过原本 source/signal 授权检查，并且 submitter 要匹配 active executor。

## 代码入口

| 代码 | 说明 |
| --- | --- |
| `UVPStagePatchModule.sol` | `applyStageExecutorPatch`、`applyStageExecutorPatchFor`、patch digest、mode 校验。 |
| `UVPStateMachine.sol` | active executor 激活和后续 signal 检查。 |
| `protocol-bindings/src/index.ts` | stage executor patch typed data、call builder、signer recovery。 |
| `uvp-chain-services/service/src/stage-patches/` | Product API prepare/submit executor patch。 |

## 边界

- Executor patch 不是 Supplier trust；supplier 是否被背书仍看 `ZhixuTrustRegistry`。
- Executor patch 不是业务完成；业务完成仍看目标 source/signal 的 `SignalSubmitted`。
- Executor patch 不回写 Plan；Plan 仍代表被 attested 的静态版本。

相关总览见 [Stage Overlay：Executor Patch 与 Resource Patch](stage-overlay.md)。
