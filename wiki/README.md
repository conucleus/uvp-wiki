---
title: UVP：AI 时代的可证明协作协议
type: meta
audience: 全部读者
status: verified
---

# UVP：AI 时代的可证明协作协议

UVP（通用价值协议，Universal Value Protocol）是一套面向跨组织协作的协议和当前 EVM/Web3 实现。它不替任何参与方证明现实世界的全部真相，而是记录一个更窄但更关键的事实：**谁在什么授权下，围绕哪个订单和阶段，基于哪个证据指纹，签名确认了什么业务信号。**

第一次阅读只需要建立一条直觉：**秩序 (Zhixu) 是规则书，订单 (Order) 是这次运行，执行者 (Executor) 处理某一步，信号 (Signal) 是带责任的业务声明。** Plan、Hook、Source、Product DTO、ABI 等概念会在概念层展开。

## Wiki 导览

Wiki 按 Diátaxis 分为四类内容加项目元信息：

| 你想做什么 | 去哪里 |
| --- | --- |
| 第一次了解 UVP | [学习路径](tutorials/README.md)：从 [为什么需要 UVP](tutorials/why-uvp.md) 到 [一个订单故事](tutorials/one-order-story.md)，再到 [本地全闭环](tutorials/local-anvil-loop.md) |
| 理解协议对象与架构 | [核心概念](concepts/README.md)，边界总纲见 [协议边界](concepts/protocol-boundaries.md) |
| 完成一项具体任务 | [操作指南](how-to/quick-start.md)：开发、运行服务、staging、排障 |
| 查权威事实 | [参考](reference/version-matrix.md)：版本、接口、事件、CLI、术语 |

项目愿景与交易成本论证见 [whitepaper.md](https://github.com/conucleus/uvp-eth/blob/main/whitepaper.md)（主仓库根目录，wiki 站点外）与 [为什么需要 UVP](tutorials/why-uvp.md)；项目成熟度口径见 [项目状态](meta/status.md)。

## 一条订单如何留下 proof

```text
Zhixu 规则书
  -> 编译成 deterministic Plan（commitPlan + finalizePlan 两步注册）
  -> Identity Registry 登记主体与钱包
  -> 创建 Order 并写入 signal 授权
  -> 执行者提交 evidence hash 和签名 Signal
  -> UVPStateMachine 记录事件并推进 HookReady
  -> Chain Services 重建订单、任务、timeline 和 proof row
```

完整目录见 [SUMMARY.md](SUMMARY.md)。`wiki/site/` 是静态站点生成输出，不是编辑源。
