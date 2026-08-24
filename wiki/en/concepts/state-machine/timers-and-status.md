---
title: Timers and Status
type: explanation
audience: 协议读者
status: verified
---

# Timers and Status

Hook runtime is stored inside the order. Each order has its own status for each hook in the plan.

## HookRuntime

```solidity
struct HookRuntime {
    HookStatus status;
    uint64 dueAt;
    bool readyEmitted;
}
```

Status enum:

| Status | Meaning |
| --- | --- |
| `Init` | Not yet satisfied and not in an explicit waiting state. |
| `Wait` | A positive anchor exists, and the hook is waiting for a timer or later conditions. |
| `Ready` | The hook condition is satisfied. |
| `Cancelled` | The hook has been terminated by an absence condition or a cancellation path. |

## Status Transition Events

After the contract evaluates a hook, if its status changes, it emits:

```text
HookStatusChanged(orderId, hookId, previousStatus, nextStatus, dueAt)
```

If a hook becomes `Ready` and `trigger=true`, the contract also emits once:

```text
HookReady(orderId, hookId, stageId, hookName)
```

`readyEmitted` ensures that the same hook in the same order will not create duplicate tasks.

## Timers Do Not Run Automatically

EVM contracts cannot run themselves automatically at some future time. After entering `Wait`, an external keeper, executor, or script must call, after the due time:

```solidity
pokeTimer(orderId, hookId)
```

The contract checks:

- The order exists.
- The hook exists.
- The current status is `Wait`.
- The current block time has reached `dueAt`.

After the check passes, the contract emits `TimerPoked` and reevaluates the hook.

## How Product Surfaces Should Show It

Product DTOs can display `Wait + dueAt` as "waiting until a certain time, then automatically or manually rechecking". But actual progression still requires an on-chain transaction. The frontend must not mark the task as ready just because local time has passed; it must wait for `HookReady` or a new `HookStatusChanged`.

Who may submit the signal that drives evaluation is decided by order-level authorization; see [Signal Authorization](../trust/signal-authorization.md).
