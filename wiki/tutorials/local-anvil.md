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

## Happy Path Self Update

```bash
uvp-deploy/deploy/scripts/bootstrap-local-anvil.sh --self-update
```

脚本会：

1. 启动或连接本地 Anvil。
2. 构建 workspace 和合约。
3. 部署 `UVPDeploymentRegistry`、`ZhixuTrustRegistry`、`UVPStateMachine`。
4. 编译 UVP update Zhixu YAML，目标为 `platform.type=blockchain`、
   `platform.provider=eth`、`platform.network=base`。
5. 部署 configured trust registry，并用 registry owner 背书计划。
6. attests 当前 plan。
7. allowlist plan publisher 和 order registrar。
8. register plan 和 order，并写入 signal submitter authorizations。
9. 提交链上 signals。
10. 对 `HookReady`、`HookStatusChanged`、`TimerPoked` 做 replay oracle 校验。
11. 注册 next plan 和 next order，证明旧订单仍绑定旧 plan。

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
- plan attested；
- plan/order 已注册；
- signal 已提交；
- hook 事件已发出；
- replay expected 和 observed 一致；
- mismatches 为 0。

如果 replay mismatch，先读 [排障](../operations/troubleshooting.md) 中的
"链事件重放不一致"。
