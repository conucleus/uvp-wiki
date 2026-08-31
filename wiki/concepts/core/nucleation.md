---
title: Nucleus / 凝结核
type: explanation
audience: 协议读者
preread: ../README.md
status: verified
---

# Nucleus / 凝结核

> 前置阅读：[核心概念](../README.md)
凝结核 (Nucleus) 是秩序 (Zhixu) 的发起、设计和维护核心，是让一类协作规则开始成形、获得边界、持续维护的组织原点；具体订单阶段由参与方执行。先把它理解成可复用运营模型的 originating organizer：采购运营团队、行业项目组织者、平台侧 workflow 设计者，或其他能长期维护这份规则书的组织。

`Nucleus` 是主体名；`nucleation` 是成核过程、成核上下文和 DSL/API 字段名。`spec.nucleation.id` 标识发起并维护某类秩序设计的凝结核。订单里的 executor、Store admin 和 Registry operator 分别承担运行时执行、平台 workflow 与身份核验。

## 谁使用

凝结核组织（采购运营团队、行业组织者、workflow 设计者）使用它声明自己的角色身份；Store 提供凝结核工作台；Registry 和合约只在其发布与注册动作上落权威事实。

## 产生什么结果

凝结核设计并维护 Zhixu DSL，经编译和发布形成 Plan 版本边界，并组织 supplier 网络与秩序运转；它的设计决策进入 Plan artifact、plan hash 和可审查的版本记录。

## 权威来自哪里

凝结核不自动等同于 Store operator、Identity Registry、registrar 或 submitter wallet。它可以出现在 workflow 材料和 Store 记录里，但链上权威仍然来自 plan publication、publisher/registrar 权限、订单级 authorization 和参与方签名。

```yaml
spec:
  nucleation:
    id: procurement-nucleus
```

## 为什么叫凝结核

“凝结核”强调的是形成秩序的核心，而不是调度、拥有、签名或执行。它适合表达三层含义：

- 发起：某个主体先提出并维护一类协作规则；
- 聚合：供应商、资源、证据要求、选择权和异常路径围绕这套规则组织起来；
- 定界：哪些事情进入 Zhixu、哪些事情留给 Store workflow、Identity Registry 或外部业务系统。

所以它不直接翻译成 `orchestrator`、`owner`、`creator` 或 `vow-maker`。这些词分别过度强调调度、所有权、一次性创建或主观意愿，都会压扁本项目里“成核并长期维护秩序”的含义。

## 凝结核负责什么

凝结核负责秩序内部的设计和运行原则：

- 设计 Zhixu 的 task pattern、stage、source、signal、hook 和 trigger；
- 定义哪些 stage 需要哪些 supplier 能力；
- 设计选择权、资源要求、证据要求和公平规则；
- 组织供应商网络，并维护秩序内部的协作、公平和运转；
- 决定什么时候提交新版本、什么时候废弃旧版本。

这些责任先体现在 Zhixu DSL、resource handles、Product schema、supplier requirements 和发布材料里。编译后，它们进入 Plan artifact、plan hash 和可被 Identity Registry 审查的版本边界。

## 职责边界

| 相邻角色 | 分工 |
| --- | --- |
| Store admin / 外部机构 | 平台工作台、材料审核、目录与发布流程；对外部合规、能力与推荐作各自判断。 |
| Supplier | 能力主体，可能被凝结核组织进秩序。 |
| Executor | 某个订单里的运行时执行者或 submitter。 |
| Registrar | 注册订单的授权主体。 |

拼写约定见 [核心术语表](../../reference/glossary.md)。

## 和 Zhixu、Plan、Order 的关系

```text
Nucleus / 凝结核
  -> 设计 Zhixu
  -> 编译成 Plan
  -> publisher 签名发布 Plan
  -> 创建或允许创建 Order
  -> 通过 proof 和 supplier network 维护秩序运转
```

秩序 (Zhixu) 是凝结核设计出的可复用规则书。Plan 是某个秩序版本的链目标产物。Order 是某个 Plan 的一次运行实例。凝结核可以维护多个秩序或多个版本；运行时仍经过 plan publication、order registration、signal authorization 和 chain proof。

## 和 Store 的关系

Store 是凝结核的工作台和展示场。Store 可以帮助凝结核导入秩序、编译预览、组织供应商资料、展示履约 proof、发起 publication request、维护 audit；链上 plan/supplier/order/signal 事实来自 registry 和 state-machine 事件。

Store 侧的产品视角见 [凝结核工作台](../store/zhixu-management.md)。
