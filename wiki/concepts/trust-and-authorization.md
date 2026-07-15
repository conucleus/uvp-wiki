# 身份、发布与授权

UVP 把三件容易混淆的事彻底拆开：Registry 说明“这个钱包在线下是谁”；Plan publisher 的签名说明“谁发布了这份不可变规则”；订单级授权说明“谁能在这个 Order 里提交哪个动作”。三者不能互相推出。

| 层 | 权利或事实 | 来源 | 能否被更上层剥离 |
| --- | --- | --- | --- |
| Identity Registry | Store 默认目录中的身份解析。 | Registry owner 写入的 binding。 | owner 可撤销目录解析，但不能抹掉历史或链上钱包本身。 |
| Plan publication | 发布一个确定 hooks + metadata 的 Plan。 | publisher 的 EIP-712 签名。 | relayer 不能修改；合约 owner 冻结 module 后也不能换实现。 |
| Order creation | 用已 finalized Plan 创建 Order。 | creator/submitter 签名与 trigger payload。 | 任意 relayer 可广播；Store 不能垄断入口。 |
| Signal submission | 提交具体 source/signal。 | 订单显式授权、active executor overlay 与签名。 | Registry 撤销不能追溯剥离。 |

## Relayer 不是权利来源

Plan 和 Order 都允许任意 relayer 代发。relayer 只支付 gas、传播签名内容，不拥有 publisher、creator 或 submitter 的业务权利。合约校验签名、deadline、hash 和 nonce/idempotency 约束。

## Store 标签不是协议授权

Store 可以维护 customs、logistics 等能力标签和水下匹配特征，但这些字段既不上 `UVPIdentityRegistry`，也不会自动变成 `SignalSubmitterAuthorized`。这避免 Store 的商业判断扩张成协议层撮合责任。

## 子页

- [Identity Registry](trust/domains.md)
- [Signal 授权](trust/signal-authorization.md)
- [EIP-712 与 Relayer](trust/eip712-relayer.md)
- [Stage Patch 授权](trust/stage-patch.md)
