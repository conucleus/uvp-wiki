---
title: EIP-712 与 Relayer
type: explanation
audience: 工程贡献者
status: verified
---

# EIP-712 与 Relayer

Relayer 可以帮助广播交易，但不能替参与方做业务决定。业务动作必须由被授权 submitter 的钱包签名；“relayer 不是权利来源”是协议不变量之一，总述见 [协议边界](../protocol-boundaries.md)。

## Typed Data

`protocol-bindings` 定义了浏览器可用的 EIP-712 helper。各域版本以 `uvp-deploy/deploy/compatibility/uvp-stack.v1.json` 为唯一机械对照：

```text
UVPStateMachine（productSubmit）  version = 0.17
UVPOrderLinkModule               version = 0.8
UVPDerivedSignalModule           version = 0.6
UVPStagePatchModule              version = 0.4
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
filesDigest
```

Signal 提交走 direct `submitSignal`，业务身份是 `msg.sender`；`submitter` 字段出现在 `UVPStateMachineSignal` 签名信封中，产品提交签名按所部署合约的域版本构造 typed data。

`submitSignal` 的调用尾部可携带 `attribution`（sourceId、signalId、stageId、capabilityProof）、`filesDigest` 与 `FilePatch`（阶段文件 patch）：attribution 全零表示不声明——plan 声明了能力词表时，提交词表外事实未携证即必拒（revert `InvalidSignalCapability`），仅零词表 plan 放行。这些尾参不进入 EIP-712 签名信封，typehash 与签名摘要保持不变。

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

## Direct 提交

参与者直接调用 `submitSignal()`，业务身份是 `msg.sender`（授权 submitter）。contract executor 可由 relayer / keeper 代付调用其 own `submitSignal`，到状态机时 `msg.sender` 仍是该执行者。
