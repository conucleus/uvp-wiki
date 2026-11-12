---
title: Plan 与订单生命周期
type: explanation
audience: 应用开发者
status: verified
---

# Plan 与订单生命周期

一条订单从静态秩序到链上事实要经过七个步骤。先用六阶段表看每一步的关键组件和权威来源：

| 阶段 | 关键组件 | 权威来源 |
| --- | --- | --- |
| 设计 | Nucleus、Store、Compiler | Zhixu source、Store 材料与确定性编译结果。 |
| 发布 | Publisher、Protocol Bindings、StateMachine | EIP-712 publisher 签名与 Plan 事件。 |
| 身份解析 | Store、Identity Registry | Store 线下资料与 subject/account binding。 |
| 创建订单 | Product BFF、Order participants | creator 签名、参与者接受记录与订单授权。 |
| 推进订单 | Order App、uvp-client、StateMachine | submitter 签名、Signal 与 Hook 事件。 |
| 展示与验证 | Chain Services、Product DTO | 可重放链事件、hash 与 projection。 |

## 1. 编写与编译

Store 或开发者编写 Zhixu；Compiler 生成 hooks、selector bindings、signal capabilities、file-writer capability leaves、`hooksHash`、`capabilitiesRoot`、`executorCandidatesRoot` 和 runtime `planHash`。编译阶段只做规则结构校验，不认证现实供应商能力。

## 2. 配置并冻结 StateMachine

部署 StateMachine 与七个 modules（stage patch、derived signal、dock registry、plan metadata、order link、lens、file resource），设置地址后调用 `freezeModules()`。冻结后 owner 不能替换 module；升级必须部署新 StateMachine，并通过 Deployment Registry 显式切换。

## 3. 签名提交 Plan

publisher 签署六字段 PlanCommit（`publisher + hooksHash + capabilitiesRoot + executorCandidatesRoot + birthAuthorizer + deadline`）。任意 relayer 调用 `commitPlan`，合约验证完整 hooks 的 hash 和 publisher 签名，导出 `planId = hash(publisher, planHash)`——`planHash` = runtime hash 三元组（hooks、capabilitiesRoot、executorCandidatesRoot）；`birthAuthorizer` 只进 commit digest 与链上存储，不进 `planHash`。

## 4. 定稿 Plan

三张能力表已折叠为 `capabilitiesRoot`、执行者候选集折叠为 `executorCandidatesRoot`，随 commit 一并被 publisher 承诺。任意调用者调用 `finalizePlan(planId)` 定稿（permissionless），本步只落定稿、不提交表数据。只有 finalized Plan 能创建 Order。

## 5. 身份目录（可选）

Store 可以在线下核验主体后，在自己的 `UVPIdentityRegistry` 登记 `subjectId -> account`。这一步只改善名称显示、联系与合规审计，不是 Plan 或 Order 的链上准入步骤。Identity Registry 只出现在身份解析环节：Supplier 能力、搜索、推荐和匹配由各 Store 自行维护；Plan 发布由 publisher 与 StateMachine 完成。

## 6. Trigger 创建 Order

出生在 DSL 声明面由 `sendSignals` 条目上的 `trigger: true` 表达：链轨 outside 出生由计划承诺的 `birthAuthorizer` 签 typed data 提交（或合约直接入口），order-link 与治理分叉 fork 各有独立入口；任意 relayer 可广播。合约绑定 finalized `planId`、写入订单级 signal authorizations、记录出生事实并 materialize 初始 stage。

## 7. 业务执行与投影

被授权钱包直接或通过 relayer 提交 Signal。合约求值 hooks 并发出可重放事件。Chain Services 只从事件重建 order、task、identity 和 proof 视图；Store 的名称、标签、推荐、通知和 draft workflow 是链下状态。

## 相关页面

- [协议边界](protocol-boundaries.md)
- [Contracts 与 Registries](contracts-and-registries.md)
- [Canonical Hash](artifacts/canonical-hashes.md)
- [状态机](state-machine/README.md)
