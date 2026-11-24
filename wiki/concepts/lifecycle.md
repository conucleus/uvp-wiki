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
| 身份解析 | Store、Identity Registry | Store 线下资料、subject/account binding 与 supplier SID/account。 |
| 创建订单 | trigger 阶段 assigned supplier、Order participants | 出生信号的 submitter 签名与显式幂等键。 |
| 推进订单 | Order App、uvp-client、StateMachine | submitter 签名、Signal 与 Hook 事件。 |
| 展示与验证 | Chain Services、Product DTO | 可重放链事件、hash 与 projection。 |

## 1. 编写与编译

Store 或开发者编写 Zhixu；Compiler 生成 hooks、selector bindings、signal capabilities、`StageFileWriter[]`、`hooksHash`、`capabilitiesRoot`、`supplierBindingsRoot`、`fileWritersHash` 和 runtime `planHash`。编译阶段只做规则结构校验，不认证现实供应商能力。

## 2. 配置并冻结 StateMachine

部署 StateMachine 与七个 modules（stage patch、derived signal、dock registry、plan metadata、lens、file resource、identity registry），设置地址后调用 `freezeModules()`。冻结后 owner 不能替换 module；升级必须部署新 StateMachine，并通过 Deployment Registry 显式切换。

## 3. 签名提交 Plan

publisher 签署六字段 PlanCommit（`publisher + hooksHash + capabilitiesRoot + supplierBindingsRoot + fileWritersHash + deadline`）。任意 relayer 调用 `commitPlan`，合约验证完整 hooks 的 hash、`StageSupplierBinding[]`、`StageFileWriter[]` 与 publisher 签名，导出 `planId = keccak("uvp.plan.id.v1", publisher, runtimePlanHash)`——`runtimePlanHash` 为四元 `(hooksHash, capabilitiesRoot, supplierBindingsRoot, fileWritersHash)`，域 `uvp.plan.runtime.v8`。

## 4. 定稿 Plan

capabilities（signal capability + stage selector binding）折叠为 `capabilitiesRoot`，supplier default/candidate 绑定折叠为 `supplierBindingsRoot`，file-writer 阶段名单由 `fileWritersHash` 承诺，随 commit 一并被 publisher 承诺。任意调用者调用 `finalizePlan(planId)` 定稿（permissionless），本步只落定稿、不提交表数据。只有 finalized Plan 能创建 Order。

## 5. 身份目录（可选）

Store 可以在线下核验主体后，在自己的 `UVPIdentityRegistry` 登记 `subjectId -> account`；这一步只改善名称显示、联系与合规审计，不是 Plan 或 Order 的链上准入步骤。同一 registry 的 supplier 命名空间是执行身份来源：SID 铸造、永久 `SID -> account` 绑定与 `pending/active/suspended/revoked` 状态；`commitPlan` 的 supplier 绑定、stage patch 与 `submitSignal` 都要求 SID active。

## 6. Trigger 创建 Order

出生在 DSL 声明面由 `sendSignals` 条目上的 `trigger: true` 表达。链轨只有 `submitSignal(orderId=0)` 一条出生入口：出生阶段当前生效的 assigned supplier account 签署并提交出生信号，任意 relayer 可广播；合约绑定 finalized `planId`、校验出生适格、在运行期生成 `orderId`（按 `(submitter, idempotencyKey)` 去重），记录出生事实并 materialize 初始 stage。

## 7. 业务执行与投影

被 assigned supplier account 直接或通过 relayer 提交 Signal。合约求值 hooks 并发出可重放事件。Chain Services 只从事件重建 order、task、identity 和 proof 视图；Store 的名称、标签、推荐、通知和 draft workflow 是链下状态。

## 相关页面

- [协议边界](protocol-boundaries.md)
- [Contracts 与 Registries](contracts-and-registries.md)
- [Canonical Hash](artifacts/canonical-hashes.md)
- [状态机](state-machine/README.md)
