# 凝结核工作台

凝结核工作台是秩序商店给 Zhixu 设计者和秩序组织者提供的舞台。这里的核心用户不是“平台 admin 亲自下场治理每条秩序”，而是凝结核：它设计秩序、组织供应商、维护内部公平和运转；Store 提供工具、目录、proof、发布流程和申请背书的入口。

## 三层治理

| 层 | 谁负责 | 负责什么 | 不能替代什么 |
| --- | --- | --- | --- |
| 凝结核内部治理 | Zhixu 设计者 / 秩序组织者 | 设计 stage、source、supplier slots、资源要求、公平规则、内部运行机制。 | 不能绕过 plan hash、order authorization 和 chain proof。 |
| Store 平台 workflow | Store operator / reviewer / governance admin | 导入、编译预览、目录打标、发布材料审核、attestation request、audit。 | 不能直接判定 plan/supplier 已可信。 |
| Trust domain 外部背书 | trust domain owner / reviewer | 判断 Zhixu 是否公平、透明、可背书，判断 supplier subject 是否可信。 | 不能替 Store 保存联系人，也不能替订单 submit signal。 |

文档中凡是写“Store 治理”，都应理解为平台 workflow 和证据组织，而不是 Store admin 替凝结核治理秩序内部。

## 工作台提供什么

```text
凝结核导入 Zhixu
  -> 编译预览和 artifact/hash 校验
  -> 配置 Product schema、resources、supplier requirements
  -> 组织 supplier 候选网络和联系信息
  -> 准备公平性、透明性、证据要求说明
  -> Store review 发布材料
  -> governance admin 发起 attestation request
  -> trust domain 背书或拒绝
  -> indexed PlanAttested / PlanRevoked
```

Store 提供的是舞台和工具：catalog、search、draft、compile preview、proof panel、supplier registry、notification、audit、governance request。秩序内部怎么设计、怎么保持公平、怎么组织供应商，是凝结核的职责；trust domain 对其作外部判定。

## 打标和授权的边界

| 动作 | 含义 | 权威边界 |
| --- | --- | --- |
| 凝结核内标签 | 某 supplier 适合某 stage、role slot 或 resource/evidence 类型。 | 秩序内部组织语义；不能自动创建链上 trust 或 signal authorization。 |
| Store 平台标签 | catalog 分类、搜索、风险提示、行业、能力展示。 | Store metadata；不能冒充 trust-domain 背书。 |
| Trust attestation | trust domain 对 plan/supplier subject 作外部背书。 | `ZhixuTrustRegistry` 事件。 |
| Workflow permission | 谁能导入、review、请求 attestation、编辑 metadata。 | Store 权限和 audit。 |
| Order authorization | 谁能提交某个 order 的某个 signal。 | `UVPStateMachine` order-level authorization 和 active executor overlay。 |

这五件事必须分开写。尤其是“授权”：Store 里的发布权限、review 权限、attestation request 权限，不等于订单级 signal authorization。

## 页面应该展示什么

- 凝结核 identity：`spec.nucleation.id`、负责人、维护说明、版本历史；
- Zhixu 设计材料：stage 图、source 关系、trigger、supplier slots、resource handles；
- 供应商组织：候选 supplier、能力标签、联系渠道、历史 proof、是否已被 trust domain 背书；
- 公平与透明材料：选择权规则、证据要求、异常处理、争议路径、版本变更说明；
- 发布状态：compile preview、Store review、attestation request、PlanAttested/PlanRevoked projection；
- Audit：谁提交了材料、谁请求了背书、对应 tx/proof、失败原因和重试记录。

## 不能写成什么

- 不能写成 Store admin 亲自维护 Zhixu 内部公平。
- 不能写成 Store review 已经判定 Zhixu 公平可信。
- 不能写成 Store tag 或 capability label 已经给 supplier 链上背书。
- 不能写成 notification delivered 等于履约完成。
- 不能写成 Store docking session 已经让父订单继续；父订单必须收到授权 mapped signal。
