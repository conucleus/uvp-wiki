# 核心概念

核心概念定义 UVP 的协议对象。这些对象是 Store、Product API、Order App、executor-kit 和 periphery adapter 共同消费的语言层。`Zhixu` 是“秩序”的拼音，表示可复用协作规则书；`Order` 是“订单”，表示某个 Plan 的一次运行。

```text
秩序 (Zhixu) 定义
  -> Plan
  -> Order
  -> Nucleation / Supplier / Executor
  -> Source / Signal / Hook / Trigger
  -> File Resources
  -> Attestation / Authorization / Proof
```

## 对象地图

| 对象 | 先读 | 核心问题 |
| --- | --- | --- |
| 秩序 (Zhixu) | [Zhixu DSL](../concepts/core/zhixu.md) | 协作秩序如何被静态描述，并进入 deterministic compile boundary。 |
| Plan | [Plan](../concepts/core/plan.md) | 静态、可认证、可注册的编译产物。 |
| Order | [Order](../concepts/core/order.md) | 某个 Plan 的动态运行实例和可重放事件流。 |
| Nucleation / 凝结核 | [Nucleation / 凝结核](../concepts/core/nucleation.md) | 谁发起、设计和维护一条 Zhixu 秩序。 |
| Supplier | [Supplier](../concepts/core/supplier.md) | 注册供应商、能力主体、trust subject、capability passport 如何表达。 |
| Executor | [Executor](../concepts/core/executor.md) | 订单运行时真正执行或提交 signal 的主体如何被选择、授权，以及 Zhixu 如何作为 executor dock 进另一个秩序。 |
| Source | [Source 因果链](../concepts/core/source.md) | signal 所在的因果语境如何串联、分叉和交汇。 |
| Signal | [Signal](../concepts/core/signal.md) | 状态机接受的最小业务输入如何签名、去重和授权。 |
| Hook | [Hook](../concepts/core/hook.md) | readiness 和状态变化如何从 signal 条件求出。 |
| Trigger | [Trigger](../concepts/core/trigger.md) | 哪个 hook Ready 后打开可处理任务并发出 `HookReady`。 |
| File Resources | [File Resources](../concepts/core/file-resources.md) | stage 资源句柄如何指向链下协议、证据模板或资源 manifest。 |

## Supplier 和 Executor 的位置

Supplier 是 UVP 对现实履约能力的协议化入口：凝结核把 supplier 组织进秩序设计，Store 维护 profile、平台 tags、联系和 proof 材料，trust registry 通过 `SupplierAttested`/`SupplierRevoked` 对 supplier subject 背书，Product API 和 Order App 再把 supplier trust 作为任务、风险和授权前置条件的一部分展示。

Executor 是订单运行时的执行绑定：静态秩序可以声明默认 executor，具备 stage executor patch 能力的 stage 可以选择 active executor，合约最终用 order-level authorization、active executor overlay 和 EIP-712 签名决定 signal 是否被接受。

## Store 中也会再次出现 Zhixu、凝结核和 Supplier

同一个对象在不同目录里的侧重点不同：

| 目录 | Zhixu / 凝结核侧重点 | Supplier 侧重点 |
| --- | --- | --- |
| 核心概念 | DSL 字段、`spec.nucleation.id`、Plan 编译、plan hash、chain registration、order instance。 | 能力主体、trust subject、capability passport、signal authorization 边界。 |
| 秩序商店 | Store 给凝结核提供设计、组织、发布材料、proof 和申请背书的工作台。 | 凝结核如何组织供应商网络，Store 如何维护目录、联系、平台标签、proof 和背书请求材料。 |

## 边界检查

- Supplier trust 和订单 signal 授权分层展示。
- Executor patch 只影响单个 Order，Plan 保持静态版本。
- `supplierType=zhixu` 通过 proof 校验、docking link 和授权 signal 映射推动 local order。
- Trigger 打开可处理任务；链上订单身份由 trigger order 入口创建。
- `fileResources` 是资源句柄，业务文件明文留在链下。
- Store metadata 组织对象；plan/supplier trust 来自 registry events。
- Store admin 负责平台 workflow；凝结核负责秩序内部治理；trust registry 负责外部背书。
- Product DTO 是用户语言；协议事实来自链事件。
- Funding、payment、guarantee、agent adapter 可以作为 Supplier 或 Executor 的实现形态出现，事实边界仍围绕 core state machine。

## 状态机和秩序商店放在哪里

状态机是核心组件，放在 [链上执行与 Replay](../components/onchain-runtime.md) 下。秩序商店是一级产品/治理系统，放在 [秩序商店](../store/README.md) 下，并在那里重新解释秩序、Supplier、履约记录、联系通知和治理审核。
