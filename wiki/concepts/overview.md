# 核心概念

`uvp-eth` 的核心是一套把秩序 (Zhixu) 协作规则书落到 EVM 链上的状态机协议。合约和链事件是事实源；服务、Store、Order App、executor-kit 围绕这个事实源做编译、索引、展示、签名和提交。

最短对象关系先这样读：

```text
秩序 (Zhixu): 这类协作怎么运行
  -> 订单 (Order): 这一次协作正在运行
  -> 执行者 (Executor): 这一步由谁处理
  -> 信号 (Signal): 谁提交了什么声明和证据指纹
  -> Proof / Product view: 这件事为什么可追踪
```

工程实现会再把这条关系拆成编译产物、链上注册参数、trust registry、状态机求值、事件 replay 和 Product DTO。这些是第二层，不是第一次理解 UVP 的入口。

## 读法

基础词从这里进入。秩序 (Zhixu) 是可复用规则书，订单 (Order) 是运行实例，Executor 和 Signal 解释谁实际推进订单，其余对象分别服务编译、授权、背书、执行和展示：

| 子页 | 说明 |
| --- | --- |
| [Zhixu DSL](core/zhixu.md) | 秩序的代码名和 DSL 形态，描述 task、stage、source、signal、supplier 边界和选择权。 |
| [Order](core/order.md) | 某个 Plan 的动态运行实例，保存 signal、hook runtime 和 overlay。 |
| [Executor](core/executor.md) | 某个订单里真正执行或提交 signal 的主体，包括 peer Zhixu 作为 executor。 |
| [Signal](core/signal.md) | 状态机接受的最小业务输入，由授权钱包签名提交。 |
| [Plan](core/plan.md) | 某个 Zhixu 针对某条链编译出的确定性产物。 |
| [Nucleus / 凝结核](core/nucleation.md) | Zhixu 的发起核、设计者和秩序组织者；`nucleation` 是字段和成核上下文。 |
| [Supplier](core/supplier.md) | 被 Store 注册、标注、背书的能力主体和 trust subject。 |
| [Source 因果链](core/source.md) | signal 所在的因果语境，同源串联、分叉、交汇都靠它表达。 |
| [Hook](core/hook.md) | 从 signal 条件求出阶段 readiness 的规则。 |
| [Trigger](core/trigger.md) | 特殊 hook 标记，决定何时发出 `HookReady` 并打开可处理任务。 |
| [File Resources](core/file-resources.md) | 阶段资源句柄，指向链下对象、协议文件或资源 manifest。 |

再读同级篇章：

| 篇章 | 说明 |
| --- | --- |
| [架构](architecture.md) | 模块边界、依赖方向、事实源和数据流。 |
| [状态机](state-machine.md) | 合约如何保存 signal、求值 hook、处理 timer 和 stage overlay；它属于核心组件链路。 |
| [产物与哈希](artifacts-and-hashes.md) | 编译产物、canonical hash、稳定 ID 和注册参数。 |
| [信任与授权](trust-and-authorization.md) | trust registry、计划认证、订单级 signal 授权、EIP-712 和 relayer 边界。 |
| [产品表面](product-surfaces.md) | chain-services 如何把链事件投影成普通用户能读懂的订单、任务和证明。 |
| [秩序商店](../store/README.md) | Store 如何给凝结核提供工作台，并组织 Zhixu/Supplier、trust 校验、联系通知、履约记录和平台 workflow。 |
| [执行者与集成](../execution/README.md) | Executor Kit、docked Zhixu、Order App、adapter 和 MCP/AI 执行入口。 |

## 边界检查

- 合约与链事件决定计划、订单、signal、hook、attestation 的真实状态。
- Indexer 数据库必须能从事件重建，不能成为事实源。
- Relayer 可以代付或转发交易，但不能替参与方生成业务签名。
- Store、Order App、Product API 组织用户语言和元数据，提交动作仍经过链上授权。
- Store 是一级 trust/workflow 系统，和普通产品表面分层描述。
- Store admin 拥有平台 workflow 权限；凝结核负责秩序内部设计；trust registry 负责外部背书。
- Executor Kit 是执行者集成面，围绕状态机和 Product API 工作。
- USDC、escrow、guarantee、AI agent 等属于 adapter 或 periphery，围绕核心接口消费 signal/proof。
