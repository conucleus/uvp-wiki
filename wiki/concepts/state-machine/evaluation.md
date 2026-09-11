---
title: Hook 求值
type: explanation
audience: 工程贡献者
status: verified
---

# Hook 求值

链上 hook 求值使用 stack machine。编译器把 Hook DSL AST 编译成 `Instruction[]`，合约按顺序执行指令，最后得到一个 `EvalValue`。

## Instruction

Solidity 里的指令结构是：

```solidity
struct Instruction {
    uint8 op;            // 指令词表的数值编码
    bytes32 sourceId;
    bytes32 signalId;
    uint16 arity;        // And/Or 的输入个数
    uint64 delaySeconds; // Delay 的延时时长
}
```

指令词表收敛为五个操作码，声明顺序即协议编码值（`Signal=0`、`Not=1`、`And=2`、`Or=3`、`Delay=4`，勿重排）：

| Op | 含义 |
| --- | --- |
| `Signal` | 查询订单里某个 `signalKey` 是否已经提交。 |
| `Not` | 缺席条件。内部 signal 尚未出现时可继续满足；该 signal 出现（或内部条件仍在等待）后，外层分支取消。 |
| `And` | 所有输入都成立才成立。 |
| `Or` | 任一输入成立即成立。 |
| `Delay` | 基于正向锚点计算到期时间。 |

词表外的操作码在 `commitPlan` 注册边界被 `_validateHook` 显式 revert（`InvalidInstruction`），不依赖解码层的无名回滚。

## 示例

Hook DSL：

```text
buyer::(task.pay.cmp +5s) & ~task.pay.refund
```

可能编译为类似指令：

```text
SIGNAL buyer/task.pay.cmp
DELAY 5
SIGNAL buyer/task.pay.refund
NOT
AND 2
```

## EvalValue

合约求值结果是带时间信息的结构化值：

```solidity
struct EvalValue {
    bool value;     // 条件现在是否成立
    bool wait;      // 是否在等待未来时间（timer 未到期）
    bool cancel;    // 是否已被缺席条件取消
    uint64 dueAt;   // timer 可被 poke 的时间
    uint64 anchorAt; // 正向锚点发生时间
}
```

`wait/ready/cxl` 是 hook 运行态；云侧语义层另有 `init`（尚未收敛的初始态）等中间态，但它不是链上 `Instruction[]` 的求值结果。跨源订阅统一使用 `::ANCHOR(@source::task.stage.signal)`；路由层按 source 类逐事件投递，`mint: per-fact` 决定是否从事实代铸订单，汇聚（撮合）语义由无锚监听、多条订阅与执行器配对表达。

## Operator 语义

`SIGNAL` 查询 `SignalRecord`。存在则 `value=true`、`anchorAt=submittedAt`；不存在则 `value=false`（无等待）。

`DELAY` 需要内部条件先成立。若当前时间小于 `anchorAt + delaySeconds`，结果进入 `wait=true` 并记录 `dueAt`；到期后再次求值才 ready，且到期时刻成为新的 `anchorAt`——链式延时（如 `(A + 1s) + 5s`）的外层延时从内层到期时刻起算。延时上限为 30 天。

`NOT` 表示缺席语义。内部条件为假且不在等待时，`NOT` 成立（`value=true`）；内部条件成立、或仍在等待（例如内层 DELAY 未到期）时，`NOT` 直接进入 `cancel=true`。

`AND` 任一输入取消则整体取消；全部输入成立则整体成立，锚点取各输入锚点的较晚者；存在等待输入且其余输入已成立或也在等待时，整体等待（`dueAt`/`anchorAt` 取较晚者）；否则（有输入为假且不在等待）整体为假，等待后续 signal 到达时重新求值。

`OR` 任一输入成立即成立，锚点只在已就绪分支中竞争、取最早者（等待分支的陈旧锚点不参与）；有输入在等待则整体等待（`dueAt`/`anchorAt` 取最早者）；两输入都取消才整体取消；否则为假。编译器要求每个 OR 分支有正向锚点，避免纯缺席条件让状态机没有可追踪的等待点。

## 提交与去重

`submitSignal()` 按 `(planId, orderId, sourceId, signalId)` 去重：同一订单
作用域内的 `signalKey` 只有第一次提交会写入 `SignalRecord`（first-writer-wins），
重复提交以 `SignalAlreadyExists` 回滚。提交时合约检查 submitter 是否持有显式订单级授权，或是否是当前 active
executor overlay 委任的钱包；两者都不满足时提交被拒绝。授权模型详见
[Signal 授权](../trust/signal-authorization.md)。任何 replay oracle、索引和
Product API 都必须携带 `planId`，不能用 bare `orderId` 跨 plan 归并。

## 合约是权威实现

TypeScript 侧的 `hook-core` 与 `statemachine` package 不再各自维护本地语义模型：解析、求值与 replay 都委托给 Rust `uvp-core`（语义边界 `uvp.semantic.v1`），由它与合约保持一致。最终链上状态以 `UVPStateMachine.sol` 的求值结果为准；如果 `uvp-core` 与合约语义不一致，应通过测试和文档明确修正。
