# UVP：AI 时代的可证明协作协议

UVP（通用价值协议，Universal Value Protocol）是一套面向跨组织协作的协议和当前 EVM/Web3 实现。它不替任何参与方证明现实世界的全部真相，而是记录一个更窄但更关键的事实：**谁在什么授权下，围绕哪个订单和阶段，基于哪个证据指纹，签名确认了什么业务信号。**

这些确认会形成可重放的 proof。别人不必只相信某个平台后台的一句话，而是可以沿着授权、签名、证据指纹和链上记录追溯：谁确认过，凭什么确认，确认之后订单为什么推进。

第一次阅读不需要记住所有对象。先建立一条直觉：**秩序 (Zhixu) 是规则书，订单 (Order) 是这次运行，执行者 (Executor) 处理某一步，信号 (Signal) 是带责任的业务声明。** Plan、Hook、Source、Product DTO、ABI 等概念会在第二遍和工程页面展开。

## UVP 证明什么

UVP 证明的不是“货一定真实到港”或“某家公司一定可信”。这些现实判断仍由合同、监管、保险、审计、Identity Registry、供应商或 adapter 承担。

UVP 证明的是协作边界里的可追责声明：

```text
被授权主体
  -> 在某个 Order / stage
  -> 基于证据指纹或 metadata URI
  -> 用授权钱包签名
  -> 提交标准业务 Signal
  -> 触发可重放的链上事件和状态后果
```

这让陌生人、企业系统、AI agent、供应商、资金方、审计方和监管方，可以围绕同一组事实讨论：谁确认过，凭什么确认，确认之后发生了什么。

## 为什么 AI 时代需要它

AI 正在降低“完成单个任务”的成本，但它没有自动消灭交易成本。一个 agent 可以写代码、审单、报价或生成报关材料；真正卡住协作的，仍然是该和谁协作、按什么规则协作、谁有资格接下一步、谁能确认结果、确认之后谁负责。

UVP 把协作规则写成可复用的 Zhixu DSL，把执行权限、证据指纹、钱包签名和状态后果收束成标准化业务信号，再把关键事实落成可重放 proof；AI agent 无权自行决定这些事实。如果你想继续看这套判断如何连接交易成本、平台信任和 L4/L5，读 [AI 时代的协作地基](getting-started/ai-era-coordination.md)。

## 一条订单如何留下 proof

以跨境光伏交付为例，项目公司、EPC、OEM、报关行、物流、仓储、资金方和审计方不需要把内部系统都迁进 UVP。它们只需要在关键协作边界提交被授权的业务 signal。

```text
Zhixu 规则书
  -> 编译成 deterministic Plan
  -> Identity Registry 登记主体与钱包
  -> 创建 Order 并写入 signal 授权
  -> 执行者提交 evidence hash 和签名 Signal
  -> UVPStateMachine 记录事件并推进 HookReady
  -> Chain Services 重建订单、任务、timeline 和 proof row
```

如果你只读一篇故事，先读 [一个订单故事](getting-started/one-order-story.md)。第二遍再读 [一个订单穿过 UVP 组件](getting-started/order-through-components.md)，看 Store、compiler、Identity Registry、state machine、Chain Services、Order App 和 executor-kit 的位置。

## UVP 不是什么

UVP 不是普通工作流 SaaS，不是支付服务商，不是托管方，不是 escrow 产品，也不是 AI agent runtime。

资金、USDC、escrow、guarantee、settlement、AI/MCP agent adapter 都可以围绕 UVP 接入，但它们属于 periphery 或外部 adapter。核心协议边界是协作状态机：Plans、Orders、authorizations、Signals、hooks、publications 和可重放事件。

## 当前实现和成熟度

当前可运行实现轨道是 EVM/Web3。`uvp-protocol`、`uvp-chain-services`、`zhixu-store`、`uvp-order-app` 和 `uvp-executor-kit` 共同组成公开实现：compiler 生成 deterministic artifacts，合约记录 Plan/Order/Signal/trust events，Chain Services 重建 Product/Store 视图，前端和 executor 工具消费这些视图并提交授权动作。

当前状态要分层阅读：compiler、contracts/event replay、Identity Registry、Product DTO 和 Chain Services projection 有 verified 口径；Store Console、Order App、executor-kit live operator path 和 ops console 仍是 prototype 或 partial。最新口径见 [项目状态](status/README.md)。

## 开始阅读

1. [一个订单故事](getting-started/one-order-story.md)：用一条跨境货物订单理解从秩序设计到任务 proof 的路径。
2. [AI 时代的协作地基](getting-started/ai-era-coordination.md)：理解交易成本、平台信任和 L4/L5 协作底座之间的关系。
3. [核心概念](core/README.md)：按对象层级读 Zhixu、Order、Signal、Executor 和其他协议对象。
4. [一个订单穿过 UVP 组件](getting-started/order-through-components.md)：用同一条订单看工程模块分工。
5. [核心术语表](reference/glossary.md)：随时查项目术语和关键概念对。

## 按目标选择路径

| 目标 | 接着读 |
| --- | --- |
| 先理解系统再工程 | [入门](getting-started/README.md)、[一个订单穿过 UVP 组件](getting-started/order-through-components.md)、[核心概念](core/README.md)。 |
| 建 Product 或 Store 界面 | [Product DTO 与用户表面](product/README.md)、[秩序商店](store/README.md)、[Order App](execution/order-app.md)。 |
| 改协议或 public interface | [从 Zhixu 到可注册 Plan](components/semantics-and-compiler.md)、[UVPStateMachine](components/onchain-runtime.md)、[公共接口](reference/public-interfaces.md)。 |
| 改 Chain Services 或 Product API | [Chain Services](components/chain-services.md)、[Product API](components/chain-services-product-api.md)、[Product API 参考](reference/product-api.md)。 |
| 接入 executor、企业脚本或 AI/MCP | [执行者与集成](execution/README.md)、[Executor Kit](execution/executor-kit.md)、[Order App 与 Executor Kit](concepts/architecture/components/order-app-executor-kit.md)。 |
| 验证本地或 staging claim | [快速开始](getting-started/quick-start.md)、[Local Anvil 协议闭环](tutorials/local-anvil.md)、[Base Sepolia 预发](tasks/base-sepolia-staging.md)、[项目状态](status/README.md)。 |

完整目录见 [SUMMARY.md](SUMMARY.md)。`wiki/site/` 是静态站点生成输出，不是编辑源。
