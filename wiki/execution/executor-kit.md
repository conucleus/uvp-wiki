# Executor Kit

`uvp-executor-kit/package` 是 executor、企业系统和 supervised agent 的 CLI/SDK。它把任务、证据、签名和提交动作接到 UVP 链上事实源。

Executor Kit 有两个同等重要的 signal producer 表面：

| 模式 | 输入 | 输出 | 适用场景 |
| --- | --- | --- | --- |
| Chain-native | `UVPStateMachine.HookReady`、本地 handler config、钱包。 | 直接构造 `submitSignal` 交易或 dry-run job。 | 高级链原生 executor、自管 watcher。 |
| Product API | Product task / signal container / evidence id。 | prepare/sign/submit/proof 的标准流程。 | 企业脚本、supervised AI/MCP、普通自动化集成。 |

## Product API 模式

Product API mode 是默认集成入口。它让 executor 不必理解 HookPlan、sourceId、signalId、ABI 和 gas 细节，只需要处理任务、证据和签名。

```text
product tasks
  -> product task get
  -> product evidence hash
  -> product prepare
  -> sign prepared typed data
  -> product submit
  -> product proof/status
```

关键命令：

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

正常输出隐藏低层 protocol internals；`--verbose` 只用于调试 typed data 或原始 API payload。`product submit` 只从显式 `--private-key-env` 指定的环境变量取私钥，并校验 prepared message 的 submitter 与 signer 匹配。

## Chain-native 模式

Chain-native mode 直接看链上 `HookReady`：

```text
HookReady(orderId, hookId, stageId, hookName)
  -> watcher job
  -> handler decides payload hash and signal
  -> authorized wallet signs/submits
  -> SignalSubmitted / HookStatusChanged proof
```

关键命令：

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

chain watcher job identity 必须包含 emitting state-machine address，避免多部署环境里把 A 合约的 `HookReady` 回调到 B 合约。

## Doctor 和 blocked reason

`doctor` 是非花费诊断命令，适合在拿出私钥前先确认环境：

```bash
uvp-executor doctor \
  --chain-services-url http://127.0.0.1:8787 \
  --wallet-address 0x0000000000000000000000000000000000000002 \
  --task-id task_123
```

它应回答：

- API 是否可达；
- wallet 是否看得到任务；
- task 是否 `canSubmit`；
- blocked reason 是 assignee、deadline、required evidence、supplier trust 还是 proof endpoint；
- 下一步是 `prepare`、`wait`、`proof` 还是 `blocked`。

doctor 不需要私钥，也不应打印协议 secrets。

## MCP/AI adapter

MCP adapter 是 `product.ts` SDK 的薄封装，不是第二套 Product API 实现。AI agent、MCP tool、企业脚本和浏览器 Order App 都必须 dock 到同一个 Product API prepare/sign/submit/proof 边界。

```ts
import { createProductMcpAdapter } from "@uvp-eth/executor-kit/mcp";

const uvp = createProductMcpAdapter({ chainServicesUrl: "http://127.0.0.1:8787" });
await uvp.uvp_list_tasks({ walletAddress });
await uvp.uvp_prepare_signal({ taskId: "task_123", walletAddress });
await uvp.uvp_submit_signal({ prepared, privateKeyEnv: "UVP_PARTICIPANT_PRIVATE_KEY", walletAddress });
```

MCP 可以协助准备、路由和展示结果，不能代替授权参与方签名。`includeRaw: true` 只应在明确的钱包签名交接或协议调试中使用。

## Executor Kit 不能做什么

- 不能创建 order-level signal authorization。
- 不能绕过 active executor overlay。
- 不能把 relayer key 当业务 signer。
- 不能把 local job state 当链上状态。
- 不能把 funding、guarantee、payment placeholder 写成 UVP 核心协议能力。
- 不能把私钥、seed phrase、RPC secret、JWT secret 打印到日志或 wiki。
