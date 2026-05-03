# Zhixu Catalog、配置与发布

Store 中的 Zhixu Catalog 不是“平台 admin 管理秩序内部”的地方，而是凝结核把秩序设计发布出来、组织材料、接受平台 workflow、申请 trust-domain 背书的地方。DSL 对象本身见核心概念里的 Zhixu；本页只讲 Store 侧面。

## 页面目标

Zhixu Catalog 要让凝结核、Store operator 和 trust reviewer 分别看清：

- 这条秩序由哪个凝结核发起和维护；
- 它设计了哪些 stage、source、trigger、supplier slots、资源和证据要求；
- 它如何说明内部公平、选择权、异常处理和透明性；
- 当前 draft / compiled / reviewed / attested / revoked / deprecated 状态；
- planId、planHash、compiler/schema version 是否可复现；
- 是否包含 `supplierType=zhixu` 的 peer docking；
- 当前版本是否可以创建新订单，还是只能查看历史订单。

## 谁负责什么

| 事项 | 负责人 | Store 角色 |
| --- | --- | --- |
| 秩序内部环节设计 | 凝结核 | 提供 authoring/import、编译预览、图谱和版本工作台。 |
| 供应商组织和公平规则 | 凝结核 | 展示 supplier requirements、resource/evidence checklist 和说明材料。 |
| 平台目录打标 | Store operator | 给 catalog、行业、风险、可见性、推荐版本打平台标签。 |
| 发布材料审核 | Store reviewer | 确认材料完整、可编译、可审查；不直接判定公平可信。 |
| 外部可信背书 | Trust domain | 通过 registry attestation/revocation 表达。 |
| 订单运行事实 | `UVPStateMachine` | Store 只展示 projection 和 proof。 |

## 发布路径

```text
凝结核导入 Zhixu
  -> compile preview
  -> Product Schema / resource / supplier requirement validation
  -> 凝结核补齐公平性、透明性、异常处理说明
  -> Store workflow review
  -> approved_for_broadcast
  -> governance admin request attestation
  -> indexed PlanAttested
  -> active/order-creatable version
```

`approved_for_broadcast` 只表示平台 workflow 允许发起背书请求。它不是 `PlanAttested`，也不是 Store 对秩序公平性的最终判定。

## Store 可以保存什么

- draft source、compile preview、planId、planHash、artifact hash；
- 凝结核 identity、维护说明、版本说明、deprecated/revoked 展示状态；
- stage explanation、source map、trigger、supplier slot、resource handle；
- fairness / transparency / exception policy material；
- platform catalog tags、risk label、visibility、active recommendation；
- Product Schema bundle、add-on manifest、capability/plugin metadata；
- governance request id、broadcast state、audit reference。

## Store 不能声称什么

- Store review approved 不等于 Zhixu 已经公平可信。
- 编译预览通过不等于 plan 已注册。
- active recommendation 不等于所有订单自动迁移。
- Store copy 不能改 planId、planHash 或 on-chain artifact。
- Store admin 不能替凝结核决定秩序内部 stage、公平规则或供应商组织原则。

## Trust domain 看什么

Trust domain 不是 Store 页面里的普通标签。它应基于可审查材料判断一条 Zhixu 是否可背书，例如：

- stage、source、trigger 是否透明可解释；
- supplier selection 和 selector 权限是否清楚；
- 证据要求、resource handles、proof path 是否可验证；
- 失败、争议、撤销和异常处理是否明确；
- planId/planHash 是否与提交材料一致；
- 该凝结核是否有维护这条秩序的信誉和能力。

Store 可以组织和展示这些材料；背书事实只能来自 `ZhixuTrustRegistry` projection。

## 检查表

| 检查项 | Store 显示 | 权威 |
| --- | --- | --- |
| DSL 是否可编译 | compile preview、artifact hash、validation errors。 | compiler 输出。 |
| 凝结核是谁 | `spec.nucleation.id`、维护说明、版本历史。 | Zhixu metadata + Store workspace。 |
| 公平性材料是否完整 | selector、supplier slot、异常处理、证据要求说明。 | 凝结核提交材料；trust domain 外部判定。 |
| Plan 是否官方可信 | trusted/revoked/not found badge。 | `ZhixuTrustRegistry` projection。 |
| Stage 是否有执行入口 | trigger hook、Product task preview。 | compiled HookPlan + state-machine events。 |
| Supplier 能力是否匹配 | required capability vs supplier passport。 | 凝结核组织语义 + Store metadata；trust 另看 registry。 |
| Docked Zhixu 是否可用 | peer plan trust、signalMap validation、relation draft。 | registry projection + compiler validation + workflow audit。 |
