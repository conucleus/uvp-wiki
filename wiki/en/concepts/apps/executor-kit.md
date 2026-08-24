---
title: Executor Kit
type: explanation
audience: 执行者、集成工程师
preread: order-app-vs-executor-kit.md
status: verified
---

# Executor Kit

`uvp-executor-kit/package` is the CLI/SDK for executors, enterprise systems, and supervised agents. It connects tasks, evidence, signatures, and submission actions to UVP on-chain fact sources.

Executor Kit has two equally important signal-producer surfaces:

| Mode | Input | Output | Use case |
| --- | --- | --- | --- |
| Chain-native | `UVPStateMachine.HookReady`, local handler config, wallet. | Directly builds a `submitSignal` transaction or dry-run job. | Advanced chain-native executors, self-managed watchers. |
| Product API | Product task / signal container / evidence id. | Standard prepare/sign/submit/proof flow. | Enterprise scripts, supervised AI/MCP, ordinary automation integration. |

## Product API mode

Product API mode is the default integration entry point. It lets executors avoid understanding HookPlan, sourceId, signalId, ABI, and gas details; they only handle tasks, evidence, and signatures.

```text
product tasks
  -> product task get
  -> product evidence hash
  -> product prepare
  -> sign prepared typed data
  -> product submit
  -> product proof/status
```

Key commands:

- `uvp-executor product tasks`: list tasks visible to the wallet; key flags `--chain-services-url`, `--wallet-address`.
- `uvp-executor product prepare <taskId>`: generate a prepared submit file; key flags `--evidence-id`, `--intent`, `--prepared-file`.
- `uvp-executor product submit <taskId>`: submit a prepared signal; reads the private key only from the environment variable named by the required `--private-key-env` flag, and verifies that the prepared message's submitter matches the signer.

Normal output hides low-level protocol internals; `--verbose` is for debugging typed data or raw API payloads only. Full command syntax and parameter lists: [CLI and configuration](../../reference/cli-and-config.md).

## Chain-native mode

Chain-native mode watches on-chain `HookReady` directly:

```text
HookReady(orderId, hookId, stageId, hookName)
  -> watcher job
  -> handler decides payload hash and signal
  -> authorized wallet signs/submits
  -> SignalSubmitted / HookStatusChanged proof
```

Key commands:

- `uvp-executor chain-once`: scan `HookReady` once and produce a job or dry-run; key flags `--rpc-url`, `--state-machine`, `--config`, `--dry-run`.
- `uvp-executor chain-watch`: keep listening and persist jobs; key flags `--jobs-file`, others same as above.

The chain watcher job identity must include the emitting state-machine address so that in multi-deployment environments a `HookReady` from contract A is never called back against contract B. Full command syntax: [CLI and configuration](../../reference/cli-and-config.md).

## Doctor and blocked reasons

- `uvp-executor doctor`: non-spending diagnostic to confirm the environment before taking out a private key; key flags `--chain-services-url`, `--wallet-address`, `--task-id`.

It should answer:

- whether the API is reachable;
- whether the wallet can see the task;
- whether the task is `canSubmit`;
- whether the blocked reason is assignee, deadline, required evidence, supplier identity, or proof endpoint;
- whether the next step is `prepare`, `wait`, `proof`, or `blocked`.

Doctor needs no private key and should not print protocol secrets.

## MCP/AI adapter

The MCP adapter is a thin wrapper around the `product.ts` SDK. AI agents, MCP tools, enterprise scripts, and the browser Order App all connect to the same Product API prepare/sign/submit/proof boundary.

```ts
import { createProductMcpAdapter } from "@uvp-eth/executor-kit/mcp";

const uvp = createProductMcpAdapter({ chainServicesUrl: "http://127.0.0.1:8787" });
await uvp.uvp_list_tasks({ walletAddress });
await uvp.uvp_prepare_signal({ taskId: "task_123", walletAddress });
await uvp.uvp_submit_signal({ prepared, privateKeyEnv: "UVP_PARTICIPANT_PRIVATE_KEY", walletAddress });
```

MCP can assist with preparation, routing, and result display; the authorized participant's signature is still made by the corresponding wallet. `includeRaw: true` should be used only in explicit wallet-signing handoffs or protocol debugging.

## Permission boundaries

- order-level signal authorization is created by the registrar/product flow or the contract authorization path.
- the active executor overlay is checked by the state machine.
- the relayer key broadcasts transactions; the business signer is the authorized participant.
- local job state is execution-tool state; on-chain state comes from events/proof.
- funding, guarantee, and payment placeholders belong to the periphery/adapter vocabulary.
- private keys, seed phrases, RPC secrets, and JWT secrets stay in environments or secret systems; logs and wiki pages record redacted information only.

For protocol-side invariants see [Protocol boundaries](../protocol-boundaries.md); for the split from Order App see [Order App vs Executor Kit](order-app-vs-executor-kit.md).
