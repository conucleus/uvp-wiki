# Executor

Executor 是某个订单运行时真正承接阶段、产生业务动作或提交 signal 的执行者。它可以是一个人、企业系统、供应商派出的钱包、adapter、AI/MCP agent，也可以是一条独立的 Zhixu 秩序。

Executor 要和 Supplier 分开：

| 对象 | 解决的问题 | 典型权威 |
| --- | --- | --- |
| Supplier | 谁具备某类现实履约能力，是否被 trust domain 背书。 | Store metadata + `ZhixuTrustRegistry` supplier attestation。 |
| Executor | 当前订单、当前阶段实际由谁执行或提交 signal。 | `UVPStateMachine` order authorization、stage executor overlay、EIP-712 签名。 |

Supplier 是能力主体和 trust subject；Executor 是运行时绑定和 signal submitter。一个 Supplier 可以派出多个 executor 钱包；一个 Executor 也可能代表一个 supplier、一个 adapter，或一条可独立运行的 Zhixu。

## Executor 怎么被选出来

Executor 不是从后端表里“生效”的。产品路径通常是：

```text
Supplier 在秩序商店注册
  -> Store 维护 capability tags、联系方式、履约记录和 trust projection
  -> Trust domain 对 supplier subject 做 attestation/revocation
  -> Zhixu stage 声明需要某类 executor 或 supplier
  -> Order 注册时写入 order-level signal authorization
  -> Selector stage 可通过 executor patch 指定 active executor
  -> active executor 才能提交目标 stage 的业务 signal
```

Store 给凝结核和 operator 提供候选网络、联系能力和 proof 材料；链上 selector binding、订单级授权、active executor overlay 和 EIP-712 签名决定某个订单能否接受它提交的 signal。

## 静态 Executor

Zhixu DSL 的 `executor` 是计划里的静态默认配置。它表达“这个 stage 预期由哪类主体承接”，但不等于当前订单已经授权某个钱包。

```yaml
executor:
  supplierType: organization
  supplierID: "{{ .customs_broker_uid }}"
```

静态 executor 会进入编译产物的 executor route，帮助 Product API、Store、Order App 和 executor-kit 知道该阶段应当找谁、显示什么履约说明、需要什么资源或证据。但 signal 是否可提交，仍要看订单注册授权和运行时 overlay。

## 动态 Active Executor

某些 stage 不是在 Plan 里写死 executor，而是由 selector stage 在订单运行中选择。selector stage 必须在 `selectedStages` 里被授权选择目标 stage。

```yaml
selectedStages:
  - customs.complete
sendSignals:
  - select_executor
```

运行时会出现类似事件：

```text
StageExecutorPatchApplied(orderId, selectorStageId, targetStageId, selector, executor, ...)
StageExecutorActivated(orderId, targetStageId, executor, ...)
```

active executor overlay 只影响这个 Order，不修改 Plan。目标 stage 一旦有 active executor，后续该 stage 的业务 signal 必须由 active executor 提交；即使另一个钱包原本有 signal 授权，合约也会按 overlay 拒绝错误 submitter。

## Zhixu 也可以是 Executor

这是 UVP 设计里最关键的扩展点：一条秩序可以把另一个 Zhixu 当成自己的执行者。也就是说，父订单的某个 stage 不一定由一个公司、一个人或一个脚本完成，而是由一条独立的子秩序完成。

典型例子是 Africa MRO：

- 主订单 `africa-mro-master` 负责矿山/水站 MRO 总履约。
- 主订单中的 `supplier_settlement_exec` 阶段把供应商结算委托给 `payment-settlement` 这条 Zhixu。
- `payment-settlement` 内部如果遇到非 USDC 供应商，又把 `fiat_bridge` 阶段委托给 `fiat-payout-bridge` 这条 Zhixu。

父 stage 的写法是：

```yaml
executor:
  supplierType: zhixu
  supplierID: "{{ .fiat_payout_bridge_zhixu_uid }}"
  zhixuExecutorConfig:
    signalMap:
      str: fiat_bridge::payout.start.str
      cmp: fiat_bridge::payout.close.cmp
      err: fiat_bridge::payout.close.err
```

这里的含义不是“把子订单状态偷偷写进父订单数据库”。含义是：

1. 父 Plan 声明这个 stage 的 executor 类型是 `zhixu`。
2. `supplierID` 指向 Store/Trust Registry 可以识别的 peer Zhixu 或其 supplier subject。
3. `signalMap` 声明父 stage 如何等待或解释子秩序输出信号。
4. 编译器会为 `signalMap` 生成 `kind=signalMap` hook，`str` 和 `cmp` 必须存在，且同一个 signalMap 必须引用同一个 source。
5. 子秩序的创建、通知、proof 校验和父订单信号桥接由 Store/Product/adapter/executor-kit 工作流完成。
6. 父订单和子订单各自仍以自己的 `UVPStateMachine` 事件为事实源。

当前链上状态机不会自动跨 order 读取另一条 order 的事件。docked Zhixu 的工程模型是：子秩序独立运行，Store/Product 或 adapter 观察子订单 proof，再由被授权的 submitter 把映射后的 signal 提交回父订单。这个桥接动作也必须留下链上 signal proof，不能靠 Store metadata 冒充完成。

## Docked Zhixu 的运行时路径

```text
父订单某个 trigger hook Ready
  -> Product/Store 创建父 stage task
  -> Store 选择或确认 peer Zhixu 版本
  -> Product/adapter 注册或定位子订单
  -> 子订单按自己的 Plan、授权、executor 执行
  -> 子订单产生 str/cmp/err proof
  -> adapter 校验 proof 和 signalMap
  -> 授权 submitter 向父订单提交映射后的 signal
  -> 父订单对应 hook Ready / Cancelled / next stage
```

这里可以出现两个编号体系：

- 链上父 `orderId` 和子 `orderId` 由各自的 `registerOrder()` 产生或绑定。
- Product task、Store docking session、adapter job 可以有自己的执行编号，但这些编号只是工作流索引，不能替代链上 order/signal proof。

## signalMap 不是普通回调

`signalMap` 是父 stage 接受子秩序输出的语义契约，不是随便配置一个 webhook。

| 字段 | 语义 |
| --- | --- |
| `str` | 子秩序开始或已接收委托的信号。当前 compiler 要求必须存在。 |
| `cmp` | 子秩序完成的信号。当前 compiler 要求必须存在。 |
| `err` | 子秩序失败、拒绝或异常的信号。可选但大多数真实 workflow 应配置。 |

编译器会校验 `signalMap` 表达式能被 hook-core 解析，并校验引用的本地 stage/signal 是否存在。它不会替你创建子订单，也不会替你生成父订单授权。

## Executor Kit 的位置

`uvp-executor-kit` 是 Executor 的集成工具箱，详见 [Executor Kit](../../execution/executor-kit.md)。它有两个同等重要的入口：

- Chain-native：监听 `HookReady`，按 handler 路由并提交授权 signal。
- Product API：读取 task/signal container，准备证据、签名、提交并读取 proof。

Executor Kit 可以帮助 executor 观察任务、生成 payload hash、签名、提交和诊断 blocked reason。它不能创建订单授权，不能用 relayer key 冒充业务 signer，也不能把 adapter 状态写成协议事实。

## 常见误解

- Supplier trusted 不等于这个订单里的 executor 已授权。
- active executor overlay 只影响单个 Order，不改 Plan。
- `supplierType=zhixu` 不表示父订单自动继承子订单状态；跨秩序接入要通过 proof 校验和授权 signal 映射。
- executor-kit 是 signal producer 工具，不是可信后端。
