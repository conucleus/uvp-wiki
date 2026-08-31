---
title: 核心概念
type: explanation
audience: 协议读者
preread: ../reference/glossary.md
status: verified
---

# 核心概念

> 前置阅读：[核心术语表](../reference/glossary.md)
不确定用词时，先查[核心术语表](../reference/glossary.md)。

`uvp-eth` 的核心是一套把秩序 (Zhixu) 协作规则书落到 EVM 链上的状态机协议。合约和链事件是事实源；Store、Product API、Order App、executor-kit 和 periphery adapter 围绕这个事实源做编译、索引、展示、签名和提交。这些对象是各产品共同消费的语言层。

最短对象关系先这样读：

```text
秩序 (Zhixu): 这类协作怎么运行
  -> 订单 (Order): 这一次协作正在运行
  -> 执行者 (Executor): 这一步由谁处理
  -> 信号 (Signal): 谁提交了什么声明和证据指纹
  -> Proof / Product view: 这件事为什么可追踪
```

工程实现会再把这条关系拆成编译产物、链上注册参数、Identity Registry、状态机求值、事件 replay 和 Product DTO。这些是第二层，不是第一次理解 UVP 的入口。本页是对象索引，不是第一篇教程：新读者先抓住四个基础对象——秩序 (Zhixu) 是可复用协作规则书，订单 (Order) 是一次运行，执行者 (Executor) 是运行时处理者，信号 (Signal) 是被授权提交的业务声明；其余对象用于解释版本、因果、任务打开、材料审核、资源和 proof。

## 对象地图

### 第一遍先读

| 对象 | 先读 | 核心问题 |
| --- | --- | --- |
| 秩序 (Zhixu) | [Zhixu DSL](core/zhixu.md) | 协作秩序如何被静态描述。 |
| Order | [Order](core/order.md) | 一次具体运行如何记录 signal、任务和 proof。 |
| Signal | [Signal](core/signal.md) | 被授权业务声明如何签名、去重和提交。 |
| Executor | [Executor](core/executor.md) | 当前订单、当前阶段真正执行或提交 signal 的主体是谁。 |

### 需要解释规则内部时再读

| 对象 | 先读 | 核心问题 |
| --- | --- | --- |
| Plan | [Plan](core/plan.md) | Zhixu 如何变成静态、可认证、可注册的编译产物。 |
| Source | [Source 因果链](core/source.md) | signal 所在的因果语境如何串联、分叉和交汇。 |
| Hook | [Hook](core/hook.md) | readiness 和状态变化如何从 signal 条件求出。 |
| Trigger | [Trigger](core/trigger.md) | 哪个 hook Ready 后打开可处理任务并发出 `HookReady`。 |
| File Resources | [File Resources](core/file-resources.md) | stage 资源句柄如何指向链下协议、证据模板或资源 manifest。 |

### 需要解释组织和材料审核时再读

| 对象 | 先读 | 核心问题 |
| --- | --- | --- |
| Nucleus / 凝结核 | [Nucleus / 凝结核](core/nucleation.md) | 谁发起、设计和维护一条 Zhixu 秩序；`nucleation` 是 DSL 字段和成核上下文。 |
| Supplier | [Supplier](core/supplier.md) | 注册供应商、能力主体、trust subject、capability passport 如何表达。 |
| Trust / Authorization | [信任与授权](trust/README.md) | 谁被材料审核，谁能提交订单动作，这两件事如何分开。 |

## Supplier 和 Executor 的位置

Supplier 是 Store 对现实履约主体的组织方式：凝结核可以在秩序设计里描述需求，Store 维护 profile、能力 tags、联系、匹配和 proof 材料；`UVPIdentityRegistry` 只登记 subject 与钱包。真正的任务授权仍来自 Order 的签名和订单级授权，能力标签不是协议前置条件。

Executor 是订单运行时的执行绑定：静态秩序可以声明默认 executor，具备 stage executor patch 能力的 stage 可以选择 active executor，合约最终用 order-level authorization、active executor overlay 和 EIP-712 签名决定 signal 是否被接受。

## Store 中也会再次出现 Zhixu、凝结核和 Supplier

同一个对象在不同目录里的侧重点不同：

| 目录 | Zhixu / 凝结核侧重点 | Supplier 侧重点 |
| --- | --- | --- |
| 核心概念 | DSL 字段、`spec.nucleation.id`、Plan 编译、plan hash、chain registration、order instance。 | 能力主体、trust subject、capability passport、signal authorization 边界。 |
| 秩序商店 | Store 给凝结核提供设计、组织、发布材料、proof 和申请材料审核的工作台。 | 凝结核如何组织供应商网络，Store 如何维护目录、联系、平台标签、proof 和材料审核请求材料。 |

## 怎么读

1. 本页建立对象词汇（概念入口）。
2. 按需读[对象页](core/zhixu.md)（`core/` 下每个对象一页）。
3. 再读架构三篇：[架构](architecture.md)、[数据流与事实源](data-flow-and-truth.md)、[Plan 与订单生命周期](lifecycle.md)。
4. 最后按主题深入：[状态机](state-machine/README.md)、[产物与哈希](artifacts-and-hashes.md)、[信任与授权](trust/README.md)、[产品表面](product/README.md)。

## 再读同级篇章

| 篇章 | 说明 |
| --- | --- |
| [架构](architecture.md) | 模块边界、依赖方向、事实源和数据流。 |
| [状态机](state-machine/README.md) | 合约如何保存 signal、求值 hook、处理 timer 和 stage overlay；它属于核心组件链路。 |
| [产物与哈希](artifacts-and-hashes.md) | 编译产物、canonical hash、稳定 ID 和注册参数。 |
| [信任与授权](trust/README.md) | Identity Registry、Plan 发布、订单级 signal 授权、EIP-712 和 relayer 边界。 |
| [产品表面](product/README.md) | chain-services 如何把链事件投影成普通用户能读懂的订单、任务和证明。 |
| [秩序商店](store/README.md) | Store 是一级产品/治理系统，给凝结核提供工作台，并重新解释 Zhixu/Supplier、身份校验、联系通知、履约记录和平台 workflow。 |
| [Order App 与 executor-kit](apps/order-app-vs-executor-kit.md) | 参与者 App 与执行者集成面如何消费任务并提交 signal。 |

## 边界检查

- 合约与链事件决定 plan、order、signal、hook、publication 的真实状态；Store、Order App、Product API 组织用户语言和元数据，协议事实来自链事件。
- Indexer 数据库必须能从事件重建，不能成为事实源。
- Relayer 可以代付或转发交易，但不能替参与方生成业务签名。
- Supplier identity（材料审核）与订单 signal 授权分层。
- Executor/resource patch 只影响单个 Order，Plan 保持静态版本。
- `supplierType=zhixu` 通过 proof 校验、docking link 和授权 signal 映射推动 local order。
- Trigger hook Ready 打开可处理任务；链上订单身份由 trigger order 入口创建。
- `fileResources` 是资源句柄，业务文件明文留在链下。
- Store metadata 组织对象与目录；plan/supplier identity 来自 registry events。
- Store admin 负责平台 workflow；凝结核负责秩序内部治理；Identity Registry operator 负责身份核验与 binding。
- Executor Kit 是执行者集成面，围绕状态机和 Product API 工作。
- Funding、payment、guarantee、agent adapter 可以作为 Supplier 或 Executor 的实现形态出现，围绕核心接口消费 signal/proof，不新增事实源。

这些边界的完整论述见 [协议边界](protocol-boundaries.md)。
