# Getting Started

这一节是首页之后的学习路径。它面向已经理解 UVP 为什么重要、但还需要从故事、角色、术语一路走到本地验证的读者。

## 推荐第一遍阅读

1. [一个订单故事](one-order-story.md)：用一条跨境订单理解从 Zhixu 设计到链上 proof 的路径。
2. [角色地图](actor-map.md)：谁在行动、在哪里行动、哪条事件证明这个事实。
3. [证据与 Proof 路径](evidence-proof-path.md)：私有证据如何变成 hash、签名 signal 和 proof row。
4. [核心术语表](../reference/glossary.md)：项目术语和“不要混淆”的概念对。
5. [核心概念](../core/README.md)：故事清楚之后再读协议对象。

## 工程第一遍

完成概念阅读之后，用这些页面确认本地工作区：

1. [快速开始](quick-start.md)：安装依赖，跑 workspace 级别检查。
2. [Local Anvil 协议闭环](../tutorials/local-anvil.md)：看 Zhixu 到链事件 replay 的完整路径。
3. [Product 本地闭环](../tutorials/product-local-loop.md)：看 Product API 创建订单、提交任务和查询 proof。
4. [项目状态](../status/README.md)：确认哪些是 verified、prototype、planned 或 blocked。

## 环境要求

- Node.js 20 或更新版本。
- pnpm 9.15.0。
- Foundry，用于 Solidity build/test。
- 本地链闭环需要 Anvil。
- Base Sepolia staging 需要 `~/.test_envs`，但快速开始不需要任何秘密。

不要把私钥、RPC secret、JWT key、object storage secret 写进仓库、日志或文档。
