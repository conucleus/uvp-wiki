# Signal

Signal 是订单状态机接受的最小业务输入。它代表“某个被授权的钱包，对某个订单，提交了某类动作或凭证指纹”。

## Signal 在 DSL 里的位置

Zhixu stage 里有两处和 signal 直接相关：

| 字段 | 含义 |
| --- | --- |
| `receiveSignals` | 当前 stage 等待哪些输入 signal。每个 key 会编译成一个 hook。 |
| `sendSignals` | 当前 stage 执行后可能发出哪些输出 signal。 |

例如一个买方承诺 stage：

```yaml
buyer_commit:
  source: buyer
  trigger:
    - OFFER_READY
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

`source` 表示因果语境，也就是这个动作被放进哪条可追踪链路里。角色、供应商或系统入口可以是提交者或业务解释的一部分，但链上 signal key 由 `source` 和 `signalName` 决定。`signalName` 表示具体动作名，合约最终按 `signalKey` 去重和查依赖。

## 常见 Signal 名称约定

`str`、`cmp`、`err`、`cxl`、`pass`、`fail` 是当前 DSL 和产品语义里常见的 signal 约定：

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

同一个订单里，同一个 `signalKey` 只能成功提交一次：

- 第一次提交会写入 `SignalRecord` 并发出 `SignalSubmitted`。
- 后续重复提交会因为 `SignalAlreadyExists` 回滚。

`idempotencyKey` 会保存在事件和投影里，方便服务层识别请求来源；但合约语义上的去重键是 `(orderId, sourceId, signalId)`。

## Payload 只上哈希

合约不保存合同、发票、物流、车辆、照片、审批文件等业务明文。业务证据应放在链下，链上只保存：

| 字段 | 含义 |
| --- | --- |
| `payloadHash` | 证据或动作 payload 的哈希。 |
| `metadataURI` | 如果需要，可在投影或 adapter 里指向链下 metadata。 |
| `submitter` | 被授权的钱包地址。 |
| `submittedAt` | 链上记录时间。 |

这条边界很重要：链提供可验证顺序和权限，不提供业务文件存储。

## 授权是链上检查项

Product API 可以把某个任务显示给某个参与方，但最终能否提交仍由合约检查：

```text
orderId + signalKey + submitter
```

如果没有对应的 `SignalSubmitterAuthorized` 记录，即使 UI 显示了按钮，合约也会拒绝提交。

## Signal 的协议边界

一个 signal 表示“某个授权动作发生了”。供应商内部工作流、采购过程、融资过程或 AI 推理过程可以在 evidence、metadata URI 或 supplier 系统里保存；UVP 核心验证标准边界：授权、签名、payload hash、事件证明。
