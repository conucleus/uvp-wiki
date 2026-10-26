---
title: UVP Client
type: explanation
audience: 执行者、集成工程师
preread: order-app-vs-uvp-client.md
status: verified
---

# UVP Client

> 前置阅读：[Order App 与 UVP Client](order-app-vs-uvp-client.md)

`@uvp-eth/uvp-client` 是公共客户端 SDK + 执行者 CLI：一个包，四个入口。它只负责签名、构造、提交与读取链上/服务端事实，不拥有订单状态、会话、私钥或服务进程。

| 入口 | 负责 | 不负责 |
| --- | --- | --- |
| `@uvp-eth/uvp-client/core` | transport/auth seam、chain target、signal build/decode/submit、validation、signing helpers、evidence hash | 浏览器/宿主策略、服务端 |
| `@uvp-eth/uvp-client/browser` | 注入式 EIP-1193 签名、Product V3 客户端、会话读模型、deadline/format、Product typed-data 校验 | env/localStorage/私钥 |
| `@uvp-eth/uvp-client/headless` | 私钥钱包处理、`HookReady` watcher、watch 状态与 job store、非花费 doctor | 浏览器 provider |
| `@uvp-eth/uvp-client/cli` | 执行者命令：wallet、doctor、chain-once/chain-watch、chain-signal | 任何 server/队列 |

ABI、EIP-712 typed data 与 canonical hash 单源在 `@uvp-eth/protocol-bindings`；通用 API DTO 单源在 `@uvp-eth/product-dto`。

## CLI

```bash
pnpm --filter @uvp-eth/uvp-client cli -- --help
```

- `wallet new|address`、`faucet info`：钱包材料只从显式 env 读取，不打印私钥。
- `doctor`：非花费诊断，检查 handler config、RPC chain id/head、state-machine 合约代码与 signer 地址；任一检查失败退出码 1。
- `chain-once` / `chain-watch`：扫描 `HookReady` 并按 config 提交 `submitSignal`。状态默认落 `<state-dir>/jobs.json` 与 `cursor.json`，`--job-store memory` 保持进程内。
- `chain-signal`：构造或广播一笔 `submitSignal`；`--dry-run` 只打印确定性调用。

```bash
pnpm --filter @uvp-eth/uvp-client cli -- doctor \
  --config uvp-client/package/fixtures/state-machine-executor.config.json

pnpm --filter @uvp-eth/uvp-client cli -- chain-once \
  --rpc-url http://127.0.0.1:8545 \
  --chain-id 31337 \
  --config uvp-client/package/fixtures/state-machine-executor.config.json \
  --wallet-address 0x0000000000000000000000000000000000000002 \
  --dry-run
```

`chain-once`/`chain-watch` 在扫描结果含非 benign error，或存在 failed/dead_letter job 时以退出码 1 结束；重试/死信由 SDK 的 `retryStateMachineJob`/`deadLetterStateMachineJob` 提供，CLI 不再暴露 jobs 子命令。

## Browser 入口

宿主注入 `baseUrl`、`fetch` 和 session-token 读取器；包内不读 env/localStorage/私钥。

```ts
import {
  createProductClient,
  getBrowserEthereumProvider,
  requestProductSubmitSignature,
  verifyInviteAcceptTypedData,
} from '@uvp-eth/uvp-client/browser';

const client = createProductClient({ baseUrl, getSessionToken: () => hostSessionToken() });
const typedData = await client.prepareFinalize(draftId);
await requestProductSubmitSignature(getBrowserEthereumProvider()!, typedData, walletAddress);
```

Product API 错误以 `ProductError` 暴露 `kind`/`status`/`errorCode`，宿主按 `unauthorized`/`forbidden`/`not_found`/`conflict`/`gone`/`unavailable` 分流，不解析文案。

## Headless 入口

```ts
import {
  createStateMachineWatcher,
  createStateMachineHandlersFromConfig,
  loadStateMachineHandlerConfig,
  submitStateMachineSignal,
} from '@uvp-eth/uvp-client/headless';
```

watcher 语义：finality buffer（默认 1，非本地 runtime 必须显式）、block-hash cursor 连续性、`eth_getLogs` 分块、poll/resend 指数退避、pid run claim；收据默认等待，未确认广播不会被记成 delivered。空 payload 用协议常量 `bytes32(0)` 表示，不是缺失数据。

## 边界

- 不起 HTTP server、不拥有数据库、不做业务裁决。
- 不创建 order-level signal authorization；授权来自 `UVPStateMachine` 的 plan/order 事实。
- CLI/SDK 不托管私钥；只从显式 env 读取。
- funding/guarantee/payment placeholder 属于 periphery/adapter 口径。

协议不变量总纲见[协议边界](../protocol-boundaries.md)；与 Order App 的分工见 [Order App 与 UVP Client](order-app-vs-uvp-client.md)。
