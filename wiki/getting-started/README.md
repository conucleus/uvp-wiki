# Getting Started

这个部分回答三个问题：

- 我应该先读什么？
- 我怎样确认本地环境没有坏？
- 我应该跑哪个闭环来理解项目？

推荐顺序：

1. [快速开始](quick-start.md)：安装依赖，跑 workspace 级别检查。
2. [核心概念](../concepts/overview.md)：理解项目语言。
3. [Local Anvil 协议闭环](../tutorials/local-anvil.md)：看 Zhixu 到链事件重放的完整路径。
4. [Product Local Loop](../tutorials/product-local-loop.md)：看 Product API 如何创建订单、提交任务和查询 proof。

## 先理解边界

`uvp-eth` 不是 Go UVP 仓库的移植，也不能 import 或 vendor sibling
`uvp` Go repository。它的核心边界是 EVM/Web3 track：

- 协议事实：合约状态和链事件。
- 可重建状态：indexer、Product API、Store、Order App 的读模型。
- 非核心扩展：funding、payment、escrow、guarantee、agent adapter，放在
  `uvp-periphery/`。

## 环境要求

- Node.js 20 或更新版本。
- pnpm 9.15.0。
- Foundry，用于 Solidity build/test。
- 本地链闭环需要 Anvil。
- Base Sepolia staging 需要 `~/.test_envs`，但快速开始不需要任何秘密。

不要把私钥、RPC secret、JWT key、object storage secret 写进仓库、日志或文档。
