# 产物与哈希

编译器先把 Zhixu 定义变成平台中立的 `HookPlanArtifact`，再降到具体链目标产物。当前可运行目标是 EVM：`EvmHookPlanArtifact` 兼容旧的 `OnchainHookPlanArtifact` 名称，是合约能注册的产物。每一步都使用确定性编码和稳定哈希，避免“同一份流程在不同机器上得到不同计划”。

## 本篇子项

| 子页 | 说明 |
| --- | --- |
| [编译输入](artifacts/compiler-input.md) | `ZhixuDefinition` 哪些字段进入协议产物，编译器会拒绝哪些无效形状。 |
| [Canonical Hash](artifacts/canonical-hashes.md) | `planId`、`planHash`、`hookId`、`signalKey` 等稳定哈希如何计算。 |
| [链上注册参数](artifacts/solidity-registration.md) | on-chain artifact 如何压缩成 `registerPlan` 参数。 |

## 两层产物

| 产物 | 用途 |
| --- | --- |
| `HookPlanArtifact` | 平台中立，保留 stage 名称、hook 表达式、AST、依赖、route 和可读标签。 |
| `EvmHookPlanArtifact` / `OnchainHookPlanArtifact` | 面向 EVM，使用 `bytes32` ID、stack instructions、dependency index 和 selector bindings。 |
| `SolanaHookPlanArtifact` | 仅是预留 target 边界；在 Solana program 和 adapters 完成前不能运行。 |

合约最终检查的是链上计划哈希。`ZhixuTrustRegistry` 认证 `(domainId, planId, planHash)`，`UVPStateMachine.registerPlan()` 再检查该认证是否有效。

## 公共接口意识

ABI、event topic、EIP-712 typed data、canonical hash domain、artifact schema 都属于公共协议接口。改动这些内容时，应当按协议版本变化处理。

## Artifact 的读者

Artifact 让机器和审核者复现计划。普通用户看到的是 Product DTO；Store operator 可以看到 proof panel；协议工程师读 HookPlan、on-chain artifact 和 Solidity args。

这层分工能避免两个问题：

- 把 Store metadata 误认为 chain truth。
- 把 `hookId`、`sourceId`、`signalId` 这类协议字段塞给普通参与者。
