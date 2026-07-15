# 核心概念

核心概念定义 UVP 的协议对象。这些对象是 Store、Product API、Order App、executor-kit 和 periphery adapter 共同消费的语言层。

本页是对象索引，不是第一篇教程。新读者可以先抓住四个基础对象：秩序 (Zhixu) 是可复用协作规则书，订单 (Order) 是一次运行，执行者 (Executor) 是运行时处理者，信号 (Signal) 是被授权提交的业务声明。其他对象用于解释版本、因果、任务打开、材料审核、资源和 proof。

```text
第一层：Zhixu -> Order -> Executor -> Signal
第二层：Plan / Source / Hook / Trigger / File Resources
治理层：Nucleus / Supplier / publication / Authorization
展示层：Proof / Product DTO / Store / Order App / executor-kit
```

## 对象地图

### 第一遍先读

| 对象 | 先读 | 核心问题 |
| --- | --- | --- |
| 秩序 (Zhixu) | [Zhixu DSL](../concepts/core/zhixu.md) | 协作秩序如何被静态描述。 |
| Order | [Order](../concepts/core/order.md) | 一次具体运行如何记录 signal、任务和 proof。 |
| Signal | [Signal](../concepts/core/signal.md) | 被授权业务声明如何签名、去重和提交。 |
| Executor | [Executor](../concepts/core/executor.md) | 当前订单、当前阶段真正执行或提交 signal 的主体是谁。 |

### 需要解释规则内部时再读

| 对象 | 先读 | 核心问题 |
| --- | --- | --- |
| Plan | [Plan](../concepts/core/plan.md) | Zhixu 如何变成静态、可认证、可注册的编译产物。 |
| Source | [Source 因果链](../concepts/core/source.md) | signal 所在的因果语境如何串联、分叉和交汇。 |
| Hook | [Hook](../concepts/core/hook.md) | readiness 和状态变化如何从 signal 条件求出。 |
| Trigger | [Trigger](../concepts/core/trigger.md) | 哪个 hook Ready 后打开可处理任务并发出 `HookReady`。 |
| File Resources | [File Resources](../concepts/core/file-resources.md) | stage 资源句柄如何指向链下协议、证据模板或资源 manifest。 |

### 需要解释组织和材料审核时再读

| 对象 | 先读 | 核心问题 |
| --- | --- | --- |
| Nucleus / 凝结核 | [Nucleus / 凝结核](../concepts/core/nucleation.md) | 谁发起、设计和维护一条 Zhixu 秩序；`nucleation` 是 DSL 字段和成核上下文。 |
| Supplier | [Supplier](../concepts/core/supplier.md) | 注册供应商、能力主体、trust subject、capability passport 如何表达。 |
| Trust / Authorization | [信任与授权](../concepts/trust-and-authorization.md) | 谁被材料审核，谁能提交订单动作，这两件事如何分开。 |

## Supplier 和 Executor 的位置

Supplier 是 Store 对现实履约主体的组织方式：凝结核可以在秩序设计里描述需求，Store 维护 profile、能力 tags、联系、匹配和 proof 材料；`UVPIdentityRegistry` 只登记 subject 与钱包。真正的任务授权仍来自 Order 的签名和订单级授权，能力标签不是协议前置条件。

Executor 是订单运行时的执行绑定：静态秩序可以声明默认 executor，具备 stage executor patch 能力的 stage 可以选择 active executor，合约最终用 order-level authorization、active executor overlay 和 EIP-712 签名决定 signal 是否被接受。

## Store 中也会再次出现 Zhixu、凝结核和 Supplier

同一个对象在不同目录里的侧重点不同：

| 目录 | Zhixu / 凝结核侧重点 | Supplier 侧重点 |
| --- | --- | --- |
| 核心概念 | DSL 字段、`spec.nucleation.id`、Plan 编译、plan hash、chain registration、order instance。 | 能力主体、trust subject、capability passport、signal authorization 边界。 |
| 秩序商店 | Store 给凝结核提供设计、组织、发布材料、proof 和申请材料审核的工作台。 | 凝结核如何组织供应商网络，Store 如何维护目录、联系、平台标签、proof 和材料审核请求材料。 |

## 边界检查

- supplier identity 和订单 signal 授权分层展示。
- Executor patch 只影响单个 Order，Plan 保持静态版本。
- `supplierType=zhixu` 通过 proof 校验、docking link 和授权 signal 映射推动 local order。
- Trigger 打开可处理任务；链上订单身份由 trigger order 入口创建。
- `fileResources` 是资源句柄，业务文件明文留在链下。
- Store metadata 组织对象；plan/supplier identity 来自 registry events。
- Store admin 负责平台 workflow；凝结核负责秩序内部治理；Identity Registry operator 负责身份核验与 binding。
- Product DTO 是用户语言；协议事实来自链事件。
- Funding、payment、guarantee、agent adapter 可以作为 Supplier 或 Executor 的实现形态出现，事实边界仍围绕 core state machine。

## 状态机和秩序商店放在哪里

状态机是核心组件，放在 [链上执行与 Replay](../components/onchain-runtime.md) 下。秩序商店是一级产品/治理系统，放在 [秩序商店](../store/README.md) 下，并在那里重新解释秩序、Supplier、履约记录、联系通知和治理审核。
