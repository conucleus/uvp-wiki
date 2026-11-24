---
title: 身份、发布与授权
type: meta
audience: 协议读者
status: verified
---

# 身份、发布与授权

UVP 把身份解析、Plan 发布与订单内动作权限拆开：`UVPIdentityRegistry` 说明“这个钱包在线下是谁、这个 supplier account 是否 active”，publisher 的 EIP-712 签名说明“谁发布了这份不可变规则”，阶段 assigned supplier account 说明“谁能在这个 Order 里提交动作”——三者不能互相推出，任何一层都不能被更上层剥离；完整边界表述见 [协议边界](../protocol-boundaries.md)。

发信权由 source 阶段的 assigned supplier account 承载（计划 default supplier → 订单级 stage supplier patch → dock 一次性选择），由合约在 `submitSignal` 入口实时解析 `accountOf(supplierId)` 并校验 SID `active`。

## 本篇子项

| 子页 | 说明 |
| --- | --- |
| [Identity Registry](domains.md) | Store 运营的身份解析域：subject 与钱包绑定，以及 supplier capability/account 命名空间。 |
| [EIP-712 与 Relayer](eip712-relayer.md) | 业务签名的 typed data 形态，以及 relayer 只广播不决策的边界。 |
| [Stage Patch 授权](stage-patch.md) | stage supplier patch 与阶段文件写入如何复用 assigned supplier 授权模型。 |
