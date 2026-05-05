# 工程架构入口

工程架构页把模块归属、状态来源和接口影响面集中在一组入口里。

## 架构主线

| 页面 | 作用 |
| --- | --- |
| [架构](../concepts/architecture.md) | 协议核心、链服务、产品表面、执行者工具、部署记录和 periphery 的总体分层。 |
| [模块边界](../concepts/architecture/modules.md) | 每个 workspace 目录负责什么，哪些接口是公共边界。 |
| [数据流与事实源](../concepts/architecture/flow-and-truth.md) | 哪些状态必须来自链，哪些只是可重建投影或操作辅助。 |
| [本地到链上路径](../concepts/architecture/lifecycle.md) | 从 Zhixu 编译、计划认证、订单注册到 Product DTO 的完整生命周期。 |
| [模块地图](../reference/module-map.md) | workspace package、职责和禁止职责速查。 |

## 组件边界

| 页面 | 组件 |
| --- | --- |
| [Compiler 与 Hook Core](../concepts/architecture/components/compiler-hook-core.md) | Hook DSL parser/evaluator、compiler、deterministic artifacts。 |
| [Contracts 与 Registries](../concepts/architecture/components/contracts-registries.md) | `UVPStateMachine`、`ZhixuTrustRegistry`、`UVPDeploymentRegistry`。 |
| [Product BFF](../concepts/architecture/components/chain-services-bff.md) | order draft、invite、participant confirmation、authorization 和 registration workflow。 |
| [Store 与治理](../concepts/architecture/components/store-governance.md) | Store Console、governance handoff、supplier registry。 |
| [Order App 与 Executor Kit](../concepts/architecture/components/order-app-executor-kit.md) | participant app、executor CLI/SDK、AI/MCP adapter boundary。 |
| [Periphery 与部署](../concepts/architecture/components/periphery-deploy.md) | funding/guarantee/payment/agent adapters、deploy scripts 和 release records。 |

## 常用工程路径

| 要做的事 | 先读 |
| --- | --- |
| 本地开发和测试 | [日常开发](../tasks/development.md) |
| 运行服务和前端 | [运行服务和前端](../tasks/run-services-and-apps.md) |
| 跑协议 Anvil 闭环 | [Local Anvil 协议闭环](../tutorials/local-anvil.md) |
| 跑 Product 本地闭环 | [Product 本地闭环](../tutorials/product-local-loop.md) |
| 准备 Base Sepolia | [Base Sepolia Staging](../tasks/base-sepolia-staging.md) |
| 判断 release claim | [发布与验证](../operations/release-and-verification.md) |
| 查错 | [排障](../operations/troubleshooting.md) |

## 改动影响面

- 改 ABI、event、selector、EIP-712、canonical hash 或 artifact schema，要按 [公共接口](../reference/public-interfaces.md) 处理。
- 改 Product DTO 或 Product API，要同步 chain-services、Store、Order App、executor-kit 和相关 tests。
- 改 staging/release gate，要同步 `uvp-deploy/deploy/releases/` 的 release evidence 规则和本 Wiki 的 staging/release 页面。
- 改 funding、payment、guarantee、agent adapter，默认放 `uvp-periphery/`，并证明它消费核心接口而不是重写核心状态。
