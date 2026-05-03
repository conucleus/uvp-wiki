# Store 与 Order App

Store、Order App 和 executor-kit 站在不同用户视角上消费同一套链上事实。Store 是中心化治理和编目工具；Order App 是普通参与者任务工具；executor-kit 是执行者、企业系统、AI/MCP adapter 的集成工具。

## Store

`zhixu-store/app` 面向 Store/workbench。它可以处理：

- 订单创建和参与方配置。
- 任务审阅和流程查看。
- 链证明展示。
- plan attestation 和 supplier trust 展示。
- metadata、catalog、review、audit 辅助流程。

Store 不可以：

- 让 metadata 替代 `PlanRegistered`。
- 让审核草稿替代 `SignalSubmitted`。
- 让 Store 数据库替代 trust registry。
- 替参与方生成业务签名。

Store 的中心化权威可以影响推荐、审核、打标和治理入口，但不能直接改变订单运行事实。

## Order App

`uvp-order-app/app` 面向普通参与者。它应使用普通语言展示：

- 待处理任务。
- 提交确认。
- 证据指纹。
- 链上证明。
- 履约者或执行方。
- 资源需求。
- readiness 检查。

普通任务 UI 不应要求用户理解 `HookPlan`、`sourceId`、`signalId`、ABI 或 gas 细节。高级 proof/debug 视图可以展示这些字段。

## executor-kit

`uvp-executor-kit` 有两条路径：

| 路径 | 用途 |
| --- | --- |
| Product API mode | 通过 Product DTO 找任务、读证明、准备提交。 |
| Chain watcher mode | 直接监听链事件和合约状态，面向执行者或 adapter。 |

两条路径最终都是 signal producer。它们不拥有订单状态，授权钱包签名才是业务动作。

## Periphery Adapter

资金、担保、AI/MCP、demo executor 可以放在 `uvp-periphery`。它们应该消费 `UVPStateMachine`、`ZhixuTrustRegistry`、Product DTO 或 executor-kit，而不是定义新的核心订单真相。
