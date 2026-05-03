# 信任与授权

`uvp-eth` 把“谁认可计划”和“谁能提交某个订单动作”分开处理。计划可信度来自 `ZhixuTrustRegistry` 的 trust domain 认证；订单动作权限来自 `UVPStateMachine` 的订单级 signal 授权和参与方 EIP-712 签名。

## 本篇子项

| 子页 | 说明 |
| --- | --- |
| [Trust Domain](trust/domains.md) | 官方域、计划认证、供应商认证、撤销和投影。 |
| [Signal 授权](trust/signal-authorization.md) | 订单注册时如何绑定 source/signal/submitter 权限。 |
| [EIP-712 与 Relayer](trust/eip712-relayer.md) | 为什么 relayer 可以提交交易但不能生成业务签名。 |
| [Stage Patch 授权](trust/stage-patch.md) | executor/resource patch 如何复用订单级授权并加上 selector binding。 |

## 三层校验

| 层 | 解决的问题 |
| --- | --- |
| Trust domain | 这个 plan 或 supplier 是否被某个信任域认可。 |
| Publisher / registrar allowlist | 谁可以注册计划、谁可以注册订单。 |
| Order-level signal authorization | 某个订单里，哪个钱包可以提交哪个 source/signal。 |

这三层不是互相替代的关系。计划被认证，不代表任何人都能注册订单；订单已注册，也不代表任意钱包能提交 signal；relayer 有交易能力，也不代表它拥有业务签名权。

## Supplier Trust 不是 Signal 授权

Supplier trust 只说明某个 trust domain 背书了某个 supplier subject。它可以影响 Store 推荐、Product 警告、BFF 创建授权时的准入判断、executor-kit 是否 fail closed。它不等于 `submitSignal()` 权限。

真正的提交权限永远落在订单级：

```text
orderId + sourceId + signalId + submitter
```

这个边界能避免“某个供应商被 Store 打了 customs 标签，就能提交所有报关订单”的错误。
