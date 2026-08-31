---
title: Order App vs Executor Kit
type: explanation
audience: 执行者、集成工程师
preread: ../core/executor.md
status: verified
---

# Order App vs Executor Kit

> Prerequisite reading: [Executor](../core/executor.md)
Order App and executor-kit are both entry points for signal producers, but they serve different users. Full Executor Kit documentation: [Executor Kit](executor-kit.md); docked Zhixu documentation: [Zhixu as an execution interface](zhixu-as-executor.md).

## Three execution entry points

| Entry point | Best for | Fact boundary |
| --- | --- | --- |
| Order App | Ordinary participants, human task handling. | Consumes only Product DTOs and signal containers. |
| Executor Kit Product API mode | Enterprise systems, supervised agents, scripts, future MCP tools. | Submits through the prepare/sign/submit/proof boundary. |
| Executor Kit chain-native mode | Advanced chain-native executors, executors. | Listens to `HookReady` directly and submits authorized `submitSignal`. |

Most real integrations should prefer Product API mode. Chain-native mode is reserved for executors that need low-level HookReady access and direct contract interaction.

## Order App

`uvp-order-app/app` faces ordinary participants and shows:

- invitations and onboarding.
- task inbox.
- current wallet responsibility.
- supplier backing.
- evidence fingerprints.
- submission confirmation.
- proof rows.
- readiness and blocked reasons.

The ordinary user interface does not expose HookPlan, sourceId, signalId, ABI, calldata, or gas details.

## Executor Kit

`uvp-executor-kit/package` faces executors, enterprise systems, AI/MCP adapters, and executors. It has two mode families:

| Mode | Purpose |
| --- | --- |
| Chain mode | Watches `HookReady` directly and submits low-level signals; for advanced chain-native integrations. |
| Product API mode | Reads Product API tasks / signal containers and prepares evidence, signing, submission, and proof; for most integrations. |

Its place is the executor integration surface. Most executors take Product API mode; only advanced integrations that need to listen to `HookReady` directly, self-manage handlers, and send direct contract transactions take chain mode.

## Common boundaries

This section is the sole authoritative statement of execution-surface boundaries.

Neither can ultimately bypass:

- order-level signal authorization;
- the EIP-712 business signature;
- payload hash;
- first-writer-wins signal semantics;
- chain event proof;
- the active executor overlay.

Order App is the human task interface; executor-kit is the automation and system integration interface. Neither owns order state.
