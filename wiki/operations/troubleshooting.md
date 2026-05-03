# 排障

## `pnpm install` 或 workspace 命令失败

检查：

- Node.js 是否为 20+；
- pnpm 是否为 9.15.0；
- 是否从仓库根目录运行；
- 是否有未安装的 package filter target。

先跑：

```bash
pnpm check
pnpm test
```

再缩小到具体 package。

## ABI Fixture Drift

症状：

- `pnpm verify:protocol-freeze` 失败；
- event topic、selector、ABI hash 或 bytecode hash 不一致。

处理：

1. 确认这是有意的 public interface change。
2. 更新 fixture。
3. 检查 `protocol-bindings`、chain-services、executor-kit、deploy scripts。
4. 补测试和 release note。

不要为了让测试通过而静默改 fixture。

## 链事件重放不一致

症状：

- bootstrap summary 中 `mismatches > 0`；
- expected/observed event count 不一致；
- HookReady/HookStatusChanged 顺序或状态不一致。

检查：

- compiler output 是否改变 planHash；
- signal authorization 是否缺失；
- duplicate signal 是否被 first-writer-wins 处理；
- timer 是否到了 due time；
- negative condition 是否取消了 hook；
- statemachine oracle fixture 是否需要同步更新。

## Product API 返回 demo/fallback

Staging/production 不应依赖 demo fallback。

检查：

- `VITE_UVP_CHAIN_SERVICES_URL` 是否设置；
- `UVP_PRODUCT_E2E_FIXTURES` 是否误开；
- `/product/zhixus?fallback=demo` 是否被误用；
- chain-services runtime profile 是否拒绝 permissive fallback；
- trust projection 是否缺失或 plan 已 revoked。

## Order App 看不到任务

检查：

- `wallet` 或 `VITE_UVP_ORDER_APP_WALLET_ADDRESS` 是否和授权 submitter 一致；
- `/product/me/tasks` 是否返回空；
- order-level `SignalSubmitterAuthorized` 是否已 index；
- supplier trust 是否 revoked；
- task 是否等待其他前置 signal；
- Product API URL 是否指向真实服务而不是 test/stub URL。

## Relayer 不广播

检查：

- `UVP_STATE_MACHINE_RELAYER_BROADCAST_ENABLED`；
- gas-payer private key env name；
- signer 是否等于 typed data 中的 submitter；
- submitter 是否有 order-level authorization；
- chain id 和 state-machine address 是否匹配；
- pending/retry queue 是否已有失败记录。

## Base Sepolia RPC 慢或 timeout

默认使用 `https://sepolia.base.org`。如果换 RPC，先用 non-spending preflight 验证
`eth_chainId`、chain id `84532` 和基本读取稳定性，再进入 broadcast rehearsal。
