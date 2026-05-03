# Order App and Executor Kit

Order App and executor-kit are both entry points for signal producers, but they serve different users. The full Executor Kit integration guide is in [Executor Kit](../../../execution/executor-kit.md), and the docked Zhixu guide is in [Zhixu as Executor](../../../execution/zhixu-as-executor.md).

## Order App

`uvp-order-app/app` is for ordinary participants. It should show:

- Invitations and onboarding.
- Task inbox.
- Current wallet responsibility.
- Supplier backing.
- Evidence fingerprints.
- Submission confirmation.
- Proof rows.
- Readiness and blocked reasons.

It should not expose ordinary users to HookPlan, `sourceId`, `signalId`, ABI, calldata, or gas details.

## Executor Kit

`uvp-executor-kit/package` is for executors, enterprise systems, AI / MCP adapters, and executors. It has two modes:

| Mode | Purpose |
| --- | --- |
| Chain mode | Watch `HookReady` directly and submit low-level signals, suitable for advanced chain-native integrations. |
| Product API mode | Read Product API tasks / signal containers, prepare evidence, signing, submission, and proof, suitable for most integrations. |

It is not an “ordinary product surface”; it is an executor integration surface. Most executors should use Product API mode. Only advanced integrations that need to listen to `HookReady` directly, manage their own handlers, and send direct contract transactions should use chain mode.

## Shared Boundary

Neither side can ultimately bypass:

- Order-level signal authorization.
- EIP-712 business signature.
- payload hash.
- first-writer-wins signal semantics.
- chain event proof.
- active executor overlay.

Order App is the human task interface; executor-kit is the automation and system integration interface. Neither owns order state.
