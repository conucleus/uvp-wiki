# Relayer

Relayer 是非可信执行层里的 gas payer 和交易广播器。它可以替用户把已经签好的业务 payload 广播到链上，也可以记录 retry、confirmation 和 failure；但它不能替 buyer、seller、executor、executor 或 selector 生成业务签名。

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

## 不能做什么

- 不能创建业务签名。
- 不能替换 signer、order id、stage id、source id、signal id、evidence hash、nonce 或 deadline。
- 不能用 relayer wallet 冒充 submitter。
- 不能把“广播成功”写成“履约完成”；只有链上事件和状态机求值能产生完成或 ready 状态。
- 不能持久保存用户私钥。

## Testnet 约束

Base Sepolia / testnet runtime 必须使用明确配置的 relayer gas-payer key env，并禁用 demo/permissive fallback。preflight 失败时服务应该 fail-closed，而不是降级成内存模式或静默跳过广播。
