# uvp-eth Wiki

AI 时代的跨组织协作协议：UVP（通用价值协议，Universal Value Protocol）用秩序 DSL、标准化业务信号、钱包签名和链上 proof，降低搜索、议约、协调、监督、集成、争议和抵赖成本。

`uvp-eth` 是通用价值协议的 EVM/Web3 实现轨道。它把可复用的跨组织协作设计变成被背书的链上 Plan、具体 Order、钱包签名的业务 Signal，以及可重放的 proof。

## AI 时代，交易成本仍然存在

在 AI 时代，干活的成本正在快速下降；但交易成本没有自动消失。知道该和谁交易、怎么约定、谁该接着干、谁有权确认、确认之后承担什么后果，仍然是跨组织协作里最昂贵的部分。

一个人配上 AI 可以拥有更强的执行能力，但那仍然只是“我能干活”。企业、陌生人、AI agent、供应商、资金方、审计方和普通参与者仍然需要共同回答：谁被授权发出什么信号，信号绑定哪个订单、哪个阶段、哪个证据指纹和哪把签名，发出后进入什么秩序后果。

如果你在搜索“AI 时代怎么协作”、“怎么编排 AI agent”、“如何降低交易成本”或“跨组织流程如何上链证明”，UVP 的回答是：把协作规则、执行权限、证据指纹和状态后果做成标准化信号容器。

## UVP 要解决什么

UVP 记录协议事实：被某条秩序授权的主体，在某个订单、某个阶段、某个凭证指纹下，声明某个业务信号已经发出，并愿意为这个声明负责。现实真实性、资质审查、担保、保险、争议裁定和监管结论，可以由对应的 trust domain、供应商、资金方、审计方或 adapter 发出自己的信号。

UVP 把复杂生产关系压缩成计算机能理解、链上能记录和追责的秩序语言。`Zhixu` 是“秩序”的拼音，在本仓库里指静态的秩序定义：谁先开始，谁负责下一步，哪个供应商能承接，什么证据算完成，失败时走哪条路。订单 (Order) 是某个秩序版本的一次运行。

秩序 DSL 是低成本的交易约定方式，区块链和智能合约是高伪造成本的记录方式。`uvp-eth` 把两者接起来，让陌生人、企业系统、AI agent、供应商、trust domain 和普通参与者，可以围绕同一套信号边界组织生产。

## 科斯定理的工程实践

UVP 的目标是成为科斯定理在 AI 时代的工程实践：不是在文档里证明理论，而是把交易成本拆成可实现的协议对象。

| 交易成本 | UVP 的工程对象 |
| --- | --- |
| 搜索成本 | Store、Supplier registry、trust projection、Product catalog。 |
| 议约成本 | Zhixu DSL、Plan、plan hash、file resources、supplier requirements。 |
| 协调成本 | Source、Signal、Hook、Trigger、Order、executor authorization。 |
| 监督成本 | evidence metadata、payload hash、metadata URI、proof row、timeline。 |
| 集成成本 | Product DTO、Chain Services、executor-kit、adapter/periphery boundary。 |
| 争议和抵赖成本 | EIP-712 签名、`SignalSubmitted`、`HookReady`、trust registry events、replayable chain proof。 |

所以 UVP 不是只讨论“AI 能干什么”，而是回答“AI、企业、人和链上状态如何在同一套可追责边界里协作”。

## `uvp-eth` 如何实现

`uvp-eth` 把秩序协作模型接到 EVM 兼容链上。它把秩序设计编译成 deterministic artifact，把计划和供应商背书交给 trust registry，把订单、signal、hook ready 和履约 proof 交给链上状态机。后端负责索引、投影、展示、转发和缓存；对象存储保存链下材料；链上保存 hash、URI、签名和事件。

```text
凝结核设计 Zhixu
  -> compiler 生成 deterministic Plan artifacts
  -> trust domain 背书 plan hash
  -> publisher 注册 Plan
  -> registrar 创建 Order 并写入 signal authorization
  -> executor 或参与者签名并提交 Signal
  -> UVPStateMachine 发出 SignalSubmitted / HookReady / status events
  -> Chain Services 从事件重建 Product 和 Store 视图
```

Chain Services 是可重建服务层：它负责索引、投影、校验、转发，并提供 Product / Store API。协议讨论里它也叫 non-trusted execution layer，意思是“它不是事实源”，不是说软件不可靠。

Funding、USDC、escrow、guarantee、settlement 可以围绕这条路径构建，但它们属于 periphery adapter。核心协议边界是协作状态机：Plans、Orders、authorizations、Signals、hooks、attestations 和可重放事件。

## 公开实现仓库

这个 Wiki 不是孤立的概念页。UVP 的 EVM/Web3 实现由这些公开仓库组成：

| 仓库 | 负责什么 |
| --- | --- |
| [uvp-protocol](https://github.com/conucleus/uvp-protocol) | Zhixu compiler、HookPlan、state-machine reference、Solidity contracts、ABI、EIP-712、Product DTO。 |
| [uvp-chain-services](https://github.com/conucleus/uvp-chain-services) | 可重建服务层：indexer、relayer、proof verifier、Product API、Store API、projection 和 workflow runtime。 |
| [zhixu-store](https://github.com/conucleus/zhixu-store) | Store / workbench 前端：Zhixu catalog、supplier registry、trust/proof 视图和 operator workflow。 |
| [uvp-order-app](https://github.com/conucleus/uvp-order-app) | 普通参与者 Order App：invite onboarding、task inbox、evidence fingerprint、proof display 和 readiness checks。 |
| [uvp-executor-kit](https://github.com/conucleus/uvp-executor-kit) | Executor CLI/SDK/MCP：executor wallet、chain watcher、Product API signal producer 和 adapter 接入。 |

本 Wiki 解释这些仓库如何拼成一条链上可证明的协作路径；具体代码、测试和运行脚本在各仓库里。

## 它不是什么

这也是 `uvp-eth` 和多方数据库一致性方案的根本区别：参与方在预先约定的秩序里，对自己发出的标准信号负责。UVP 主要降低搜索、议约、协调、监督、集成、争议和抵赖这些交易成本。

| UVP 不是 | UVP 是 |
| --- | --- |
| 不是多方数据库同步方案。 | 用链事件记录被授权业务信号及其秩序后果。 |
| 不是普通后端工作流系统。 | 后端可以投影和中继，但协议事实来自合约和链事件。 |
| 不是支付 provider、托管方、交易所或结算 rail。 | 资金、担保、USDC、escrow 和 settlement 是围绕核心状态机的 adapter。 |
| 不是把业务文件明文上链。 | 链上保存 hash、URI、签名和事件；业务材料留在链下。 |

本 Wiki 是 `uvp-eth` 的人类阅读入口。它把源码、测试、ABI fixture、PRD 记录和 release evidence 整理成一个可以按路径阅读的项目手册。

## 这个 Wiki 给谁看

| 读者 | 你能在这里学到什么 |
| --- | --- |
| 新合作方或生态读者 | UVP 为什么存在，Zhixu/Order/Signal 是什么，一条订单如何被证明。 |
| Product 或 Store 建设者 | Product DTO、Store workflow、supplier registry、proof view、operator action 如何围绕链事实工作。 |
| 协议工程师 | compiler artifacts、contracts、events、EIP-712、hashes、replay 和 public interfaces 如何拼起来。 |
| Executor 或 adapter 接入方 | Order App、executor-kit、enterprise script、AI/MCP、docked Zhixu、periphery adapter 如何提交 signal。 |
| Release owner | local Anvil、Product loop、Base Sepolia staging、状态标签和 release evidence 应该怎么读。 |

## 开始阅读

如果你第一次接触 UVP，按这个顺序读：

1. [一个订单故事](getting-started/one-order-story.md)：用一条跨境货物订单理解从秩序设计到任务 proof 的路径。
2. [角色地图](getting-started/actor-map.md)：理解 Buyer、凝结核、Store operator、Trust Domain、Registrar、Supplier、Executor、Relayer 和 Chain Services。
3. [证据与 Proof 路径](getting-started/evidence-proof-path.md)：理解私有业务文件如何变成 hash、签名 signal、链事件和 Product proof row。
4. [核心术语表](reference/glossary.md)：随时查项目术语和“不要混淆”的概念对。
5. [核心概念](core/README.md)：在故事清楚之后再读协议对象。

## 按目标选择路径

| 目标 | 接着读 |
| --- | --- |
| 先理解系统再工程 | [入门](getting-started/README.md)、[核心概念](core/README.md)、[产品语言与 DTO/API](product/README.md)。 |
| 建 Product 或 Store 界面 | [产品语言与 DTO/API](product/README.md)、[秩序商店](store/README.md)、[Order App 与 Executor Kit](concepts/architecture/components/order-app-executor-kit.md)。 |
| 改协议或 public interface | [核心组件](components/README.md)、[公共接口](reference/public-interfaces.md)、[合约与事件](reference/contracts-and-events.md)。 |
| 接入 executor、adapter 或 AI/MCP | [执行者与集成](execution/README.md)、[Executor Kit](execution/executor-kit.md)、[Periphery 与 Adapter](concepts/architecture/components/periphery-deploy.md)。 |
| 验证本地或 staging claim | [快速开始](getting-started/quick-start.md)、[Local Anvil 协议闭环](tutorials/local-anvil.md)、[Base Sepolia 预发](tasks/base-sepolia-staging.md)、[项目状态](status/README.md)。 |

完整目录见 [SUMMARY.md](SUMMARY.md)。`wiki/site/` 是静态站点生成输出，不是编辑源。
