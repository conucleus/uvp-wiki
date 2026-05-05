# 语义、Hook Core 与 Compiler

语义与编译组件把 Zhixu 定义变成可复现、可认证、可注册的链上计划。它们在状态机之前，是协议可信度的前置条件。

## 组件链路

```text
Zhixu YAML/JSON
  -> hook-core parses receiveSignals
  -> compiler builds OnchainHookPlanArtifact
  -> compiler emits Solidity registerPlan args
  -> trust registry attests planId / planHash
```

## 组件职责

| 组件 | 负责什么 | 相邻边界 |
| --- | --- | --- |
| hook-core | `source::condition` 解析、AST、dependency extraction、正向锚点规则。 | Solidity ABI、钱包授权、Product task 语言由后续层处理。 |
| compiler | 秩序 input schema、OnchainHookPlan、registerPlan args、canonical hash；HookPlan 仅为内部 IR。 | 订单参与者选择、Supplier trust 判断、linked order 注册、支付/escrow 逻辑由产品、registry 或 periphery 处理。 |
| artifact/hash | `planId`、`planHash`、`hookId`、`sourceId`、`signalId`、`signalKey` 的稳定边界。 | Store draft 状态和 Product DB primary key 属于读模型。 |

## 阅读路径

| 页面 | 作用 |
| --- | --- |
| [Hook Core 与 Compiler](../concepts/architecture/components/compiler-hook-core.md) | hook-core 和 compiler 的职责边界。 |
| [产物与哈希](../concepts/artifacts-and-hashes.md) | OnchainHookPlanArtifact、registerPlan args 和 public hash boundary。 |
| [编译输入](../concepts/artifacts/compiler-input.md) | 哪些 Zhixu 字段进入 deterministic artifact。 |
| [Canonical Hash](../concepts/artifacts/canonical-hashes.md) | planId、planHash、hookId、signalKey 等稳定 ID。 |
| [链上注册参数](../concepts/artifacts/solidity-registration.md) | compact hooks、dependency index、selector bindings 如何进入 `registerPlan`。 |

## 关键边界

- Hook Core 是平台中立语义，不含 Solidity ABI。
- Compiler 不选择订单参与者，不创建钱包授权，不判断 supplier 是否可信。
- Artifact 是工程和审计材料；普通用户看 Product DTO，Store operator 看 proof panel，协议工程师读 on-chain artifact。
- Canonical hash、artifact schema 和 registerPlan args 都是公共接口，改动时必须按 [公共接口](../reference/public-interfaces.md) 处理。
- `supplierType=zhixu` 的 `signalMap` 编译 local Plan 的映射语义；运行态 linked order lifecycle 由 Store/Product/adapter 组织，并可通过 `DockedOrderLinked`、`DockedSignalMapped`、`DockedSignalSubmitted` 落链。
- `fileResources` 是 stage resource handle；生产资源访问策略通过 resource manifest/patch 演进，文件明文留在链下。

## 当前要特别守住的语义

- `stage.trigger` 必须引用本 stage 已存在的 `receiveSignals` key。
- receive hook 的 `trigger=true` 才会在 Ready 时发出 `HookReady`。
- `signalMap` hook 当前 `trigger=false`。
- `supplierType=zhixu` 的 `signalMap` 必须包含 `str` 和 `cmp`，并且同一个 map 引用同一个 source。
- Hook 表达式按单调存在逻辑求值：`A` 表示 signal 已出现，`~A` 表示 signal 尚未出现；signal 出现后不会消失。
- Hook 表达式必须有正向锚点；纯缺席条件不能成为可推进 hook。
