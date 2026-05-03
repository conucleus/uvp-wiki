# uvp-eth Wiki

在 AI 时代，干活的成本正在快速下降；但交易成本没有自动消失。知道该和谁交易、怎么约定、谁该接着干、谁有权确认、确认之后承担什么后果，仍然是跨组织协作里最昂贵的部分。

一个人配上 AI 可以拥有更强的执行能力，但那仍然只是“我能干活”。UVP 要提供的不是另一个 agent，也不是替各方判断现实世界真相的裁判，而是一套标准化信号容器：谁被授权发出什么信号，信号绑定哪个订单、阶段、证据指纹和签名，发出后进入什么秩序后果。

UVP 不二重验证“货物客观上是否已经到港”或“某个企业内账是否一致”。UVP 记录的是协议事实：被该秩序授权的主体，在该订单、该阶段、该凭证指纹下，声明某个业务信号已经发出，并愿意为这个声明负责。现实真实性、资质审查、担保、保险、争议裁定和监管结论，可以由对应的 trust domain、供应商、资金方、审计方或 adapter 发出自己的信号，但不能混成一个平台后台说了算。

UVP 做的是把复杂生产关系压缩成计算机能理解、链上能记录和追责的秩序语言。凝结核把一类协作设计成 Zhixu：谁先开始，谁负责下一步，哪个供应商能承接，什么证据算完成，失败时走哪条路。Zhixu DSL 是低成本的交易约定方式，区块链和智能合约是高伪造成本的记录方式；`uvp-eth` 把两者接起来，让陌生人、企业系统、AI agent、供应商、验证者和普通参与者，可以围绕同一套信号边界组织生产。

`uvp-eth` 是这套机制的 EVM-native 实现轨道。它不是普通后端订单系统，也不是“状态机文档”。它把秩序设计编译成 deterministic artifact，把计划和供应商背书交给 trust registry，把订单、signal、hook ready 和履约 proof 交给链上状态机。我们的后端可以索引、投影、展示、转发和缓存，但不能成为协议事实源；对象存储可以保存链下材料，但链上只认 hash、URI、签名和事件。

这也是 `uvp-eth` 和多方数据库一致性方案的根本区别：UVP 不要求参与方先证明各自系统状态一致，才允许协作继续。它要求参与方在预先约定的秩序里，对自己发出的标准信号负责。它降低的不是所有风险，而是搜索、议约、协调、监督、集成、争议和抵赖这些交易成本。

本 Wiki 是 `uvp-eth` 的人类阅读入口。它不替代源码、测试、ABI fixture 或 PRD 记录，而是把这些材料整理成一个可以按路径阅读的项目手册。

## 一句话

```text
凝结核设计 Zhixu
  -> Supplier / Executor 能力网络
  -> deterministic HookPlan / OnchainHookPlan artifacts
  -> ZhixuTrustRegistry plan attestation
  -> UVPStateMachine plan/order/signal/hook events
  -> Store 凝结核工作台、trust 校验、履约视图和平台 workflow
  -> 非可信执行层 / chain-services replayed projections
  -> Product DTOs
  -> Store / Order App / executor-kit / docked Zhixu
```

核心原则只有一个：合约和链事件是协议事实源。后端服务、Store 元数据、演示适配器、对象存储和前端缓存都只能投影、索引、展示、中继或保存链下材料，不能替代链上事实。UVP 不把链上记录写成现实真相本身；它记录的是授权主体发出的可追责信号，以及这个信号在 Zhixu 约定中的后果。

## 工程团队先读

如果只想快速进入工程工作流：

1. 读 [项目状态](status/README.md)，先知道哪些已验证、哪些只是 prototype。
2. 跑 [快速开始](getting-started/quick-start.md)，确认工作区可构建。
3. 读 [核心概念](core/README.md)，理解 Zhixu、凝结核、Supplier、Executor、Source/Signal/Hook/Trigger、File Resources、Plan、Order。
4. 读 [核心组件](components/README.md)，理解 compiler、contracts、state machine、非可信执行层、Product DTO 和 deploy。
5. 做 Store 相关工作时读 [秩序商店](store/README.md)。
6. 做执行者、adapter、AI/MCP 或 peer Zhixu 接入时读 [执行者与集成](execution/README.md)。
7. 按用户产品面进入 [产品与执行面](product/README.md)。
8. 改 public boundary 前读 [公共接口](reference/public-interfaces.md)。

## 文档结构

- [入门](getting-started/README.md)：读者入口、快速开始和当前项目状态。
- [核心概念](core/README.md)：Zhixu、凝结核、Supplier、Executor、Source/Signal/Hook/Trigger、
  File Resources、Plan、Order，以及 trust/authorization 这些协议对象关系。
- [核心组件](components/README.md)：hook-core、compiler、protocol-bindings、
  artifacts/hash、contracts/registries、state machine/replay、非可信执行层、Product DTO、deploy/release。
- [秩序商店](store/README.md)：Store 如何给凝结核提供工作台，并组织 Zhixu/Supplier、trust 校验、
  履约/proof 视图、联系通知、配置发布、平台 workflow 和 audit。
- [执行者与集成](execution/README.md)：executor-kit、Order App、enterprise script、
  AI/MCP adapter、docked Zhixu、periphery adapter 的执行入口。
- [产品与执行面](product/README.md)：Product DTO/API、Signal Container、
  Order App 和 ordinary Product UI。
- [本地 / 预发 / 发布](tasks/development.md)：开发任务、Anvil、Base Sepolia、
  release evidence 和排障。
- [参考与证据](reference/public-interfaces.md)：公共接口、合约事件、Product API、
  CLI/config、release claim 语言。
- [贡献规则](contribute/documentation-rules.md)：如何更新 Wiki 而不污染协议边界。

完整目录见 [SUMMARY.md](SUMMARY.md)。`wiki/site/` 是静态站点生成输出，不是编辑源。

## 项目当前状态

截至本 Wiki 整理时，仓库已经包含并在不同程度上被测试或 staging evidence 支撑：

- deterministic compiler、HookPlan 和 EVM-facing OnchainHookPlan artifact；
- `UVPStateMachine`、`ZhixuTrustRegistry` 和 `UVPDeploymentRegistry` 合约；
- 显式 order-level signal submitter authorization；
- first-writer-wins signal、hook 状态、timer 和 `HookReady` 事件；
- 从链事件重放 Product order/task/proof/trust projection 的非可信执行层 / chain-services；
- Store Console、Store workbench、Order App、executor-kit Product API/chain CLI；
- `supplierType=zhixu` / `signalMap` 编译语义和 Africa MRO docked execution demo；
- local Anvil、Product local Anvil、Base Sepolia rehearsal 和 release gate 脚本；
- periphery 目录，用于 funding、guarantee、payment、agent 等适配器和演示。
- Base Sepolia `0.2` Product/Store staging evidence，包含 managed Postgres/R2/JWT
  的 2026-05-01 记录，以及 2026-05-02 local Docker Postgres release-candidate
  rehearsal 记录。

仍需谨慎表述的内容：

- Base Sepolia rehearsal 是 testnet/staging 证据，不等于生产可用。
- Store 元数据、联系信息、通知状态、审核状态、履约记录视图和 Product BFF 状态不是协议事实源。
- Store admin 不是凝结核，也不是 trust domain；它不替凝结核治理 Zhixu 内部，不直接判定公平可信。
- USDC、escrow、guarantee、settlement 只能作为 periphery adapter 存在。
- 任何未被代码、测试或 release evidence 支撑的 PRD 都不能写成已实现能力。
- `uvp-order-app` 尚未被同一条 Base Sepolia Product API 真实任务流完整证明。
- managed Postgres 当前头部状态仍需要 quota 恢复后的 fresh managed run 才能重新声明。

## 最短工程路线

1. 读 [项目状态](status/README.md)，不要把 prototype 或 planned 写成 verified。
2. 跑 [快速开始](getting-started/quick-start.md)，确认本地依赖和合约检查。
3. 读 [核心概念](core/README.md) 和 [核心组件](components/README.md)，明确对象和实现组件的分工。
4. 跑 [Local Anvil 教程](tutorials/local-anvil.md)，看协议语义闭环。
5. 跑 [Product 本地闭环](tutorials/product-local-loop.md)，看 Product DTO、签名、提交和 proof。
6. Store 相关工作先读 [秩序商店](store/README.md)。
7. 执行者、adapter、MCP 或子秩序接入先读 [执行者与集成](execution/README.md)。
8. 准备 staging 前读 [Base Sepolia Staging](tasks/base-sepolia-staging.md) 和
   [发布与验证](operations/release-and-verification.md)。
