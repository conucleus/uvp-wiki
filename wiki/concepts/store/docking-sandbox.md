---
title: Docking Sandbox
type: explanation
audience: 凝结核成员、docking/adapter 接入方
preread: README.md
status: verified
---

# Docking Sandbox

> 前置阅读：[秩序商店（Store）](README.md)
Docking Sandbox 用来让凝结核试拼外部秩序、supplier signal map、adapter workflow 或 executor integration。它负责配置验证、proof checklist 和 operator review 材料；正式发布和运行态对接继续走 Zhixu 发布、trust publication、order registration、signal authorization 和 docking events。

## 可以做什么

- 创建 sandbox session；
- validate signal map、role slot、stage 和 capability plugin 的匹配；
- 保存 draft；
- 生成 operator review 材料；
- 帮助判断一个 supplier、adapter 或 peer Zhixu 是否能接入目标秩序。
- 预览 local stage `orderTriggerKind: dock` 后要原子创建的 linked order 或 adapter job；
- 检查 peer Zhixu plan publication 和 supplier identity projection；
- 生成 signalMap proof checklist。

## 正式路径

```text
试拼完成后还要发布、材料审核、注册订单和提交链上 proof。
```

正式秩序发布进入 [Zhixu Catalog、配置与发布](zhixu-management.md)；Plan 注册进入 trust publication 和 `commitPlan()` + `finalizePlan()` 两步路径；订单创建进入 Product/registrar 的 signed trigger order 路径；Signal 授权进入 order-level authorization 或 stage overlay 路径；运行态 peer order 对接必须通过已提交 route/interface commitment 的 `openDockedOrder` 原子创建，再通过 `submitDockedInput` / `submitDockedSignal` 传递事实。Sandbox validation 只输出 review 材料和风险提示，trust 仍由 registry publication 表达，校验通过不等于可创建订单（见 [README.md](README.md) 权威表）。

## Docking Session 建议结构

| 字段 | 说明 |
| --- | --- |
| localPlanId / localStage | 本地 Zhixu 中要开放给外部执行接口的 stage。 |
| nucleationId | 发起这次试拼的凝结核。 |
| executorType | `zhixu`、enterprise adapter、MCP agent、manual supplier。 |
| peerZhixu | 目标 Zhixu 的定义 name（云轨唯一注册名）、active plan、trust status。 |
| interface / orderMode | 选定的目标接口名与其允许的订单方式（new/existing；试拼时校验 `order.mode ∈ orderModes`）。 |
| inputMap / signalMap | 本地通道/信号到目标接口端口名的映射和 source validation 结果（至少一张非空）。 |
| resourceNeeds | local/linked 两侧资源句柄、manifest、证据要求。 |
| contact | peer operator、adapter endpoint、notification policy。 |
| proofChecklist | linked order 注册、linked signal、local mapped signal 的 proof 要求。 |
| review | operator note、风险、审批状态。 |

## `supplierType=zhixu` 的特别检查

`inputMap`/`signalMap` 至少一张非空，映射值使用已发布接口的端口名，被绑定端口必须来自同一个 linked source；`mode=new` 的 route 恰好一条 input 绑定（出生锚）。peer Zhixu 的版本化 plan publication 要可见，linked order 的关系和业务事实必须落到 `DockOpened`、`DockInputSubmitted`、`DockOutputSubmitted` 等 state-machine/docking events（`mode=existing` 的对接只连接既有目标订单，不产生新子单），不能依赖私有生命周期字段。local order 继续推进前，其上必须出现授权 mapped signal 或 `DockOutputSubmitted`。完整接入材料与流程见 [Zhixu 作为执行接口](../apps/zhixu-as-executor.md)。
