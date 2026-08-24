---
title: Hook Evaluation
type: explanation
audience: 工程贡献者
status: verified
---

# Hook Evaluation

On-chain hook evaluation uses a stack machine. The compiler turns the Hook DSL AST into `Instruction[]`, the contract executes the instructions in order, and the result is an `EvalValue`.

## Instruction

The instruction structure in Solidity is:

```solidity
struct Instruction {
    InstructionOp op;
    bytes32 sourceId;
    bytes32 signalId;
    uint64 delaySeconds;
    uint8 inputCount;
}
```

`InstructionOp` supports:

| Op | Meaning |
| --- | --- |
| `Signal` | Check whether a particular `signalKey` has already been submitted in the order. |
| `Not` | Absence condition. It can still hold while the internal signal has not appeared; once that signal appears, the outer branch is cancelled. |
| `And` | Holds only if all inputs hold. |
| `Or` | Holds if any input holds. |
| `Delay` | Compute the due time from a positive anchor. |

Besides `wait/ready/cxl`, core evaluation can also return `needs_more`: the `::MERGE@(...)` and `::ANCHOR@(...)` entry points use per-event delivery semantics — the expression itself does not aggregate a verdict, but hands each contributing event to the state machine for lineage and pairing rules; therefore these two hook kinds are not yet supported in on-chain HookPlans, and the compiler rejects them explicitly at compile time.

## Example

Hook DSL:

```text
buyer::(task.pay.cmp +5s) & ~task.pay.refund
```

It may compile into instructions like:

```text
SIGNAL buyer/task.pay.cmp
DELAY 5
SIGNAL buyer/task.pay.refund
NOT
AND 2
```

## EvalValue

The contract evaluation result is a structured value with time information:

```solidity
struct EvalValue {
    bool value;
    bool waiting;
    bool cancelled;
    uint64 anchorAt;
    uint64 dueAt;
}
```

| Field | Meaning |
| --- | --- |
| `value` | Whether the condition currently holds. |
| `waiting` | Whether the condition is waiting on future time or dependencies. |
| `cancelled` | Whether the condition has already been cancelled by an absence condition or a cancellation path. |
| `anchorAt` | The time the positive anchor occurred. |
| `dueAt` | The time when the timer may be poked. |

## Operator Semantics

`SIGNAL` checks `SignalRecord`. If it exists, `value=true` and `anchorAt=submittedAt`; otherwise `value=false`.

`DELAY` requires the internal condition to hold first. If the current time is less than `anchorAt + delaySeconds`, the result enters waiting and records `dueAt`. It becomes ready only when it is evaluated again after the due time.

`NOT` represents signal-absence semantics. While the observed signal has not yet appeared, this condition can still participate in evaluation; once that signal has already been submitted into the order event set, the outer hook depending on the absence condition enters `Cancelled`.

`AND` requires every input to hold. If some inputs are still waiting, the whole expression waits; if any input is cancelled, the whole expression is cancelled.

`OR` is satisfied when any branch is satisfied. The compiler requires every OR branch to have a positive anchor so that the state machine does not end up with a pure absence condition and no trackable waiting point.

## Submission and Dedup

`submitSignal()` deduplicates by `(orderId, sourceId, signalId)`: for the same `signalKey` only the first submission writes a `SignalRecord` (first-writer-wins), while a duplicate submission reverts with `SignalAlreadyExists`. On submission the contract also checks whether the submitter holds an explicit order-level authorization, or is the wallet currently delegated by the active executor overlay; when neither holds, the submission is rejected. For the authorization model, see [Signal Authorization](../trust/signal-authorization.md).

## The Contract Is the Authority

`hook-core` and `statemachine` contain local semantic models for pre-compilation validation and replay tests. The final on-chain state follows the evaluation result in `UVPStateMachine.sol`; if the local model and contract semantics diverge, tests and documentation should make the correction explicit.
