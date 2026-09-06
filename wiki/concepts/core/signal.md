---
title: Signal
type: explanation
audience: 协议读者
preread: ../README.md
status: verified
---

# Signal

> 前置阅读：[核心概念](../README.md)
Signal 是订单状态机接受的最小业务输入。它代表“某个被授权的钱包，对某个订单，提交了某类动作或凭证指纹”。

## 谁使用

被授权的 submitter（参与方钱包、executor、adapter）提交 signal；合约校验并记录；Product/Store/executor-kit 把 `SignalSubmitted` 投影成任务完成状态和 proof row。

## 产生什么结果

一次成功提交写入不可变的 `SignalRecord` 并发出 `SignalSubmitted`；它推动依赖该 signal 的 [Hook](hook.md) 求值，可能触发 `HookStatusChanged` 或 `HookReady`。

## 权威来自哪里

signal 的有效性由合约按 `(planId, orderId, signalKey, submitter)` 授权检查决定；payload 只上哈希，业务含义由 Zhixu、stage protocol 和 Product DTO 解释。`orderId` 不是全局主键，任何读取都必须保留所属 `planId`。

## Signal 在 DSL 里的位置

Zhixu stage 里有两处和 signal 直接相关：

| 字段 | 含义 |
| --- | --- |
| `receiveSignals` | 当前 stage 等待哪些输入 signal。每个 key 会编译成一个 [Hook](hook.md)。 |
| `sendSignals` | 当前 stage 执行后可能发出哪些输出 signal。 |

例如一个买方承诺 stage：

```yaml
buyer_commit:
  source: buyer
  receiveSignals:
    OFFER_READY: commercial::master.commercial_offer.cmp
  sendSignals:
    - cmp
    - cxl
    - err
```

含义是：商业报价完成后，买方承诺阶段 ready；该阶段后续可能发出 `cmp`、`cxl` 或 `err`，供后续 hook 消费。

## 文本名到链上 key

在 Hook DSL 里，signal 通常写成：

```text
task.stage.signal
```

在合约里，它会变成三个稳定标识：

```text
sourceId = keccak256(source)
signalId = keccak256(signalName)
signalKey = keccak256(abi.encode(sourceId, signalId))
```

`source` 表示因果语境，也就是这个动作被放进哪条可追踪链路里，详见 [Source 因果链](source.md)。角色、供应商或系统入口可以是提交者或业务解释的一部分，但链上 signal key 由 `source` 和 `signalName` 决定。`signalName` 表示具体动作名，合约最终按 `signalKey` 去重和查依赖。

## 常见 Signal 名称约定

常见名称约定包括 str、cmp、err、cxl、pass、fail，以及用于否决场景的 reject：

| 名称 | 常见含义 |
| --- | --- |
| `str` | start，执行者开始或接单。 |
| `cmp` | complete，阶段完成。 |
| `err` | error，阶段异常。 |
| `cxl` | cancel，取消。 |
| `pass` | 验证通过。 |
| `fail` | 验证失败。 |
| `reject` | 业务拒绝。 |

具体含义仍由 Zhixu、stage protocol、Product DTO 和业务证据解释。合约只认 `signalId` 和授权。

## First Writer Wins

协议边界总览见 [Protocol Boundaries](../protocol-boundaries.md)。

同一个订单里，同一个 `signalKey` 只能成功提交一次：

- 第一次提交会写入 `SignalRecord` 并发出 `SignalSubmitted`。
- 后续重复提交会因为 `SignalAlreadyExists` 回滚。
- 第一次成功写入就是该 `(planId, orderId, sourceId, signalId)` 的最终链上事实，不提供覆盖、撤销或管理员改写入口。

`idempotencyKey` 会保存在事件和投影里，方便服务层识别请求来源；但合约语义上的去重键是 `(planId, orderId, sourceId, signalId)`。

首次提交错误时，应从 Zhixu 创建新的 Order 重新提交。原 Signal 不可修改，旧 Order 仍作为可审计事实保留。

## Payload 只上哈希

合约不保存合同、发票、物流、车辆、照片、审批文件等业务明文。业务证据应放在链下，链上只保存：

| 字段 | 含义 |
| --- | --- |
| `payloadHash` | 证据或动作 payload 的哈希。 |
| `metadataURI` | 如果需要，可在投影或 adapter 里指向链下 metadata。 |
| `submitter` | 被授权的钱包地址。 |
| `submittedAt` | 链上记录时间。 |

这条边界很重要：链提供可验证顺序和权限，不提供业务文件存储。

### 编码约定：payloadHash = bytes32(0) 表示无载荷

`payloadHash` 是必填的 `bytes32` 字段，但并非每次提交都有业务载荷。协议规定：

- `payloadHash = bytes32(0)`（即 `0x0000…0000`）是合法的协议常量，含义是「本次 signal 没有对应载荷」，不是缺失数据或错误状态。
- 有载荷时，`payloadHash` 必须是链下 payload 规范化后的哈希；投影与消费方据此区分「有证据」与「纯动作/状态类 signal」。
- 这是编码约定而非占位兜底：提交侧在无载荷时应显式写 `bytes32(0)`；消费方读到零值时按「无载荷」展示，而不是当作未知或报错。

## 授权是链上检查项

Product API 可以把某个任务显示给某个参与方，但最终能否提交仍由合约检查：

```text
planId + orderId + signalKey + submitter
```

授权可以来自 Order 创建时的显式授权，也可以来自有效 Executor patch 对 Plan 预声明 `sendSignals` 范围的动态委任，详见 [Signal 授权](../trust/signal-authorization.md)。两种路径都由合约检查；即使 UI 显示了按钮，没有有效授权仍会被拒绝。

## Signal 的协议边界

一个 signal 表示“某个授权动作发生了”。供应商内部工作流、采购过程、融资过程或 AI 推理过程可以保存在 evidence、metadata URI 或 supplier 系统里；UVP 核心只验证授权、签名、payload hash 和事件证明。链上事实源、明文不上链、relayer 不签名等全站不变量总览见 [Protocol Boundaries](../protocol-boundaries.md)。
