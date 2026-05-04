# 组件链路与模块边界

本页是核心组件的总装图，帮助工程师判断某个状态从哪里来、代码应该放哪里、接口改动会影响谁。

## 组件总线

| 层 | 代码入口 | 事实或接口 |
| --- | --- |
| DSL/语义 | `uvp-protocol/packages/hook-core/`、`uvp-protocol/packages/compiler/` | Hook expression、HookPlan、OnchainHookPlan、planId/planHash。 |
| 链上执行 | `uvp-protocol/contracts/uvp-contracts/` | ABI、events、EIP-712 domain、`UVPStateMachine`、`ZhixuTrustRegistry`。 |
| Replay/reference | `uvp-protocol/packages/statemachine/` | reference reducer、event replay、runtime semantic tests。 |
| Bindings | `uvp-protocol/packages/protocol-bindings/` | browser-safe ABI、typed-data builders、hash helpers、calldata builders。 |
| 可重建服务层 | `uvp-chain-services/service/` | 可 fork 的链下 indexer、projection、relayer boundary、proof verifier、Product/Store API。 |
| Product language | `uvp-protocol/packages/product-dto/` | Product order/task/proof/trust DTO。 |
| Store/Product UIs | `zhixu-store/app/`、`uvp-order-app/app/` | Store workbench、participant task UI、proof display。 |
| Execution tools | `uvp-executor-kit/package/` | CLI/SDK/MCP signal producer。 |
| Deploy/evidence | `uvp-deploy/deploy/` | deployment manifests、release records、staging gates。 |
| Periphery | `uvp-periphery/` | payment/funding/guarantee/agent adapters and demos。 |

## 架构主线

```text
core objects
  -> semantic/compiler components
  -> contracts and registries
  -> chain events
  -> replay/rebuildable service projections
  -> Store / Product / execution surfaces
```

完整阅读材料：

| 页面 | 解决的问题 |
| --- | --- |
| [架构总览](../concepts/architecture.md) | 系统按协议核心、链服务、产品表面、执行者工具、部署记录、periphery adapter 分层。 |
| [模块边界](../concepts/architecture/modules.md) | 每个 workspace 目录负责什么，禁止跨哪些边界。 |
| [数据流与事实源](../concepts/architecture/flow-and-truth.md) | 哪些状态必须来自链，哪些状态只是可重建投影或操作辅助。 |
| [本地到链上路径](../concepts/architecture/lifecycle.md) | 从 Zhixu 编译、计划认证、订单注册到 Product DTO 的完整生命周期。 |
| [模块地图](../reference/module-map.md) | package、职责和禁止职责速查。 |

## 架构规则

- 合约和链事件是 plan、order、signal、hook、attestation、deployment cutover 的事实源。
- Store、Product API、Order App 和 executor-kit 只能消费、投影、展示、中继或提交授权动作。
- Indexer 和 durable database 必须能从事件重建，不能成为协议事实源。
- Periphery 可以实现 funding、guarantee、payment、agent adapter，但必须消费核心接口。
- 任何跨模块改动都要检查 ABI、event、typed data、canonical hash、DTO、CLI 和 release evidence 是否漂移。
