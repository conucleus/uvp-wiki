---
title: Zhixu Catalog、配置与发布
type: explanation
audience: Store 产品与运营、凝结核成员
preread: README.md
status: verified
---

Zhixu Catalog 是凝结核维护秩序设计、编译材料和 Store 展示资料的工作台。凝结核负责 stage、公平规则、异常处理与供应商组织；Store 负责目录、审核、搜索、版本选择和运营记录。

## 凝结核工作台

凝结核工作台服务于秩序设计者和组织者。它提供 Zhixu 草稿、编译预览、供应商目录、资源配置、版本发布材料、proof 与 audit。

| 参与者 | 身份与权利 | 权利来源 |
| --- | --- | --- |
| 凝结核 | 设计 Zhixu、组织候选供应商、维护秩序材料。 | 凝结核内部治理与 Store workspace 权限。 |
| Store operator/reviewer | 维护目录、审核资料、设置可见性和推荐。 | Store 机构规则与访问控制。 |
| Publisher | 签名发布 Plan。 | StateMachine publisher 权限与 EIP-712 签名。 |
| Registry operator | 核验线下主体并登记 subject/account。 | Identity Registry owner 权限。 |
| Order participant | 接受订单角色并提交被授权的 Signal。 | 订单级授权、active executor overlay 与签名。 |

各对象的权威来源统一见 [README.md](README.md)「信息对象与权威来源」表；本页不再复述边界论述。

## 发布路径

> 本图为发布路径的全站唯一出处，其他页面引用此路径时直接链接到这里，不再复制图或步骤列表。

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

Plan 是否发布、谁发布 Plan、当前 Order 使用哪个 Plan、Supplier 是否适合某环节等事实的权威来源，统一见 [README.md](README.md)「信息对象与权威来源」表，本页不再单独列表。

Identity Registry 只登记现实主体与钱包的对应关系，不做能力认证——一句话版本见 [README.md](README.md) 权威表，完整论述见 [../protocol-boundaries.md](../protocol-boundaries.md)。
