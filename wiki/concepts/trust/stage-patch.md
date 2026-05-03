# Stage Patch 授权

Stage patch 是订单运行时的受控变更动作，用来选择执行者或资源 manifest。它复用订单级授权，因此仍遵守同一套 source/signal/submitter 权限模型。

## 内部 Signal

Product BFF 会根据 add-on manifest 自动生成内部授权：

| Action | 内部 signal |
| --- | --- |
| `stage_executor_patch` | `EXECUTOR_PATCH_SIGNAL_ID` |
| `stage_resource_patch` | `RESOURCE_PATCH_SIGNAL_ID` |

source 通常来自发起 patch 的 stage：

```text
sourceId = keccak256(stageId)
```

如果 stageId 已经是 `bytes32`，实现会按 bytes32 处理。

## Selector Binding

Patch 由计划中的 stage-to-target binding 控制
（wire/API 字段名仍是 selector binding）：

```text
selectorStageId -> targetStageId
```

合约用 binding 判断该 stage 是否允许 patch target stage。

## Executor Patch

Executor patch 可以做 assign、handoff、replacement 等动作。合约会检查 nonce、订单级授权、stage-to-target binding，并根据 mode 检查前任 executor 或 approval signal。

激活后，目标 stage 的业务 signal 必须由 active executor 提交。

## Resource Patch

Resource patch 保存的是资源 manifest、policy、patch 的哈希和 URI。文件明文留在链下；目标业务 signal 已经提交后，资源覆盖应被合约拒绝。

## 为什么它属于授权体系

Stage patch 会改变订单执行路径。如果不走订单级授权，Store 或后端就可能绕过参与者权限改执行者或资源。把 patch 做成受控 signal，可以让合约和 projection 都从同一事件流恢复状态。
