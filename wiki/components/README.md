# 核心组件

核心组件说明 UVP 如何实现：从 Zhixu 文本到 deterministic artifact、链上状态、可重放事件、Product DTO 和 release evidence。

```text
hook-core
  -> compiler
  -> OnchainHookPlanArtifact / registerPlan args
  -> protocol-bindings
  -> UVP contracts / registries
  -> statemachine replay
  -> rebuildable Chain Services projection
  -> Product DTO / Store / Order App / executor-kit
  -> uvp-deploy release evidence
```

## 组件页结构

核心组件页围绕四件事组织：

- 上游和下游。
- public interface，例如 ABI、EIP-712、hash、DTO、CLI 或 release manifest。
- 职责边界，尤其是 Store metadata、Product DB、periphery adapter 和 relayer 不能成为事实源。
- 代码入口。

## 组件链路

| 组件组 | 先读 | 覆盖范围 |
| --- | --- | --- |
| 订单组件路径 | [一个订单穿过 UVP 组件](../getting-started/order-through-components.md) | 用一条订单串起 Store、compiler、Identity Registry、state machine、Chain Services、Order App 和 executor-kit。 |
| 语义、Hook Core 与 Compiler | [语义、Hook Core 与 Compiler](semantics-and-compiler.md) | hook-core、compiler、OnchainHookPlan、canonical hash、registerPlan args。 |
| 链上执行、State Machine 与 Replay | [链上执行、State Machine 与 Replay](onchain-runtime.md) | contracts、registries、state machine、stage overlay、timer、event replay。 |
| 可重建服务层 | [可重建服务层：Chain Services](chain-services.md) | 可 fork 的链下执行软件：indexer、projection、relayer boundary、proof verifier、Product/Store API、notifications、storage/runtime profile。 |
| Protocol Bindings 与公共接口 | [Protocol Bindings 与公共接口](services-and-interfaces.md) | protocol-bindings、Product DTO、Product API、Store API、executor-kit consumption 和 public interface drift。 |
| 部署与证据 | [部署与证据](deploy-release.md) | uvp-deploy、Anvil/Base Sepolia、manifests、release evidence、staging gates。 |

## 为什么还有其他核心组件

`UVPStateMachine` 是链上事实源的核心，compiler、protocol-bindings、replay oracle、chain-services 和 deploy/release evidence 共同保证 Plan hash 可复现、签名输入稳定、投影可重建和部署声明可验证。

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
- [可重建服务层：Chain Services](chain-services.md)
