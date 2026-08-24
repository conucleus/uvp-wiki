---
title: 身份、发布与授权
type: meta
audience: 协议读者
status: verified
---

# 身份、发布与授权

UVP 把身份解析、Plan 发布与订单级动作授权拆开：Registry 说明“这个钱包在线下是谁”，publisher 的 EIP-712 签名说明“谁发布了这份不可变规则”，订单级授权说明“谁能在这个 Order 里提交哪个动作”——三者不能互相推出，任何一层都不能被更上层剥离；完整边界表述见 [协议边界](../protocol-boundaries.md)。

## 本篇子项

| 子页 | 说明 |
| --- | --- |
| [Identity Registry](domains.md) | Store 运营的身份解析域：subject 与钱包绑定及撤销的含义。 |
| [Signal 授权](signal-authorization.md) | 订单级显式授权与 Executor patch 动态委任。 |
| [EIP-712 与 Relayer](eip712-relayer.md) | 业务签名的 typed data 形态，以及 relayer 只广播不决策的边界。 |
| [Stage Patch 授权](stage-patch.md) | executor/resource patch 如何复用订单级授权模型。 |
