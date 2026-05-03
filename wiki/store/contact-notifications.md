# 联系与通知

Store 可以维护联系和通知工作流，因为真实履约需要找到人、系统或 adapter。联系与通知属于 operational workflow；链上业务动作由授权 signal 表达。

## 可组织的信息

- supplier contact、owner、team、support channel；
- notification preference、delivery channel、retry policy；
- task reminder、HookReady delivery intent、failure reason；
- operator note、SLA、可用时段、升级联系人；
- adapter endpoint metadata 或 MCP/enterprise integration reference。
- peer Zhixu docking contact，例如 owner、operator、callback adapter、support window。

## 来源和边界

- 通知触发可以来自 `HookReady`、order-level authorization、supplier trust 和 Product task projection。
- 通知状态只能说明 Store/chain-services 是否尝试联系或提醒。
- 业务完成必须由授权 submitter 的链上 signal 表示。
- 联系方式、凭证、私密 note、证件、合同、invoice、evidence plaintext 不应上链。
- 对 docked Zhixu 的通知表示“linked 秩序执行方已被提醒或 adapter 已被调用”；linked order 注册、完成和映射回填看链上 proof。

## 与 chain-services 的关系

chain-services 可以派生 supplier delivery intents，并保存 retryable operational delivery state。这个状态不能改变 order、task、hook、signal 或 trust truth。

## 通知状态建议

| 状态 | 含义 | 推进订单还需要 |
| --- | --- | --- |
| `pending` | 已生成 delivery intent，尚未发送。 | 任务已开始。 |
| `sent` | Store/chain-services 尝试发送成功。 | 对方已执行。 |
| `acknowledged` | 对方系统或人工确认收到。 | signal 已提交。 |
| `failed` | 联系失败或 adapter 调用失败。 | 订单失败；失败仍要看链上 signal/hook。 |
| `suppressed` | 因 revoked、blocked、policy 或 rate limit 未发。 | 链上状态不存在。 |
