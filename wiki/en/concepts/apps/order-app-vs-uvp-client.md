---
title: Order App vs UVP Client
type: explanation
audience: Executors, integration engineers
preread: ../core/executor.md
status: verified
---

# Order App vs UVP Client

> Prerequisite: [Executor](../core/executor.md)

Order App and uvp-client are both signal-producer entry points, but they differ in user and runtime location: Order App is the human order flow in the browser; uvp-client is the public library and executor CLI for the same sign/build/submit surface. See [UVP Client](uvp-client.md) for details.

## Execution entries

| Entry | For | Fact boundary |
| --- | --- | --- |
| Order App (browser) | Ordinary participants: create, invite, accept, tasks, order room. | Uses `uvp-client/browser` for Product DTOs, injected wallet, and typed data; owns no order state. |
| `uvp-client/browser` | Host apps (Order App and used-car host). | Host injects the EIP-1193 provider and session; no env/localStorage/private keys. |
| `uvp-client/headless` | Enterprise scripts, supervised agents, future MCP, chain executors. | Private keys come from explicit env only; watcher/job store is executor tool state. |
| `uvp-client/cli` | Executors/operators in a terminal running watch/signal/doctor/wallet. | No server; creates no order authorization. |

Order App is the human order surface; uvp-client is the public client for automation, host integration, and executors. Both end at the same on-chain authorization and event proofs.

## Order App

`uvp-order-app/app` keeps one participant flow only:

- wallet session and participant identity;
- order draft → invites → buyer EIP-712 finalize;
- invite acceptance and the order-room read view.

The UI never exposes HookPlan, sourceId, signalId, ABI, calldata, or gas. Product transport, wallet signing, and typed-data verification come from `@uvp-eth/uvp-client/browser`.

## UVP Client

`uvp-client/package` is the public client with four entries:

| Entry | Use |
| --- | --- |
| `/core` | transport, chain target, signal build/decode/submit, validation, evidence. |
| `/browser` | Product V3 client, EIP-1193 signing, session/deadline/format, typed-data verification. |
| `/headless` | private-key wallet, watcher, watch state, doctor. |
| `/cli` | executor commands wallet/doctor/watch/signal. |

Chain-native executors use the headless watcher plus `chain-signal`; host apps use the browser entry; both share one core construction/submission implementation instead of duplicating transport.

## Common boundaries

This section is the single authoritative statement for the execution surface.

Neither entry can bypass:

- order-level signal authorization;
- EIP-712 business signatures;
- payload hashes;
- first-writer-wins signal semantics;
- chain event proofs;
- the active executor overlay.

Order App owns no order state; uvp-client owns no order state, session, or private key.
