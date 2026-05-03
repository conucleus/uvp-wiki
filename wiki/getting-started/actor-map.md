# 角色地图

这一页把一条订单路径里的参与者、组织、钱包和服务先讲清楚。记住一个主分工：人和服务负责准备、提交、展示和转发动作；registry 和 state-machine 事件证明协议事实。

## 一条跨境订单里的角色

| 角色 | 做什么 | 在哪里行动 | 什么证明它 |
| --- | --- | --- | --- |
| Buyer | 发起或参与具体供货订单，查看任务，签名确认买方侧动作。 | Product UI、Order App、钱包。 | `OrderRegistered` 证明订单存在；`SignalSubmitted` 证明买方签名动作。 |
| 凝结核 / Nucleation | 设计并维护这一类订单复用的 Zhixu。例如采购团队可以拥有 `spec.nucleation.id=procurement-nucleus`，维护版本、定义阶段、组织 supplier slot。 | Store 凝结核工作台和 Zhixu 源材料。 | 编译出的 `planId` / `planHash`；被背书后是 `PlanAttested`。 |
| Store operator | 导入 Zhixu、查看 compile preview、组织 supplier profile、审核材料、发起 attestation workflow。 | Store / Store Console。 | Store audit 证明 workflow 动作；registry event 证明官方 trust。 |
| Trust Domain | 对 plan version 或 supplier subject 做外部背书。 | Trust registry workflow 和 governance wallet。 | `PlanAttested`、`PlanRevoked`、`SupplierAttested`、`SupplierRevoked`。 |
| Registrar | 基于已背书 Plan 注册具体 Order，并写入初始 order-level signal 权限。 | Product BFF、治理流程或直接合约调用。 | `OrderRegistered` 和 `SignalSubmitterAuthorized`。 |
| Supplier | 提供现实履约能力，例如 customs、logistics、inspection、payment adapter、guarantee，或另一个 Zhixu。 | Store supplier registry 和 Product projection。 | `SupplierAttested` 证明 trust；当前动作权限仍看 order authorization。 |
| Executor | 实际处理当前 Order 某个阶段的任务，或提交该阶段 signal。 | Order App、executor-kit、企业系统或 adapter。 | EIP-712 签名加 `SignalSubmitted`；如有 active executor，则看 stage overlay events。 |
| Relayer | 广播参与者已签名的交易，并可能代付 gas。 | Chain Services relayer。 | 交易 hash 和链上事件；relayer 不证明业务授权。 |
| Chain Services | 从链事件重建 order、task、timeline、proof、trust 视图，并提供 Product / Store API。 | 可重建服务层。 | 带 tx、block、log、contract、chain id、event provenance 的 projection row。 |

## 谁有权威

| 问题 | 权威来源 |
| --- | --- |
| 这个 Zhixu version 是否可信？ | Trust-domain 的 `PlanAttested` / `PlanRevoked`。 |
| 这个 Order 是否存在？ | `UVPStateMachine.OrderRegistered`。 |
| 谁可以提交这个 Order 的这个动作？ | `SignalSubmitterAuthorized`，以及存在时的 active executor overlay。 |
| 某个业务动作是否发生？ | 授权签名和 `SignalSubmitted`。 |
| 下一个任务是否打开？ | `HookReady`。 |
| Product 或 Store 视图是否可靠？ | 必须能指回链事件，或明确标注为 workflow metadata。 |

## 不要混淆

| 概念对 | 正确理解 |
| --- | --- |
| 凝结核 / Store operator | 凝结核负责内部 Zhixu 设计；Store operator 管平台 workflow 和审核材料。 |
| Trust Domain / Registrar | Trust domain 负责背书 plan 或 supplier；registrar 负责创建具体 Order 并写 signal authorization。 |
| Supplier / Executor | Supplier 是能力和 trust 身份；Executor 是这个 Order/阶段的运行时处理者或提交者。 |
| Relayer / Submitter | Relayer 负责广播；submitter 签业务声明。 |
