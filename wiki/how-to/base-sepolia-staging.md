---
title: Base Sepolia 部署
type: how-to
audience: 运维
status: verified
---

# Base Sepolia 部署

Base Sepolia 是当前 public test target，chain id 为 `84532`。部署会消耗测试网 gas，并使用 RPC 配额。

## 准备

必填环境变量：

- `BASE_SEPOLIA_RPC_URL` 指向 Base Sepolia RPC。
- `UVP_ETH_DEPLOYER_PRIVATE_KEY`（或 `UVP_ETH_DEPLOYER_PRIVATE_KEY_FILE`）由环境或密钥管理系统注入。
- `UVP_BASE_SEPOLIA_BROADCAST_CONFIRMATION=I_UNDERSTAND_THIS_BROADCASTS_BASE_SEPOLIA_AND_USES_REMOTE_QUOTA`。
- `UVP_ETH_BOOTSTRAP_ZHIXU` 指向本次编译/注册/回放的 Zhixu YAML；contract-only 路径同样必填。
- `UVP_ETH_BOOTSTRAP_RELEASE` 指向 `uvp-deploy/deploy/releases/` 下的 release 记录；当前顶层记录为 `uvp-deploy/deploy/releases/base-sepolia-pending-2026-11-10.md`，使用前须先通过 `deploy-base-sepolia.sh --check` 的版本/哈希门。

可选：

- `UVP_ETH_DEPLOYER_ADDRESS` 必须与私钥导出的地址一致。
- `UVP_ETH_BOOTSTRAP_MANIFEST` 覆盖地址清单路径（默认 `uvp-deploy/deploy/addresses/base-sepolia.local.json`）。
- `UVP_ETH_BOOTSTRAP_RUN_ROOT` 覆盖运行日志目录（默认 `logs/base-sepolia-bootstrap/<run_id>`）。
- `BASE_SEPOLIA_CHAIN_ID` 在广播入口固定为 `84532`，环境变量不能改写；bootstrap 仍会在广播前读取 `eth_chainId` 并拒绝不匹配。

私钥、RPC secret 和临时日志不进入仓库。

## 只部署合约

```bash
BASE_SEPOLIA_RPC_URL=... \
UVP_ETH_DEPLOYER_PRIVATE_KEY=... \
UVP_ETH_BOOTSTRAP_ZHIXU=uvp-protocol/packages/compiler/fixtures/uvp-update-zhixu-v2.yaml \
UVP_ETH_BOOTSTRAP_RELEASE=uvp-deploy/deploy/releases/base-sepolia-pending-2026-11-10.md \
UVP_BASE_SEPOLIA_BROADCAST_CONFIRMATION=I_UNDERSTAND_THIS_BROADCASTS_BASE_SEPOLIA_AND_USES_REMOTE_QUOTA \
pnpm deploy:base-sepolia
```

该入口部署 `UVPStateMachine`、七个冻结 modules（stage patch、plan metadata、derived signal、dock registry、file resource、lens、identity registry）、`UVPDeploymentRegistry` 和 `UVPIdentityRegistry`，登记 deployment，并写入地址清单（`uvp-eth.addresses.v1`）。它是 contract-only 入口：到此为止，不注册 Plan——plan/order smoke 由下面的 bootstrap 入口继续。

## 部署并运行协议 Smoke

```bash
BASE_SEPOLIA_RPC_URL=... \
UVP_ETH_DEPLOYER_PRIVATE_KEY=... \
UVP_ETH_BOOTSTRAP_ZHIXU=uvp-protocol/packages/compiler/fixtures/uvp-update-zhixu-v2.yaml \
UVP_ETH_BOOTSTRAP_RELEASE=uvp-deploy/deploy/releases/base-sepolia-pending-2026-11-10.md \
UVP_BASE_SEPOLIA_BROADCAST_CONFIRMATION=I_UNDERSTAND_THIS_BROADCASTS_BASE_SEPOLIA_AND_USES_REMOTE_QUOTA \
uvp-deploy/deploy/scripts/bootstrap-base-sepolia.sh
```

Smoke 会继续注册编译产物中的 plan、由出生阶段 assigned supplier account 创建 trigger Order、提交场景 signal，并核对链事件与 replay 结果。

## 安全门

```bash
pnpm no-spend:safety
```

广播前逐项确认：

- [ ] Base Sepolia workflow 只能手动触发。
- [ ] Workflow 必须把确认串传给脚本。
- [ ] Bootstrap 在构建和广播前检查确认串、release 记录与 Zhixu 路径。
- [ ] 普通 CI 不读取部署 secrets。
- [ ] 本地部署入口只接受 loopback RPC。
- [ ] 地址清单和 summary 作为本次运行的公开技术记录保留；私钥、原始 RPC URL、数据库内容和未筛选日志不进入版本控制。

部署失败或 smoke 校验不一致时，按[排障](troubleshooting.md)排查（含 "Base Sepolia RPC 慢或 timeout" 一节）；通过后进入[发布与验证](release-checklist.md)登记地址清单。
