---
title: Hook
type: explanation
audience: 协议读者
preread: ../README.md
status: verified
---

# Hook

> 前置阅读：[核心概念](../README.md)
Hook 是状态机判断“某个阶段条件是否成立”的最小规则。它不是 HTTP webhook，也不是外部系统回调；它是 Order 事件集上的状态机条件。Zhixu stage 的 `receiveSignals` 每一项都会编译成一个 `kind=receive` hook；如果 stage 对接另一条 Zhixu，`inputMap`/`signalMap` 会作为 dock route/interface 数据固化，不再生成伪 hook。

Hook 本身只是条件。带 `emitReady=true` 的 hook Ready 时，链上才会发出 `HookReady`；`orderTriggerKind` 进一步说明该 Ready 是否会触发 mint 或 dock 入口。Product/Store 应只把已确认的 `HookReady` 投影成正式可执行任务。

## 谁使用

凝结核在 stage 的 `receiveSignals` 里声明 hook 条件；编译器把它们规范化并编入 Plan；状态机在订单事件上求值；Product/Store/executor-kit 跟随 `HookReady` 创建任务和通知。跨源事实通过 `::ANCHOR(@source::task.stage.signal)` 订阅进入路由层，`mint: per-fact` 决定是否从每条事实代铸订单。

## 产生什么结果

hook 求值产生 `HookStatusChanged` 状态流转；`emitReady=true` 的 hook 第一次 Ready 时发出 `HookReady`，成为 Product task、Store intent 和 adapter job 的投影依据。`orderTriggerKind` 的取值为 `none`、`mint` 或 `dock`。

## 权威来自哪里

hook 条件的权威形态是链上 `UVPStateMachine.StoredHook`（由 Plan 注册固化）；本页的表达式和 AST 说明以 hook-core parser 与 compiler 实现为准，UI 展示只是读模型。

## Hook 表达式

普通 Hook 表达式使用 `source::condition` 形式。`parseHookExpression()` 要求表达式有 source 和 condition；跨源订阅使用空标头 `::ANCHOR(@source::task.stage.signal)`：

```text
source::condition
```

例如：

```text
buyer::(task.pay.cmp +5s) & ~task.pay.refund
```

这句话表示：来自 `buyer` 的 `task.pay.cmp` signal 出现后等待 5 秒；在这个判断窗口里，如果 `task.pay.refund` 还没有出现，条件成立。

Hook 表达式里的 `~A` 是存在逻辑里的缺席判断。它表示“当前订单事件集中还没有出现 A signal”。signal 一旦被授权提交到订单中，就成为可重放事件，不能在后续判断里消失或变回未出现。因此 `~task.pay.refund` 的含义是“退款 signal 尚未发出”；如果退款 signal 已经出现，这个依赖它缺席的分支会被取消。

## 支持的 AST 节点

解析后的节点类型只有这些：

| 节点 | 含义 |
| --- | --- |
| `signal` | 等待某个 `task.stage.signal` 出现。 |
| `subscription` | `::ANCHOR(@source::task.stage.signal)` 跨源事实订阅：按 source 类逐事件路由；是否从事实代铸订单由 stage 的 `mint: per-fact` 决定。 |
| `not` | 缺席条件，表示某个 signal 尚未出现；如果它后来出现，依赖该缺席条件的分支取消。 |
| `and` | 多个条件都满足。 |
| `or` | 任一分支满足。 |
| `delay` | 某个正向锚点出现后等待一段时间（正整数时长，上限 30 天）。 |

解析器会拒绝没有正向锚点的条件，也会拒绝 `OR` 中没有正向锚点的分支。纯缺席条件例如 `buyer::~task.cancel.cmp` 不能成为 hook，因为状态机需要先有一个正向事件，才能知道从什么时候开始判断“尚未出现”。

## HookPlan 里保存什么

编译器为每个 `receiveSignals` 生成一个 `kind=receive` hook；不再有 stage 级 `trigger` 或 `externalSignals` 字段。若 executor 是 `supplierType=zhixu`，`inputMap`/`signalMap` 只描述目标 dock 端口，不能承载 Hook DSL；它们被编入 dock route/interface commitments，不生成伪 `signalMap` hook。

可读 hook 通常包含：

| 字段 | 含义 |
| --- | --- |
| `hookId` | 平台中立字符串，形如 `stageIdentifier#hookName`。 |
| `kind` | 当前为 `receive`；dock 的 input/output 映射属于 route/interface commitment。 |
| `stageIdentifier` | 这个 hook 属于哪个 stage。 |
| `hookName` | hook 名称，来自 `receiveSignals` 的 key。 |
| `orderTriggerKind` | `none`、`mint` 或 `dock`；标明 Ready 是否触发代铸或 dock 入口。 |
| `emitReady` | 是否在 Ready 时发出 `HookReady`。 |
| `rawExpression` | 原始表达式。 |
| `normalizedExpression` | 编译器规范化后的表达式。 |
| `ast` | hook 条件 AST。 |
| `dependencies` | 依赖的 source/signal/timer。 |
| `route` | executor 或 dispatch 相关路由信息。 |

## Ready 与订单入口

只有 `emitReady=true` 的 hook 在合约里第一次变成 `Ready` 时会发出 `HookReady`；`orderTriggerKind` 取 `none`、`mint` 或 `dock`。Product 任务创建、Store 通知和 executor-kit watcher 都跟随 `HookReady`，UI 草稿或后端临时状态只用于辅助展示。

详细语义见 [Trigger](trigger.md)。

## Hook 和链上计划的关系

Hook 是单个条件；链上计划产物是某个 Zhixu 编译后所有 hook、依赖索引、executor routes 和 selector bindings 的集合。

```text
Zhixu stage.receiveSignals
  -> Hook
  -> OnchainHookPlanArtifact
  -> UVPStateMachine.StoredHook
```

普通用户不直接读链上 artifact。Product DTO 把它翻译成“任务何时出现、谁能提交、需要什么证据、 proof 在哪里”。
