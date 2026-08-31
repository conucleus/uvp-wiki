---
title: Getting Started
type: meta
audience: 全部读者
status: verified
---

# Getting Started

如果你已经知道 UVP 大致在解决什么，但还没有形成完整对象图，可以从这里进入。先用故事建立直觉，再读角色和术语，最后进入本地验证。

这不是概念大全。第一遍只需要建立业务直觉：一类协作被写成秩序 (Zhixu)，某一次运行是订单 (Order)，实际处理某一步的是执行者 (Executor)，推动订单继续的是信号 (Signal)。

## 推荐第一遍阅读

1. [AI 时代的协作地基](why-uvp.md)：UVP 为什么存在，它把哪些交易成本变成协议对象。
2. [一个订单故事](one-order-story.md)：用一条跨境订单理解从 Zhixu 设计到链上 proof 的路径。
3. [核心概念](../concepts/README.md)：故事清楚之后，再按层级读协议对象总览。
4. [核心术语表](../reference/glossary.md)：项目术语和关键概念对。

## 第二遍阅读

完成第一遍之后，再进入工程路径：

1. [Plan 与订单生命周期](../concepts/lifecycle.md)：用同一条订单看 Store、compiler、Identity Registry、state machine、Chain Services、Order App 和 executor-kit 的位置。


2. [架构总览](../concepts/architecture.md)：看模块边界、依赖方向、事实源和数据流。

## 工程第一遍

完成概念阅读之后，用这些页面确认本地工作区：

1. [快速开始](../how-to/quick-start.md)：安装依赖，跑 workspace 级别检查。
2. [Local Anvil 协议闭环](local-anvil-loop.md)：先看 Zhixu 到链事件 replay 的完整路径，再在同一页末尾接着跑 Product 本地表面。
3. [项目状态](../meta/status.md)：确认哪些是 verified、prototype、planned 或 blocked。

## 环境要求

- Node.js 20 或更新版本。
- pnpm 9.15.0。
- Foundry，用于 Solidity build/test。
- 本地链闭环需要 Anvil。
- Base Sepolia staging 需要 `~/.test_envs`，但快速开始不需要任何秘密。

不要把私钥、RPC secret、JWT key、object storage secret 写进仓库、日志或文档。
