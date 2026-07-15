# 产物与哈希

编译器把 Zhixu 定义直接编译成 EVM `OnchainHookPlanArtifact` 与 `registerPlan` 参数。旧的平台中立 HookPlan 形状只作为编译器内部 IR。每一步都使用确定性编码和稳定哈希，避免“同一份流程在不同机器上得到不同计划”。

## 本篇子项

| 子页 | 说明 |
| --- | --- |
| [编译输入](artifacts/compiler-input.md) | `ZhixuDefinition` 哪些字段进入协议产物，编译器会拒绝哪些无效形状。 |
| [Canonical Hash](artifacts/canonical-hashes.md) | `planId`、`planHash`、`hookId`、`signalKey` 等稳定哈希如何计算。 |
| [链上注册参数](artifacts/solidity-registration.md) | on-chain artifact 如何压缩成 `registerPlan` 参数。 |

## 公开产物

| 产物 | 用途 |
| --- | --- |
| `OnchainHookPlanArtifact` | 面向 EVM，使用 `bytes32` ID、stack instructions、dependency index 和 selector bindings。 |
| `registerPlan` args | 从链上产物确定性压缩出的 Solidity 注册参数。 |

`UVPStateMachine.commitPlan()` 从完整 hooks 与 metadata 承诺导出并保存 `planHash`，供 replay 和订单绑定；publisher 签名说明发布来源。`UVPIdentityRegistry` 不认证 Plan。

## 公共接口意识

ABI、event topic、EIP-712 typed data、canonical hash domain、artifact schema 都属于公共协议接口。改动这些内容时，应当按协议版本变化处理。

## Artifact 的读者

Artifact 让机器和审核者复现计划。普通用户看到的是 Product DTO；Store operator 可以看到 proof panel；协议工程师读 HookPlan、on-chain artifact 和 Solidity args。

这层分工能避免两个问题：

- 把 Store metadata 误认为 chain truth。
- 把 `hookId`、`sourceId`、`signalId` 这类协议字段塞给普通参与者。
