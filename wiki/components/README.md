# 核心组件

核心组件回答“系统怎么实现”。它们把核心概念从 Zhixu 文本变成 deterministic artifact、链上状态、可重放事件、Product DTO 和 release evidence。

```text
hook-core
  -> compiler
  -> HookPlanArtifact / OnchainHookPlanArtifact
  -> protocol-bindings
  -> UVP contracts / registries
  -> statemachine replay
  -> non-trusted execution layer / chain-services
  -> Product DTO / Store / Order App / executor-kit
  -> uvp-deploy release evidence
```

## 文档质量基准

本目录里的每个核心组件页面都应该达到同一条基准：

- 说明它在组件链路中的上游和下游。
- 说明它拥有的 public interface，例如 ABI、EIP-712、hash、DTO、CLI 或 release manifest。
- 说明它绝对不能承担的职责，避免把 Store metadata、Product DB、periphery adapter 或 relayer 写成事实源。
- 给出读代码的入口，让工程师能从文档走到具体模块。

## 组件链路

| 组件组 | 先读 | 覆盖范围 |
| --- | --- | --- |
| 组件链路与模块边界 | [组件链路与模块边界](architecture.md) | 模块边界、依赖方向、事实源、从本地到链上路径。 |
| 语义、Hook Core 与 Compiler | [语义、Hook Core 与 Compiler](semantics-and-compiler.md) | hook-core、compiler、HookPlan、OnchainHookPlan、canonical hash、registerPlan args。 |
| 链上执行、State Machine 与 Replay | [链上执行、State Machine 与 Replay](onchain-runtime.md) | contracts、registries、state machine、stage overlay、timer、event replay。 |
| 非可信执行层 | [非可信执行层：Chain Services](chain-services.md) | 可 fork 的链下执行软件：indexer、projection、relayer boundary、proof verifier、Product/Store API、notifications、storage/runtime profile。 |
| 服务与接口 | [服务与接口](services-and-interfaces.md) | protocol-bindings、Product DTO、Product API、Store API、executor-kit consumption 和 public interface drift。 |
| 部署与证据 | [部署与证据](deploy-release.md) | uvp-deploy、Anvil/Base Sepolia、manifests、release evidence、staging gates。 |

## 为什么不能只写状态机

`UVPStateMachine` 是链上事实源的核心，但不是唯一核心组件。没有 compiler，trust domain 背书的 plan hash 不可复现；没有 protocol-bindings，Product submit 和 stage patch typed data 会漂移；没有 replay oracle，chain-services 无法证明投影可重建；没有 deploy/release evidence，Base Sepolia claim 无法审计。因此状态机放在“核心组件 / 链上执行与 Replay”下，而不是放在“核心概念”对象列表里。

## 改动影响面

- 改 Hook DSL 或 compiler artifact：同步 hook-core、compiler tests、canonical hash、contracts registration、statemachine replay 和 docs。
- 改 ABI、event、EIP-712 或 selector binding：同步 protocol-bindings、chain-services、executor-kit、deploy scripts、fixtures 和 [公共接口](../reference/public-interfaces.md)。
- 改 Product DTO 或 API：同步 product-dto、chain-services、Store、Order App、executor-kit Product API mode 和 browser/API tests。
- 改 deploy/release gate：同步 `uvp-deploy/deploy/releases/`、staging docs、status docs 和 release claim language。
- 改 resource overlay：同步 contract event、protocol-bindings typed data、chain-services replay、Product resource DTO、Store resource view 和 [File Resources](../concepts/core/file-resources.md)。
- 改 docked Zhixu 语义：同步 compiler `supplierType=zhixu`、Store docking sandbox、executor-kit/Product API flow、periphery demos 和 [Zhixu 作为 Executor](../execution/zhixu-as-executor.md)。

## 相关入口

- [模块地图](../reference/module-map.md)
- [架构](../concepts/architecture.md)
- [数据流与事实源](../concepts/architecture/flow-and-truth.md)
- [本地到链上路径](../concepts/architecture/lifecycle.md)
- [合约与事件](../reference/contracts-and-events.md)
- [非可信执行层：Chain Services](chain-services.md)
