---
title: Local Anvil 协议闭环
type: tutorial
audience: 工程贡献者
preread: ../how-to/quick-start.md
status: verified
---

# Local Anvil 协议闭环

这个教程验证最小链上语义闭环：

```text
Zhixu -> HookPlan -> OnchainHookPlan -> registerPlan/triggerOrderFromOutsideFor
  -> submitSignal/pokeTimer -> HookReady/HookStatusChanged
  -> statemachine chain replay oracle
```

## 前置条件

- 已运行 `pnpm install`。
- Foundry 和 Anvil 可用。
- 不需要真实私钥。脚本可使用本地 Anvil key。

## 只部署合约

在一个终端保持 Anvil 运行：

```bash
anvil --host 127.0.0.1 --port 8545 --chain-id 31337
```

在另一个终端执行：

```bash
pnpm deploy:local
```

该入口只接受 loopback RPC，部署当前 State Machine、冻结 modules、Deployment Registry 和 Identity Registry，并写入地址清单。

## Happy Path Self Update

```bash
uvp-deploy/deploy/scripts/bootstrap-local-anvil.sh --self-update
```

脚本会：

1. 启动或连接本地 Anvil。
2. 构建 workspace 和合约。
3. 部署 `UVPDeploymentRegistry`、`UVPIdentityRegistry`、`UVPStateMachine` 与六个 modules，并冻结 modules。
4. 编译 UVP update Zhixu YAML，目标为 `platform.type=blockchain`、
   `platform.provider=eth`、`platform.network=base`。
5. 由 publisher 签名并发布当前 Plan。
6. 由 creator 签 trigger typed data，创建 Order 并写入 signal submitter authorizations。
7. 提交链上 Signals。
8. 对 `HookReady`、`HookStatusChanged`、`TimerPoked` 做 replay oracle 校验。
9. `--self-update` 模式部署下一套 State Machine 与冻结 modules，登记 deployment cutover，并验证旧 Order 仍绑定原 Plan。

## Failure Branch

```bash
uvp-deploy/deploy/scripts/bootstrap-local-anvil.sh --failure
```

这个分支驱动 rollback/failure 语义，验证 negative 或失败路径的链事件和 reference
reducer 一致。

## 输出在哪里

常见输出：

- `logs/anvil-bootstrap/<run_id>/summary.json`
- `logs/anvil-bootstrap/<run_id>/events.json`
- `uvp-deploy/deploy/addresses/anvil.local.json`

这些是本地运行证据。不要把私钥或 RPC secret 放入输出，也不要把本地日志当成
协议事实源。

## 成功标准

成功时你应该看到：

- 合约已部署；
- plan published；
- plan/order 已注册；
- signal 已提交；
- hook 事件已发出；
- replay expected 和 observed 一致；
- mismatches 为 0。

如果 replay mismatch，先读 [排障](../how-to/troubleshooting.md) 中的
"链事件重放不一致"。

## 接着跑 Product 本地表面

协议闭环之后，可以接着把面向用户的本地表面跑起来。先启动当前本地链闭环：

```bash
uvp-deploy/deploy/scripts/bootstrap-local-anvil.sh
```

它会部署当前合约和冻结模块，编译并发布 Plan，创建 Order，写入 Signal 授权，提交场景 Signal，并核对链事件与回放结果。

随后配置 Chain Services 使用生成的地址清单：

```bash
UVP_ADDRESS_MANIFEST=uvp-deploy/deploy/addresses/anvil.local.json \
UVP_RPC_URL=http://127.0.0.1:8545 \
pnpm --filter @uvp-eth/chain-services dev:api
```

启动 Store 或 Order App：

```bash
VITE_UVP_CHAIN_SERVICES_URL=http://127.0.0.1:8787 pnpm --filter @uvp-eth/zhixu-store-web dev
VITE_UVP_CHAIN_SERVICES_URL=http://127.0.0.1:8787 pnpm --filter @uvp-eth/order-app dev
```

Product API 的 Order、Task、Plan 发布和 proof 来自链上投影；Store 供应商能力与匹配资料仍是链下数据。这条边界的正式表述见[协议边界](../concepts/protocol-boundaries.md)。
