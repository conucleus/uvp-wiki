# Zhixu Catalog、配置与发布

Zhixu Catalog 是凝结核维护秩序设计、编译材料和 Store 展示资料的工作台。凝结核负责 stage、公平规则、异常处理与供应商组织；Store 负责目录、审核、搜索、版本选择和运营记录。

## 发布路径

```text
导入 Zhixu
  -> compile preview
  -> Product Schema 与资源要求校验
  -> Store review
  -> publisher 签名
  -> PlanCommitted / metadata registration / PlanFinalized
  -> StateMachine PlanRegistered 投影
  -> Store 选择 active version
```

Plan 的发布权来自 publisher 签名。任意 relayer 可以广播有效签名。Store review 只决定 Store 是否展示、推荐或协助发布这个版本。

## Store 保存的资料

- draft source、compile preview、planId、planHash、artifact hash；
- 凝结核身份、维护说明、版本说明和 Store 生命周期；
- stage explanation、supplier requirements、resource/evidence checklist；
- 平台目录标签、风险提示、可见性与 active recommendation；
- Product Schema bundle、add-on manifest、capability/plugin metadata；
- review、broadcast 与 audit 记录。

## 事实来源

| 事实 | 来源 |
| --- | --- |
| DSL 是否可编译 | Compiler 输出。 |
| Plan 是否发布 | `UVPStateMachine` 的 Plan 事件投影。 |
| 谁发布 Plan | publisher 签名与 publisher 事件。 |
| Store 是否推荐 | Store 数据库与审计记录。 |
| 当前 Order 使用哪个 Plan | `OrderRegistered` 与 Order 投影。 |
| Supplier 是否适合某环节 | 凝结核判断与 Store 匹配资料。 |

Identity Registry 只登记现实主体与钱包的对应关系。Plan 发布、能力判断和版本推荐分别由 StateMachine、凝结核与 Store 承担。
