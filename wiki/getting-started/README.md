# Getting Started

这个部分回答三个问题：

- 我应该先读什么？
- 我怎样确认本地环境没有坏？
- 我应该跑哪个闭环来理解项目？

推荐顺序：

1. [一个订单故事](one-order-story.md)：先用一条跨境订单理解秩序、Plan、订单、signal、proof。
2. [核心术语表](../reference/glossary.md)：统一“秩序 (Zhixu)”和“订单 (Order)”等专有名词。
3. [快速开始](quick-start.md)：安装依赖，跑 workspace 级别检查。
4. [核心概念](../concepts/overview.md)：理解项目语言。
5. [Local Anvil 协议闭环](../tutorials/local-anvil.md)：看秩序到链事件重放的完整路径。
6. [Product Local Loop](../tutorials/product-local-loop.md)：看 Product API 如何创建订单、提交任务和查询 proof。

## 先理解对象

`uvp-eth` 是 UVP 的 EVM/Web3 track，核心对象按这条线组织：

- 静态设计：秩序 (Zhixu)、HookPlan、OnchainHookPlan、Plan。
- 动态运行：订单 (Order)、signal、hook runtime、stage overlay、proof。
- 背书与授权：trust domain、plan/supplier attestation、order-level signal authorization。
- 产品读模型：indexer、Product API、Store、Order App。
- 外围扩展：funding、payment、escrow、guarantee、agent adapter，放在
  `uvp-periphery/`。

工程边界也很明确：这个仓库不 import 或 vendor sibling `uvp` Go repository；协议事实来自合约状态和链事件；读模型必须能从事件重建。

## 环境要求

- Node.js 20 或更新版本。
- pnpm 9.15.0。
- Foundry，用于 Solidity build/test。
- 本地链闭环需要 Anvil。
- Base Sepolia staging 需要 `~/.test_envs`，但快速开始不需要任何秘密。

不要把私钥、RPC secret、JWT key、object storage secret 写进仓库、日志或文档。
