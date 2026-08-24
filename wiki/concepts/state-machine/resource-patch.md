---
title: Resource Patch
type: explanation
audience: 工程贡献者
status: verified
---

# Resource Patch

Resource patch 是 Stage Overlay 的另一类运行时变更。它为某个 Order 的目标 stage 覆盖或补充 resource manifest，让订单可以在不修改 Plan 的情况下绑定新的链下资源句柄。

## 解决什么问题

Plan 里的 `fileResources` 是静态默认要求。真实订单运行时，某个 stage 可能需要替换协议文件、资源包、验收模板或访问策略。Resource patch 把这类变更记录成订单级 overlay：

```text
selector stage
  -> stage_resource_patch typed data
  -> selector wallet signature
  -> applyStageResourcePatchFor
  -> StageResourcePatchApplied
  -> Product / Store reads active resource overlay
```

## 合约检查

Resource patch 至少受这些条件约束：

- selector stage 和 target stage 必须存在 `StageSelectorBinding`。
- selector 必须有订单级内部 patch 授权。
- 目标 stage 的目标业务 signal 尚未提交。
- `resourceKey`、`manifestHash`、`policyHash`、`patchHash` 必须非零。
- patch nonce 必须递增。

链上只保存 hash、URI 和事件，不保存合同、发票、物流文件、车辆资料或其他业务明文。selector binding 同样是 Plan 发布时冻结的公共接口约束，resource patch 只能消费它而不能绕过或改写；公共接口边界见 [合约与事件](../../reference/contracts-and-events.md)。

## 代码入口

| 代码 | 说明 |
| --- | --- |
| `UVPStagePatchModule.sol` | `applyStageResourcePatch`、`applyStageResourcePatchFor`、patch digest 和事件。 |
| `protocol-bindings/src/index.ts` | stage resource patch typed data、call builder、signer recovery。 |
| `uvp-chain-services/service/src/stage-patches/` | Product API prepare/submit resource patch。 |
| `uvp-protocol/packages/protocol-bindings/src/index.ts` | `ResourceManifestV1` hash 与 validation helpers。 |

## 边界

- Resource patch 和 Executor patch 是两种不同动作，字段和签名 payload 不能混用。
- Resource patch 不证明业务完成；业务完成仍看授权业务 signal。
- Resource patch 不把文件明文写上链；文件内容通过 object storage、manifest URI、hash 和 proof 关联。

相关总览见 [Stage Overlay：Executor Patch 与 Resource Patch](stage-overlay.md)，静态资源对象见 [File Resources](../core/file-resources.md)。
