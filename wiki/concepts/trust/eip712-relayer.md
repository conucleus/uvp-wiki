---
title: EIP-712 与 Relayer
type: explanation
audience: 工程贡献者
status: verified
---

# EIP-712 与 Relayer

Relayer 可以帮助广播交易，但不能替参与方做业务决定。业务动作必须由被授权 submitter 的钱包签名；“relayer 不是权利来源”是协议不变量之一，总述见 [协议边界](../protocol-boundaries.md)。

## Typed Data

`protocol-bindings` 定义了浏览器可用的 EIP-712 helper。`UVPStateMachine` 当前 domain：

```text
name = UVPStateMachine
version = 0.10
```

Signal 提交的 primary type 是：

```text
UVPStateMachineSignal
```

字段包括：

```text
planId
orderId
sourceId
signalId
payloadHash
idempotencyKey
submitter
deadline
```

合约的 `submitSignalFor()` 会恢复签名地址，并要求恢复出的 signer 等于 `submitter`。

## Relayer 的边界

Relayer 可以：

- 接收参与方签名。
- 组装交易。
- 支付 gas 或代为广播。
- 处理重试、nonce、RPC 故障。

Relayer 不可以：

- 伪造 submitter 签名。
- 替参与方选择业务 payload。
- 绕过订单级 signal 授权。
- 把 relayer 数据库状态当成订单状态。

## Deadline

签名带 `deadline`。过期签名不能继续提交，避免旧业务授权在很久以后被重放。

## 直接提交和转发提交

参与方也可以直接调用 `submitSignal()`，前提是 `msg.sender` 本身就是授权 submitter。转发路径使用 `submitSignalFor()`，但最终业务身份仍然是签名里的 `submitter`。
