# 模块边界

本仓库按职责拆成多个模块。判断一个改动应该放在哪里时，先问它是在定义协议事实、投影链上事实、展示产品语言，还是在做外围 adapter。

## 协议层

| 模块 | 职责 |
| --- | --- |
| `uvp-protocol/packages/hook-core` | Hook DSL 解析、依赖抽取、本地语义求值。 |
| `uvp-protocol/packages/compiler` | Zhixu 到 HookPlan、on-chain artifact、`registerPlan` 参数的编译。 |
| `uvp-protocol/packages/statemachine` | 平台中立 reducer、链事件 replay oracle、语义回归测试。 |
| `uvp-protocol/packages/protocol-bindings` | 浏览器安全的 ABI、EIP-712、calldata、hash helpers。 |
| `uvp-protocol/contracts/uvp-contracts` | Solidity 合约、ABI fixture、部署脚本、合约测试。 |

这些模块定义公共协议接口。ABI、event、typed data、canonical hash、artifact schema 的变化都需要被当作协议变化处理。

## 服务层

| 模块 | 职责 |
| --- | --- |
| `uvp-chain-services/service` | indexer、relayer、proof verifier、Product API、Store API。 |
| `uvp-protocol/packages/product-dto` | Product API、Store、Order App 共享的 DTO contract。 |

服务层可以缓存和投影，但数据库必须能从链事件重建。它不能让 `miniprogram-backend`、外部数据库或任意 HTTP 服务成为 plan/order/signal/hook 的事实源。

## 产品与执行者

| 模块 | 职责 |
| --- | --- |
| `zhixu-store/app` | Store/workbench 原型，处理订单创建、任务审阅、链证明、trust attestation 展示。 |
| `uvp-order-app/app` | 普通参与者 App，处理 invite onboarding、任务 inbox、证据指纹、证明展示。 |
| `uvp-executor-kit/package` | executor、validator、adjudicator 的 CLI 和 SDK。 |

这些表面消费 DTO、签名请求或链事件。它们可以改善 UX，但不能替代合约授权。

## 部署与 Periphery

| 模块 | 职责 |
| --- | --- |
| `uvp-deploy/deploy` | uvp-eth 自己的部署脚本、环境 manifest、发布记录。 |
| `uvp-periphery` | escrow、payment、guarantee、agent、demo adapter。 |

部署状态必须留在本仓库，不依赖 sibling `/Users/uyhendu/project/uvp-deploy`。资金、担保和 agent 集成属于 periphery，必须围绕核心状态机消费接口，不能重写核心事实。
