---
title: Signal Container
type: explanation
audience: 产品与集成工程师
preread: dto.md
status: verified
---

# Signal Container

> 前置阅读：[Product DTO](dto.md)
Signal container 是产品层对一个授权业务动作的包装。它是 product/API 概念，不是新的合约对象。它把现有 task、evidence、typed data、business signature、submit、proof 组织成一个可重复的用户和集成模型；链上仍使用现有合约类型和事件。

## 为什么需要这个概念

报关行、物流系统、AI agent、支付 adapter、担保方、人工团队、ERP 都可能产生业务动作。UVP 验证统一边界：

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

- Container 是产品包装，权威 proof 来自链上合约和事件。
- Product API 可以准备和解释 container；business signature 来自参与方钱包。
- Relayer 可以广播；submitter 身份来自签名和授权。
- Evidence plaintext 不上链。
- `payloadHash` 和 metadata URI 是标准外部边界。
- 缺少显式 capability metadata 应 fail closed，避免从角色文案猜权限。
- 普通 UI 不展示 ABI、calldata、gas、sourceId、signalId；高级证明视图可以展示。

## 对 Executor Kit 和 MCP 的意义

executor-kit Product API mode 和未来 MCP tools 应消费 signal container，让 AI 或企业系统不用直接理解 HookReady、ABI 和 event topic。工具可以列任务、取 container、准备证据、签名、提交、读 proof；订单授权仍来自 state machine。

## 相关页面

- [Product 表面入口](README.md)
- [Product DTO](dto.md)
- [Evidence、Proof 与 File Resource](../services/evidence-proof.md)
- [Product API 端点速查](../../reference/product-api-endpoints.md)
