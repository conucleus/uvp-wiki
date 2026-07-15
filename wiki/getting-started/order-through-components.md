# 一个订单穿过 UVP 组件

```text
Zhixu draft
  -> compiler 生成确定性 Plan artifact
  -> publisher 签名并发布 Plan
  -> Product BFF 准备 Order 与参与者授权
  -> UVPStateMachine 记录 Order、Signal、HookReady 与 patch
  -> Chain Services 重建 projection
  -> Store、Order App 与 executor-kit 使用 DTO 和 proof
```

| 阶段 | 关键组件 | 权威来源 |
| --- | --- | --- |
| 设计 | Nucleus、Store、Compiler | Zhixu source、Store 材料与确定性编译结果。 |
| 发布 | Publisher、Protocol Bindings、StateMachine | EIP-712 publisher 签名与 Plan 事件。 |
| 身份解析 | Store、Identity Registry | Store 线下资料与 subject/account binding。 |
| 创建订单 | Product BFF、Order participants | creator 签名、参与者接受记录与订单授权。 |
| 推进订单 | Order App、executor-kit、StateMachine | submitter 签名、Signal 与 Hook 事件。 |
| 展示与验证 | Chain Services、Product DTO | 可重放链事件、hash 与 projection。 |

Identity Registry 只出现在身份解析环节。Supplier 能力、搜索、推荐和匹配由各 Store 自行维护；Plan 发布由 publisher 与 StateMachine 完成。
