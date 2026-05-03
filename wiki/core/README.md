# 核心概念

核心概念回答“协议对象是什么”。这些对象是 Store、Product API、Order App、executor-kit 和 periphery adapter 共同消费的语言层，不等同于某一个 UI 页面或后端表。

```text
Zhixu 定义
  -> Nucleation / 凝结核
  -> Supplier / Executor 能力和执行网络
  -> Source / Signal / Hook / Trigger
  -> File Resources
  -> Plan
  -> Order
  -> Attestation / Authorization / Proof
```

## 对象地图

| 对象 | 先读 | 核心问题 |
| --- | --- | --- |
| Zhixu | [Zhixu DSL](../concepts/core/zhixu.md) | 协作秩序如何被静态描述，并进入 deterministic compile boundary。 |
| Nucleation / 凝结核 | [Nucleation / 凝结核](../concepts/core/nucleation.md) | 谁发起、设计和维护一条 Zhixu 秩序。 |
| Supplier | [Supplier](../concepts/core/supplier.md) | 注册供应商、能力主体、trust subject、capability passport 如何表达。 |
| Executor | [Executor](../concepts/core/executor.md) | 订单运行时真正执行或提交 signal 的主体如何被选择、授权，以及 Zhixu 如何作为 executor dock 进另一个秩序。 |
| Source | [Source 因果链](../concepts/core/source.md) | signal 所在的因果语境如何串联、分叉和交汇。 |
| Signal | [Signal](../concepts/core/signal.md) | 状态机接受的最小业务输入如何签名、去重和授权。 |
| Hook | [Hook](../concepts/core/hook.md) | readiness 和状态变化如何从 signal 条件求出。 |
| Trigger | [Trigger](../concepts/core/trigger.md) | 哪个 hook Ready 后正式打开执行入口并发出 `HookReady`。 |
| File Resources | [File Resources](../concepts/core/file-resources.md) | stage 资源句柄如何指向链下协议、证据模板或资源 manifest。 |
| Plan | [Plan](../concepts/core/plan.md) | 静态、可认证、可注册的编译产物。 |
| Order | [Order](../concepts/core/order.md) | 某个 Plan 的动态运行实例和可重放事件流。 |

## Supplier 和 Executor 为什么是核心概念

Supplier 不是普通产品资料。它是 UVP 对现实履约能力的协议化入口：凝结核把 supplier 组织进秩序设计，Store 维护 profile、平台 tags、联系和 proof 材料，trust domain 通过 `SupplierAttested`/`SupplierRevoked` 对 supplier subject 背书，Product API 和 Order App 再把 supplier trust 作为任务、风险和授权前置条件的一部分展示。

Executor 也不是普通后台 worker。它是订单运行时的执行绑定：静态 Zhixu 可以声明默认 executor，selector stage 可以通过 stage executor patch 选择 active executor，合约最终用 order-level authorization、active executor overlay 和 EIP-712 签名决定 signal 是否被接受。

## Store 中也会再次出现 Zhixu、凝结核和 Supplier

同一个对象在不同目录里的侧重点不同：

| 目录 | Zhixu / 凝结核侧重点 | Supplier 侧重点 |
| --- | --- | --- |
| 核心概念 | DSL 字段、`spec.nucleation.id`、Plan 编译、plan hash、chain registration、order instance。 | 能力主体、trust subject、capability passport、signal authorization 边界。 |
| 秩序商店 | Store 给凝结核提供设计、组织、发布材料、proof 和申请背书的工作台。 | 凝结核如何组织供应商网络，Store 如何维护目录、联系、平台标签、proof 和背书请求材料。 |

## 不能混淆的边界

- Supplier trust 不等于订单 signal 授权。
- Executor patch 不会修改 Plan，只影响单个 Order。
- `supplierType=zhixu` 不会自动把子订单状态写入父订单；跨秩序推进必须通过 proof 校验和授权 signal 映射。
- Trigger 不创建链上 orderId；`registerOrder()` 才绑定链上订单身份。
- `fileResources` 是资源句柄，不是业务文件明文。
- Store metadata 可以组织对象，但不能创建 plan/supplier trust。
- Store admin 不替凝结核治理 Zhixu 内部，也不替 trust domain 判定公平可信。
- Product DTO 是用户语言，不是协议事实源。
- Funding、payment、guarantee、agent adapter 可以作为 Supplier 或 Executor 的实现形态出现，但不能成为 core state machine 的事实源。

## 状态机和秩序商店放在哪里

状态机是核心组件，不是对象词条；它放在 [链上执行与 Replay](../components/onchain-runtime.md) 下。秩序商店是一级产品/治理系统，不放在核心对象列表里；它放在 [秩序商店](../store/README.md) 下，并在那里重新解释 Zhixu、Supplier、履约记录、联系通知和治理审核。
