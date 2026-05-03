# Executor Kit

`uvp-executor-kit/package` is the CLI/SDK for executors, enterprise systems, and supervised agents. It connects tasks, evidence, signatures, and submissions to UVP on-chain facts.

Executor Kit has two equally important signal-producer surfaces:

| Mode | Input | Output | Use case |
| --- | --- | --- | --- |
| Chain-native | `UVPStateMachine.HookReady`, local handler config, wallet. | Directly build a `submitSignal` transaction or dry-run job. | Advanced chain-native executors, self-managed watchers. |
| Product API | Product task / signal container / evidence id. | Standard prepare/sign/submit/proof flow. | Enterprise scripts, supervised AI/MCP, ordinary automation integrations. |

## Product API Mode

Product API mode is the default integration entry point. It lets the executor avoid understanding HookPlan, sourceId, signalId, ABI, and gas details; it only needs to handle tasks, evidence, and signatures.

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

```bash
uvp-executor product tasks \
  --chain-services-url http://127.0.0.1:8787 \
  --wallet-address 0x0000000000000000000000000000000000000002

uvp-executor product prepare task_123 \
  --chain-services-url http://127.0.0.1:8787 \
  --wallet-address 0x0000000000000000000000000000000000000002 \
  --evidence-id ev_123 \
  --intent confirm_stage \
  --prepared-file .uvp-prepared-submit.json

UVP_PARTICIPANT_PRIVATE_KEY=0x... uvp-executor product submit task_123 \
  --chain-services-url http://127.0.0.1:8787 \
  --prepared-file .uvp-prepared-submit.json \
  --private-key-env UVP_PARTICIPANT_PRIVATE_KEY
```

Normal output hides low-level protocol internals; `--verbose` is only for debugging typed data or raw API payloads. `product submit` only reads the private key from the environment variable named by `--private-key-env`, and it verifies that the submitter in the prepared message matches the signer.

## Chain-Native Mode

Chain-native mode watches on-chain `HookReady` directly:

```text
HookReady(orderId, hookId, stageId, hookName)
  -> watcher job
  -> handler decides payload hash and signal
  -> authorized wallet signs/submits
  -> SignalSubmitted / HookStatusChanged proof
```

Key commands:

```bash
uvp-executor chain-once \
  --rpc-url http://127.0.0.1:8545 \
  --state-machine 0x0000000000000000000000000000000000000001 \
  --chain-id 31337 \
  --config uvp-executor-kit/package/fixtures/state-machine-executor.config.json \
  --wallet-address 0x0000000000000000000000000000000000000002 \
  --dry-run

uvp-executor chain-watch \
  --rpc-url http://127.0.0.1:8545 \
  --state-machine 0x0000000000000000000000000000000000000001 \
  --chain-id 31337 \
  --config uvp-executor-kit/package/fixtures/state-machine-executor.config.json \
  --jobs-file .uvp-executor-jobs.json \
  --dry-run
```

The chain watcher job identity must include the emitting state-machine address, so a `HookReady` from contract A is not accidentally routed to contract B in a multi-deployment environment.

## Doctor and Blocked Reason

`doctor` is a non-spending diagnostic command, useful for confirming the environment before using a private key:

```bash
uvp-executor doctor \
  --chain-services-url http://127.0.0.1:8787 \
  --wallet-address 0x0000000000000000000000000000000000000002 \
  --task-id task_123
```

It should answer:

- whether the API is reachable;
- whether the wallet can see the task;
- whether the task can submit;
- whether the blocked reason is assignee, deadline, required evidence, supplier trust, or proof endpoint;
- whether the next step is `prepare`, `wait`, `proof`, or `blocked`.

Doctor does not need a private key, and it should not print protocol secrets.

## MCP/AI Adapter

The MCP adapter is a thin wrapper around the `product.ts` SDK. AI agents, MCP tools, enterprise scripts, and browser-based Order App all connect to the same Product API prepare/sign/submit/proof boundary.

```ts
import { createProductMcpAdapter } from "@uvp-eth/executor-kit/mcp";

const uvp = createProductMcpAdapter({ chainServicesUrl: "http://127.0.0.1:8787" });
await uvp.uvp_list_tasks({ walletAddress });
await uvp.uvp_prepare_signal({ taskId: "task_123", walletAddress });
await uvp.uvp_submit_signal({ prepared, privateKeyEnv: "UVP_PARTICIPANT_PRIVATE_KEY", walletAddress });
```

MCP can assist with preparation, routing, and result display; the authorized participant still signs with the corresponding wallet. `includeRaw: true` should only be used in explicit wallet-signing handoff or protocol debugging.

## Permission Boundary

- order-level signal authorization is created by the registrar/product flow or the contract authorization path.
- the active executor overlay is checked by the state machine.
- the relayer key is used to broadcast transactions; the business signer is the authorized participant.
- local job state belongs to the execution tool, while on-chain state comes from events/proof.
- funding, guarantee, and payment placeholders belong to the periphery/adapter vocabulary.
- private keys, seed phrases, RPC secrets, and JWT secrets stay in environment variables or secret systems; logs and wiki pages should only contain redacted information.
