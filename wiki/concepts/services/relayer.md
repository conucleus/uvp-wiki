---
title: Relayer
type: explanation
audience: 工程贡献者
status: verified
---

# Relayer

Relayer 是协议参与方**角色**，不是独立服务：它是 gas payer 和交易广播者，把参与方已经签好的业务 payload 广播到链上；业务签名始终来自 buyer、seller、executor 或 selector 自己的钱包。chain-services 里没有单独的 relayer 服务进程或 `src/relayer/` 模块——广播能力作为装配件内嵌在各提交链路中。

## 谁在承担

| 承担点 | 职责 |
| --- | --- |
| `src/submissions/broadcast-adapter.ts`、`src/submissions/safe-broadcast-adapter.ts` | Product signal 提交的广播适配器与安全封装，避免把未验证 payload 直接送链。 |
| `src/stage-patches/broadcast-adapter.ts` | selector 签名 stage patch 的广播装配件。 |
| `src/product/query/bff/` 的 order trigger broadcast adapter | order registration 的链上触发广播。 |
| `src/shared/broadcast/`、`src/config/preflight.ts` | 共享广播套件，以及 runtime env、relayer key、broadcast flag 的 fail-closed 检查。 |

## 交易边界

```text
participant signs EIP-712 payload
  -> Product API / submission route verifies structure and signer context
  -> relayer (broadcast adapter) pays gas and broadcasts tx
  -> submission/reconcile tracks tx status
  -> indexer sees emitted chain event
```

Relayer key 只代表 gas payer，不代表业务主体。业务动作的 authority 来自 EIP-712 签名、order-level signal authorization、active executor overlay 或 selector patch authorization。

## 广播适配器语义

广播适配器是显式声明，不是缺省能力：

- 非 local 环境、或 `UVP_STATE_MACHINE_RELAYER_BROADCAST_ENABLED=true` 时缺少广播适配器：服务启动即抛出配置错误——不会半配置运行。
- local 运行且未配置广播适配器时，submit 返回 `broadcastStatus: "not_attempted"`：不占 nonce，audit 把该次提交记为 skipped。这是显式的 local dry-run 语义，不是静默成功。
- `broadcast_disabled` 不是能力档位；它只描述上述 local dry-run 语义。

## 可以做什么

- 广播已签名 payload。
- 处理 RPC error、nonce conflict、replacement、retry 和 confirmation。
- 输出 redacted diagnostics，帮助 release gate 判断 relayer runtime 是否配置正确。

## 权限边界

- 业务签名由授权参与方创建。
- signer、order id、stage id、source id、signal id、evidence hash、nonce 和 deadline 来自已签 payload。
- relayer wallet 只代表 gas payer，不代表 submitter。
- “广播成功”是交易状态；履约完成和 ready 状态来自链上事件和状态机求值。
- 用户私钥留在用户侧或密钥系统中。

## Testnet 约束

Base Sepolia / testnet runtime 必须使用明确配置的 relayer gas-payer key env。preflight 失败时服务应立即 fail-closed，不降级为内存模式，也不静默跳过广播。完整的 testnet fail-closed 清单见 [Storage、Migration 与 Runtime Profile](storage-runtime.md)。
