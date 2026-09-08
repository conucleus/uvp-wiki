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
    uint8 op;            // numeric encoding of the instruction vocabulary
    bytes32 sourceId;
    bytes32 signalId;
    uint16 arity;        // input count for And/Or
    uint64 delaySeconds; // delay length for Delay
}
```

The instruction vocabulary converges to five opcodes whose declaration order is the protocol encoding (`Signal=0`, `Not=1`, `And=2`, `Or=3`, `Delay=4`; do not reorder):

| Op | Meaning |
| --- | --- |
| `Signal` | Check whether a particular `signalKey` has already been submitted in the order. |
| `Not` | Absence condition. It can still hold while the internal signal has not appeared; once that signal appears (or the inner condition is still waiting), the outer branch is cancelled. |
| `And` | Holds only if all inputs hold. |
| `Or` | Holds if any input holds. |
| `Delay` | Compute the due time from a positive anchor. |

Opcodes outside the vocabulary are explicitly reverted by `_validateHook` at the `commitPlan` registration boundary (`InvalidInstruction`) instead of relying on unnamed decode-layer reverts.

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
    bool value;      // whether the condition currently holds
    bool wait;       // whether it is waiting on a future time (timer not yet due)
    bool cancel;     // whether it has been cancelled by an absence condition
    uint64 dueAt;    // the time when the timer may be poked
    uint64 anchorAt; // the time the positive anchor occurred
}
```

`wait/ready/cxl` are hook runtime statuses; the cloud-side semantic layer additionally has `init` (a not-yet-converged initial state), which is not an on-chain `Instruction[]` evaluation result. Cross-source subscriptions uniformly use `::ANCHOR(@source::task.stage.signal)`; the routing layer delivers facts by source class, `mint: per-fact` decides whether a fact derives an order, and aggregation (matching) semantics are expressed as anchorless listening plus multiple subscriptions paired by the executor.

## Operator Semantics

`SIGNAL` checks `SignalRecord`. If it exists, `value=true` and `anchorAt=submittedAt`; otherwise `value=false` (not waiting).

`DELAY` requires the inner condition to hold first. If the current time is less than `anchorAt + delaySeconds`, the result enters `wait=true` and records `dueAt`; it becomes ready only when re-evaluated after the due time, and the maturity moment becomes the new `anchorAt` — a chained delay (e.g. `(A + 1s) + 5s`) counts the outer delay from the inner maturity. The delay is capped at 30 days.

`NOT` represents absence semantics. When the inner condition is false and not waiting, `NOT` holds (`value=true`); when the inner condition holds, or is still waiting (e.g. an inner DELAY not yet due), `NOT` goes straight to `cancel=true`.

`AND` cancels if any input cancels; holds when all inputs hold, with the anchor taken from the latest of the input anchors; waits when some input waits and the rest have either arrived or also wait (`dueAt`/`anchorAt` take the latest); otherwise (an input is false and not waiting) the whole is false and is re-evaluated when later signals arrive.

`OR` holds if any input holds, with the anchor competing only among ready branches and taking the earliest (a waiting branch's stale anchor does not compete); waits if any input waits (`dueAt`/`anchorAt` take the earliest); cancels only when both inputs cancel; otherwise it is false. The compiler requires every OR branch to have a positive anchor so that the state machine does not end up with a pure absence condition and no trackable waiting point.

## Submission and Dedup

`submitSignal()` deduplicates by `(planId, orderId, sourceId, signalId)`: within
one order scope only the first submission writes a `SignalRecord`
(first-writer-wins); a duplicate submission reverts with `SignalAlreadyExists`.
The contract also checks whether the submitter holds an
explicit order-level authorization, or is the wallet currently delegated by the
active executor overlay; when neither holds, the submission is rejected. Every
replay oracle, index, and Product API must carry `planId` and must not merge
orders across plans by bare `orderId`. For the authorization model, see
[Signal Authorization](../trust/signal-authorization.md).

## The Contract Is the Authority

The TypeScript `hook-core` and `statemachine` packages no longer maintain their own local semantic models: parsing, evaluation, and replay all delegate to the Rust `uvp-core` (semantic boundary `uvp.semantic.v1`), which stays consistent with the contract. The final on-chain state follows the evaluation result in `UVPStateMachine.sol`; if `uvp-core` and the contract semantics diverge, tests and documentation should make the correction explicit.
