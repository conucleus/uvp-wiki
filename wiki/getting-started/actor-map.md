# 角色地图

这一页把光伏跨境项目里的现实角色映射到 UVP 角色。记住一个主分工：现实主体做事并承担责任；UVP 记录被授权的 signal、签名、证据指纹和链上后果。

先按这条顺序读：

```text
凝结核设计可复用规则书
  -> Trust Domain 背书 Plan 或 Supplier
  -> Publisher 注册 Plan
  -> Registrar 注册一笔 Order 和 signal 权限
  -> Submitter 签名业务 Signal
  -> Relayer 可以广播交易
  -> Chain Services 展示重建后的 Product / Store 视图
```

## 从现实角色到 UVP 角色

| 现实角色 | 在光伏项目里做什么 | 对应 UVP 角色 | 什么证明它 |
| --- | --- | --- | --- |
| 政府 / 监管 | 许可、备案、并网、验收、监管结论。 | Trust Domain 或外部 signal issuer。 | `PlanAttested`、监管类 signal、Product proof row。 |
| 项目公司 / 业主 | 发起项目，确认需求、合同、付款和验收。 | Buyer / Owner、Order participant。 | `OrderRegistered`、买方或业主侧 `SignalSubmitted`。 |
| 凝结核 / Nucleation | 把这类光伏交付协作设计成可复用 Zhixu，维护版本和 supplier slot。 | Nucleation。 | 编译出的 `planId` / `planHash`；被背书后是 `PlanAttested`。 |
| Store operator | 导入 Zhixu，组织 supplier profile，审核材料，发起背书 workflow。 | Store operator。 | Store audit record；official trust 仍看 registry event。 |
| EPC / EPCM | 设计、采购、施工管理、安装协调、验收资料组织。 | Supplier 或 Executor，视具体订单阶段而定。 | supplier trust、order authorization、EPC 阶段 `SignalSubmitted`。 |
| OEM / 一级供应商 | 定稿、打样、开模、小批量、出厂、质检、装箱。 | Supplier；在订单阶段里也可能是 Executor。 | `SupplierAttested`、出厂或质检 signal、payload hash。 |
| 进口商 / 报关 / 物流 | 发运、到港、报关、清关、口岸运输。 | Supplier / Executor / adapter。 | 清关或物流 `SignalSubmitted`、tx/block/log proof。 |
| 仓储 / 现场交付 | 入库、出库、到场、签收、交付。 | Executor 或现场 supplier。 | 仓储签收、现场交付 signal、Product proof row。 |
| O&M | 安装后巡检、故障响应、维护记录。 | Supplier / Executor。 | O&M signal、维护 evidence hash、proof row。 |
| 资金方 / 保险 / 审计 | 付款、授信、保险、审计、风险确认。 | Trust Domain、adapter 或 signal issuer。 | 背书、付款/审计/保险 signal、链上事件 proof。 |
| Registrar | 基于已背书 Plan 创建具体订单，并写入初始 signal 权限。 | Registrar。 | `OrderRegistered`、`SignalSubmitterAuthorized`。 |
| Relayer | 广播参与者已签名的交易，可能代付 gas。 | Relayer。 | transaction hash 和链上事件；业务责任看 submitter 签名。 |
| Chain Services | 从链事件重建 order、task、timeline、proof 和 trust 视图。 | Rebuildable Service Layer。 | 带 tx、block、log、contract、chain id、event provenance 的 projection row。 |

## 一个具体阶段里的 Supplier 和 Executor

以清关完成阶段为例：

| 层 | 例子 |
| --- | --- |
| Supplier | 有清关能力、可以被 trust domain 背书的报关行公司。 |
| Executor | 这家报关行被授权处理本 Order 阶段的操作钱包、员工钱包、API 钱包或 adapter。 |
| Authorization | `SignalSubmitterAuthorized` 把这个 submitter 钱包绑定到本 Order 的 customs source/signal。 |
| Proof | `SignalSubmitted` 加 payload hash 和交易 provenance 证明提交过什么。 |

## 一条订单里的权威来源

| 问题 | 权威来源 |
| --- | --- |
| 这类光伏交付 Zhixu 是否被背书？ | Trust-domain 的 `PlanAttested` / `PlanRevoked`。 |
| 这次项目交付 Order 是否存在？ | `UVPStateMachine.OrderRegistered`。 |
| 谁能提交某个阶段 signal？ | `SignalSubmitterAuthorized`，以及存在时的 active executor overlay。 |
| 某个业务动作是否发生？ | 授权钱包签名和 `SignalSubmitted`。 |
| 下一步任务是否打开？ | `HookReady`。 |
| Product 或 Store 展示从哪里来？ | 链事件 projection；workflow metadata 需要明确标注。 |

## 读角色时的判断法

| 问题 | 判断方式 |
| --- | --- |
| 这个主体是在设计协作模板，还是在执行具体订单？ | 设计模板看 Nucleation / Store；执行订单看 Order participant / Supplier / Executor。 |
| 这个主体提供长期能力，还是处理当前阶段？ | 长期能力看 Supplier；当前阶段提交者看 Executor 或 submitter。 |
| 这个主体提供现实背书，还是创建订单？ | 背书看 Trust Domain；创建订单和写入初始授权看 Registrar。 |
| 这个主体广播交易，还是签业务声明？ | 广播看 Relayer；业务声明看 submitter 签名。 |
