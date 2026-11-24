---
title: EIP-712 与 Relayer
type: explanation
audience: 工程贡献者
status: verified
---

# EIP-712 与 Relayer

Relayer 可以帮助广播交易，但不能替参与方做业务决定。业务动作必须由 assigned supplier account 的钱包签名；“relayer 不是权利来源”是协议不变量之一，总述见 [协议边界](../protocol-boundaries.md)。

## Typed Data

`protocol-bindings` 定义了浏览器可用的 EIP-712 helper。各域版本以 `uvp-deploy/deploy/compatibility/uvp-stack.v1.json` 为唯一机械对照：

```text
UVPStateMachine（productSubmit）  version = 1
UVPDerivedSignalModule           version = 1
UVPStagePatchModule              version = 1
```

Signal 提交的 primary type 是 `UVPStateMachineSignalSubmission`（11 字段）：

```text
UVPStateMachineSignalSubmission(
  bytes32 planId,
  bytes32 orderId,
  bytes32 sourceId,
  bytes32 signalId,
  bytes32 payloadHash,
  bytes32 idempotencyKey,
  bytes32 targetStageId,
  bytes32 filesHash,
  bytes32 attributionHash,
  address submitter,
  uint256 deadline
)
```

域是 `EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)`，name `UVPStateMachine`、version `1`。`filesHash = keccak256(abi.encode(StageFile[]))`，`attributionHash = keccak256(abi.encode(FactAttribution(bytes32 sourceId,bytes32 signalId,bytes32 stageId,bytes32[] capabilityProof)))`；二者都在 typehash 内。`StageFile` 是 `{string key; bytes payload}`。

Plan 注册的 primary type 是 `UVPStateMachinePlanCommit`：

```text
UVPStateMachinePlanCommit(
  address publisher,
  bytes32 hooksHash,
  bytes32 capabilitiesRoot,
  bytes32 supplierBindingsRoot,
  bytes32 fileWritersHash,
  uint256 deadline
)
```

## Relayer 的边界

Relayer 可以：

- 接收参与方签名。
- 组装交易。
- 支付 gas 或代为广播。
- 处理重试、nonce、RPC 故障。

Relayer 不可以：

- 伪造 submitter 签名。
- 替参与方选择业务 payload。
- 绕过 assigned supplier account 发信权。
- 把 relayer 数据库状态当成订单状态。

## Deadline 与两种提交形态

签名带 `deadline`。过期签名不能继续提交，避免旧业务授权在很久以后被重放。

- **直连提交**：`signature.length == 0`，`msg.sender` 必须等于 `submission.submitter`。
- **签名代付**：`signature.length > 0`，`msg.sender` 仅作 relayer；`submission.submitter` 须对 `UVPStateMachineSignalSubmission` 签名（`submitSignal` 支持 EOA ECDSA 与 ERC-1271 合约账户签名；`commitPlan` 及各模块入口仅支持 EOA ECDSA）。`SignalSubmitted` 事件同时记录 `submitter` 与 `relayer`。

无论哪种形态，`submitter` 都必须是 source 阶段（出生时是出生阶段）当前生效的 assigned supplier account，且该 SID 必须 `active`。
