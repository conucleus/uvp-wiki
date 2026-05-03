# Signal Container

Signal container 是产品层对一个授权业务动作的包装。它不是新的合约类型，而是把现有 task、evidence、typed data、business signature、submit、proof 组织成一个可重复的用户和集成模型。

## 为什么需要这个概念

UVP 不应该理解每个生产者内部怎么工作。报关行、物流系统、AI agent、支付 adapter、担保方、人工团队、ERP 都可能产生业务动作。UVP 只需要验证边界：

```text
task -> evidence/input -> prepare typed data -> business signature -> submit -> chain proof
```

这就像集装箱。港口不需要知道工厂内部怎么生产，只需要标准箱、manifest、授权方和交接记录。

## Container 包什么

最小内容：

| 字段 | 含义 |
| --- | --- |
| `taskId` | Product task。 |
| `orderId` | 所属订单。 |
| `stageId` | 对应 stage。 |
| `actionKind` | `submit_signal`、`stage_executor_patch` 或 `stage_resource_patch`。 |
| `requiredInputs` | 用户或系统需要提供的输入。 |
| `requiredEvidence` | 必需证据或凭证引用。 |
| `acceptedActor` | 被接受的钱包、supplier subject、trust status。 |
| `typedData` | 待签 EIP-712 数据。 |
| `payloadHash` | 业务 payload 指纹。 |
| `idempotencyKey` | 请求幂等键。 |
| `proof` | tx、block、event、proof rows。 |

这些字段可以从现有 `ProductTaskDTO`、prepare/submit API、evidence API 和 projection 派生。

## Product API 映射

普通 signal：

```text
GET /product/tasks/:taskId
POST /product/tasks/:taskId/prepare-submit
POST /product/tasks/:taskId/submit
GET /product/submissions/:submissionId
```

Stage patch：

```text
POST /product/tasks/:taskId/prepare-stage-executor-patch
POST /product/tasks/:taskId/submit-stage-executor-patch
POST /product/tasks/:taskId/prepare-stage-resource-patch
POST /product/tasks/:taskId/submit-stage-resource-patch
```

## 安全规则

- Container 本身不权威，链上合约和事件权威。
- Product API 可以准备和解释 container，但不能生成 business signature。
- Relayer 可以广播，但不能冒充 submitter。
- Evidence plaintext 不上链。
- `payloadHash` 和 metadata URI 是标准外部边界。
- 缺少显式 capability metadata 应 fail closed，而不是从角色文案猜。
- 普通 UI 不展示 ABI、calldata、gas、sourceId、signalId；高级证明视图可以展示。

## 对 Executor Kit 和 MCP 的意义

executor-kit Product API mode 和未来 MCP tools 应消费 signal container，而不是要求 AI 或企业系统直接理解 HookReady、ABI 和 event topic。工具可以列任务、取 container、准备证据、签名、提交、读 proof，但不能创造订单授权。
