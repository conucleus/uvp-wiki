---
title: Executor Kit
type: explanation
audience: 执行者、集成工程师
preread: order-app-vs-executor-kit.md
status: verified
---

# Executor Kit

> 前置阅读：[Order App 与 Executor Kit](order-app-vs-executor-kit.md)
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

- `uvp-executor product tasks`：列出钱包可见任务；要点 `--chain-services-url`、`--wallet-address`。
- `uvp-executor product prepare <taskId>`：生成 prepared submit 文件；要点 `--evidence-id`、`--intent`、`--prepared-file`。
- `uvp-executor product submit <taskId>`：提交已准备的信号；只从显式 `--private-key-env` 指定的环境变量取私钥（该参数为必填），并校验 prepared message 的 submitter 与 signer 匹配。

正常输出隐藏低层 protocol internals；`--verbose` 只用于调试 typed data 或原始 API payload。完整命令语法与参数清单见 [CLI 与配置](../../reference/cli-and-config.md)。

## Chain-native 模式

Chain-native mode 直接看链上 `HookReady`：

```text
HookReady(planId, orderId, hookId, stageId, hookName)
  -> watcher job
  -> handler decides payload hash and signal
  -> authorized wallet signs/submits
  -> SignalSubmitted / HookStatusChanged proof
```

关键命令：

- `uvp-executor chain-once`：单轮扫描 `HookReady` 并生成 job 或 dry-run；要点 `--rpc-url`、`--state-machine`、`--config`、`--dry-run`（`--dry-run` 是显式测试辅助：只演练扫描与准备，不提交任何交易）。
- `uvp-executor chain-watch`：持续监听并把 job 落盘；要点 `--jobs-file`、其余同上。

chain watcher job identity 必须包含 emitting state-machine address，避免多部署环境里把 A 合约的 `HookReady` 回调到 B 合约。完整命令语法见 [CLI 与配置](../../reference/cli-and-config.md)。

## 可靠性语义

提交与重试行为都是显式的，不做静默 best-effort：

- 到达 `submitted` 的 signal 不是终态：在链上事件证明最终结果之前，它可以被重扫与对账。
- 收据等待默认开启（`waitForReceipt` 默认 `true`），只在明确需要时才关闭。
- `chain-once` 与 `jobs retry` 在结果包含 error、或存在 failed/dead_letter job 时以退出码 1 结束；调度器和 CI 应据此把本轮视为失败，而不是继续。
- 重试判定只认显式错误码：没有错误码的错误不会被自动重试。
- Product API callback 内置 3 次指数退避重试，之后才报告失败；批量投递部分成功时按条目逐条记录结果。
- 动作没有业务载荷时，payloadHash 编码为协议常量 `bytes32(0)`——零值表示「无载荷」，不是缺失数据。
- `--dry-run` 始终是显式测试辅助：只演练扫描与准备，不提交任何交易。

## Doctor 和 blocked reason

- `uvp-executor doctor`：非花费诊断，拿出私钥前确认环境；要点 `--chain-services-url`、`--wallet-address`、`--task-id`。

它应回答：

- API 是否可达；
- wallet 是否看得到任务；
- task 是否 `canSubmit`；
- blocked reason 是 assignee、deadline、required evidence、supplier identity 还是 proof endpoint；
- 下一步是 `prepare`、`wait`、`proof` 还是 `blocked`。

doctor 不需要私钥，也不应打印协议 secrets。

## MCP/AI adapter

MCP adapter 是 `product.ts` SDK 的薄封装。AI agent、MCP tool、企业脚本和浏览器 Order App 都接到同一个 Product API prepare/sign/submit/proof 边界。

```ts
import { createProductMcpAdapter } from "@uvp-eth/executor-kit/mcp";

const uvp = createProductMcpAdapter({ chainServicesUrl: "http://127.0.0.1:8787" });
await uvp.uvp_list_tasks({ walletAddress });
await uvp.uvp_prepare_signal({ taskId: "task_123", walletAddress });
await uvp.uvp_submit_signal({ prepared, privateKeyEnv: "UVP_PARTICIPANT_PRIVATE_KEY", walletAddress });
```

MCP 可以协助准备、路由和展示结果；授权参与方签名仍由对应钱包完成。`includeRaw: true` 只应在明确的钱包签名交接或协议调试中使用。

## 权限边界

- order-level signal authorization 由 registrar/product flow 或合约授权路径创建。
- active executor overlay 由 state machine 检查。
- relayer key 用于广播交易，业务 signer 是授权参与方。
- local job state 是执行工具状态，链上状态看 events/proof。
- funding、guarantee、payment placeholder 属于 periphery/adapter 口径。
- 私钥、seed phrase、RPC secret、JWT secret 保持在环境或密钥系统中，日志和 wiki 只写 redacted 信息。

协议侧不变量总纲见[协议边界](../protocol-boundaries.md)；与 Order App 的分工对照见 [Order App 与 Executor Kit](order-app-vs-executor-kit.md)。
