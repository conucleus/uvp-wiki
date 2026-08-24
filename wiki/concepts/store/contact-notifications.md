---
title: 联系与通知
type: explanation
audience: Store 产品与运营、chain-services 维护者
preread: README.md
status: verified
---

Store 可以维护联系和通知工作流，因为真实履约需要找到人、系统或 adapter。联系与通知属于 operational workflow；链上业务动作由授权 signal 表达。

## 可组织的信息

- supplier contact、owner、team、support channel；
- notification preference、delivery channel、retry policy；
- task reminder、HookReady delivery intent、failure reason；
- operator note、SLA、可用时段、升级联系人；
- adapter endpoint metadata 或 MCP/enterprise integration reference。
- peer Zhixu docking contact，例如 owner、operator、callback adapter、support window。

## 来源和边界

- 通知触发可以来自 `HookReady`、order-level authorization、supplier identity 和 Product task projection。
- 通知状态只能说明 Store/chain-services 是否尝试联系或提醒；contact 不等于履约，见 [../protocol-boundaries.md](../protocol-boundaries.md)。
- 业务完成必须由授权 submitter 的链上 signal 表示（[../protocol-boundaries.md](../protocol-boundaries.md)）。
- 联系方式、凭证、私密 note、证件、合同、invoice、evidence plaintext 不应上链。
- 对 docked Zhixu 的通知表示“linked 秩序执行方已被提醒或 adapter 已被调用”；linked order 注册、完成和映射回填看链上 proof。

## 与 chain-services 的关系

chain-services 可以派生 supplier delivery intents，并保存 retryable operational delivery state。这个状态不能改变 order、task、hook、signal 或 trust truth。

## 通知状态（chain-services 实现口径）

以下为 chain-services `notifications/service.ts` 中 `NotificationDeliveryStatus` 枚举的实际状态：

| 状态 | 含义 |
| --- | --- |
| `pending` | 已生成 delivery intent，尚未发送；retry 会先回到该状态。 |
| `sent` | 发送成功。 |
| `failed` | 本次发送失败，等待 retry。 |
| `skipped` | 因收件方/profile 无法解析或策略原因未发送，附 reason code（如 `receiver_not_found`）。 |
| `dead_letter` | 重试耗尽或被人工标记 dead letter，需人工处理。 |

早期设计中的 `acknowledged`（对方确认收到）与 `suppressed`（因 revoked/blocked/policy 未发）为愿景状态，尚未实现。

<!-- TODO(confirm): acknowledged/suppressed 是否仍在路线图中？若放弃请从设计材料移除。 -->
