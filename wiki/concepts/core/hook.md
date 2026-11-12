---
title: Hook
type: explanation
audience: 协议读者
preread: ../README.md
status: verified
---

# Hook

> 前置阅读：[核心概念](../README.md)
Hook 是状态机判断“某个阶段条件是否成立”的最小规则。它不是 HTTP webhook，也不是外部系统回调；它是 Order 事实集上的状态机条件。Zhixu stage 的 `receiveSignals` 每一项都会编译成一个 `kind=receive` hook；`sendSignals` 条目中标记 `trigger: true` 的出生信号还会合成一条 order-trigger hook（同一 `kind=receive`，`orderTriggerKind: trigger`）。dock 阶段不产生额外伪 hook——它的 receive hook 带 dock executor 标记，跨秩序发射条件由独立 `kind: Dock` 文档声明。

Hook 本身只是条件。带 `emitReady=true` 的 hook Ready 时，链上才会发出 `HookReady`；`orderTriggerKind` 说明该 Ready 是否落在出生入口。Product/Store 应只把已确认的 `HookReady` 投影成正式可执行任务。

## 谁使用

凝结核在 stage 的 `receiveSignals` 里声明同单 hook 条件，在 `sendSignals` 条目上声明出生信号与发射适格；编译器把两者规范化并编入 Plan；状态机在订单事实集上求值；Product/Store/uvp-client 跟随 `HookReady` 创建任务和通知。出生信号在空订单上下文过适格后建单并写入首事实。

## 产生什么结果

hook 求值产生 `HookStatusChanged` 状态流转；`emitReady=true` 的 hook 第一次 Ready 时发出 `HookReady`，成为 Product task、Store intent 和 adapter job 的投影依据。`orderTriggerKind` 闭集为 `none`、`trigger`：普通 receive hook 为 `none`，出生 hook 为 `trigger`；dock 阶段以 `dockExecutor` 标记区分，不新增 kind。编译产物 `triggers[]` 逐一枚举全部 `trigger` 的 order-trigger hook。

## 权威来自哪里

hook 条件的权威形态是链上 `UVPStateMachine.StoredHook`（由 Plan 注册固化）；本页的表达式和 AST 说明以 hook-core parser 与 compiler 实现为准，UI 展示只是读模型。

## Hook 表达式

普通 Hook 表达式使用 `source::condition` 形式。解析器要求表达式有 source 和 condition；Hook 条件只在本订单事实集上求值。跨秩序事实不会让 Hook 变成“跨单订阅”：B 侧以静态 Dock 声明发射条件，运行期 binding/poke 把满足条件的 B 输出写成本订单事实，hook 再消费这条订单内事实：

```text
source::condition
```

例如：

```text
buyer::(pay.cmp +5s) & ~pay.refund
```

这句话表示：来自 `buyer` 的 `pay.cmp` signal 出现后等待 5 秒；在这个判断窗口里，如果 `pay.refund` 还没有出现，条件成立。

Hook 表达式里的 `~A` 是存在逻辑里的缺席判断。它表示“当前订单事实集中还没有出现 A signal”。signal 一旦被授权提交到订单中，就成为可重放事件，不能在后续判断里消失或变回未出现。因此 `~pay.refund` 的含义是“退款 signal 尚未发出”；如果退款 signal 已经出现，这个依赖它缺席的分支会被取消。

## 支持的 AST 节点

解析后的节点类型只有这些：

| 节点 | 含义 |
| --- | --- |
| `signal` | 等待某个 `stage.signal` 出现。 |
| `not` | 缺席条件，表示某个 signal 尚未出现；如果它后来出现，依赖该缺席条件的分支取消。 |
| `and` | 多个条件都满足。 |
| `or` | 任一分支满足。 |
| `delay` | 某个正向锚点出现后等待一段时间（正整数时长，上限 30 天）。 |

解析器会拒绝没有正向锚点的条件，也会拒绝 `OR` 中没有正向锚点的分支。纯缺席条件例如 `buyer::~cancel.cmp` 不能成为 hook，因为状态机需要先有一个正向事件，才能知道从什么时候开始判断“尚未出现”。

## HookPlan 里保存什么

编译器为每个 `receiveSignals` 生成一个 `kind=receive` hook；`sendSignals` 条目中 `trigger: true` 的出生信号合成一条 order-trigger hook（单条 `SIGNAL` 指令、`emitReady=true`、`orderTriggerKind: trigger`）；`validWhen` 声明编译为独立的 admission 条目（flag 8）。dock 阶段的 receive hook 带 `HOOK_FLAG_DOCK_EXECUTOR`（flag 16）标记，执行者由运行期选择，不生成出生 hook。

可读 hook 通常包含：

| 字段 | 含义 |
| --- | --- |
| `hookId` | 平台中立字符串，形如 `stageIdentifier#hookName`。 |
| `kind` | `receive`；适格条目为 `admission`。 |
| `stageIdentifier` | 这个 hook 属于哪个 stage。 |
| `hookName` | hook 名称，来自 `receiveSignals` 的 key；出生 hook 的 hookName 是该信号名。 |
| `orderTriggerKind` | `none` 或 `trigger`；标明 Ready 是否落在出生入口。 |
| `emitReady` | 是否在 Ready 时发出 `HookReady`。 |
| `dockExecutor` | 是否属于 dock 阶段（对应 flag 16）。 |
| `rawExpression` | 原始表达式。 |
| `normalizedExpression` | 编译器规范化后的表达式。 |
| `ast` | hook 条件 AST。 |
| `dependencies` | 依赖的 source/signal/timer。 |
| `route` | 链下路由元数据（executor route 引用）；不进链上 runtime `planHash`。 |

## Ready 与订单入口

只有 `emitReady=true` 的 hook 在合约里第一次变成 `Ready` 时会发出 `HookReady`；`orderTriggerKind` 为 `none` 或 `trigger`。Product 任务创建、Store 通知和 uvp-client watcher 都跟随 `HookReady`，UI 草稿或后端临时状态只用于辅助展示。

出生入口语义见 [Trigger](trigger.md)。

## Hook 和链上计划的关系

Hook 是单个条件；链上计划产物是某个 Zhixu 编译后所有 hook、admission、依赖索引、executor routes 和 selector bindings 的集合，另用派生读面 `triggers[]` 枚举全部 order-trigger hook 的出生事实。

```text
Zhixu stage.receiveSignals
  -> Hook
  -> OnchainHookPlanArtifact
  -> UVPStateMachine.StoredHook
```

普通用户不直接读链上 artifact。Product DTO 把它翻译成“任务何时出现、谁能提交、需要什么证据、proof 在哪里”。
