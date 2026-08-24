---
title: Relayer
type: explanation
audience: 工程贡献者
status: verified
---

# Relayer

Relayer 是可重建服务层里的 gas payer 和交易广播器。它把已经签好的业务 payload 广播到链上，也记录 retry、confirmation 和 failure；业务签名来自 buyer、seller、executor 或 selector 自己的钱包。

## 代码入口

| 文件 | 职责 |
| --- | --- |
| `src/relayer/service.ts` | relayer 运行入口和广播逻辑。 |
| `src/relayer/types.ts` | relayer request、result、status 类型。 |
| `src/submissions/broadcast-adapter.ts` | 抽象广播适配器。 |
| `src/submissions/safe-broadcast-adapter.ts` | 安全广播封装，避免把未验证 payload 直接送链。 |
| `src/config/preflight.ts` | runtime env、relayer key、broadcast flag 的 fail-closed 检查。 |

## 交易边界

```text
participant signs EIP-712 payload
  -> Product API / submission route verifies structure and signer context
  -> relayer pays gas and broadcasts tx
  -> submission/reconcile tracks tx status
  -> indexer sees emitted chain event
```

Relayer key 只代表 gas payer，不代表业务主体。业务动作的 authority 来自 EIP-712 签名、order-level signal authorization、active executor overlay 或 selector patch authorization。

## 可以做什么

- 广播已签名 payload。
- 处理 RPC error、nonce conflict、replacement、retry 和 confirmation。
- 在 broadcast disabled profile 下记录 `broadcast_disabled`，用于本地或 staging 验证。
- 输出 redacted diagnostics，帮助 release gate 判断 relayer runtime 是否配置正确。

## 权限边界

- 业务签名由授权参与方创建。
- signer、order id、stage id、source id、signal id、evidence hash、nonce 和 deadline 来自已签 payload。
- relayer wallet 只代表 gas payer，不代表 submitter。
- “广播成功”是交易状态；履约完成和 ready 状态来自链上事件和状态机求值。
- 用户私钥留在用户侧或密钥系统中。

## Testnet 约束

Base Sepolia / testnet runtime 必须使用明确配置的 relayer gas-payer key env，并禁用 demo/permissive fallback。preflight 失败时服务应立即 fail-closed，不降级为内存模式，也不静默跳过广播。完整的 testnet fail-closed 清单见 [Storage、Migration 与 Runtime Profile](storage-runtime.md)。
