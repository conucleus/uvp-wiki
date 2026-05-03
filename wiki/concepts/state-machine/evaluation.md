# Hook 求值

链上 hook 求值使用 stack machine。编译器把 Hook DSL AST 编译成 `Instruction[]`，合约按顺序执行指令，最后得到一个 `EvalValue`。

## Instruction

Solidity 里的指令结构是：

```solidity
struct Instruction {
    InstructionOp op;
    bytes32 sourceId;
    bytes32 signalId;
    uint64 delaySeconds;
    uint8 inputCount;
}
```

`InstructionOp` 支持：

| Op | 含义 |
| --- | --- |
| `Signal` | 查询订单里某个 `signalKey` 是否已经提交。 |
| `Not` | 负条件。内部条件出现或等待时，外层会取消或继续等待。 |
| `And` | 多个输入都成立才成立。 |
| `Or` | 任一输入成立即成立。 |
| `Delay` | 基于正向锚点计算到期时间。 |

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

合约求值结果不是简单布尔值，而是带时间信息：

```solidity
struct EvalValue {
    bool value;
    bool waiting;
    bool cancelled;
    uint64 anchorAt;
    uint64 dueAt;
}
```

| 字段 | 含义 |
| --- | --- |
| `value` | 条件现在是否成立。 |
| `waiting` | 条件是否在等待未来时间或依赖。 |
| `cancelled` | 条件是否已经被负条件取消。 |
| `anchorAt` | 正向锚点发生时间。 |
| `dueAt` | timer 可被 poke 的时间。 |

## Operator 语义

`SIGNAL` 查询 `SignalRecord`。存在则 `value=true`，`anchorAt=submittedAt`；不存在则 `value=false`。

`DELAY` 需要内部条件先成立。若当前时间小于 `anchorAt + delaySeconds`，结果进入 waiting，并记录 `dueAt`。到期后再次求值才会 ready。

`NOT` 是取消语义，不是普通布尔取反。负条件出现后会把外层 hook 推向 `Cancelled`。

`AND` 要求所有输入都满足。如果某些输入还在等待，则整体等待；如果任一输入取消，则整体取消。

`OR` 任一分支满足即可满足。编译器要求每个 OR 分支有正向锚点，避免纯负条件让状态机没有可追踪的等待点。

## 合约是权威实现

`hook-core` 和 `statemachine` 里有本地语义模型，用于编译前验证和 replay 测试。最终链上状态以 `UVPStateMachine.sol` 的求值结果为准；如果本地模型和合约语义不一致，应通过测试和文档明确修正。
