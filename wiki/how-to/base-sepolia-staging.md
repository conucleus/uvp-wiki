---
title: Base Sepolia 部署
type: how-to
audience: 运维
status: verified
---

# Base Sepolia 部署

Base Sepolia 是当前 public test target，chain id 为 `84532`。部署会消耗测试网 gas，并使用 RPC 配额。

## 准备

- `BASE_SEPOLIA_RPC_URL` 指向 Base Sepolia RPC。
- `UVP_ETH_DEPLOYER_PRIVATE_KEY` 由环境或密钥管理系统注入。
- 可选的 `UVP_ETH_DEPLOYER_ADDRESS` 必须与私钥导出的地址一致。
- 私钥、RPC secret 和临时日志不进入仓库。

## 只部署合约

```bash
BASE_SEPOLIA_RPC_URL=... \
UVP_ETH_DEPLOYER_PRIVATE_KEY=... \
UVP_BASE_SEPOLIA_BROADCAST_CONFIRMATION=I_UNDERSTAND_THIS_BROADCASTS_BASE_SEPOLIA_AND_USES_REMOTE_QUOTA \
pnpm deploy:base-sepolia
```

该入口部署 `UVPStateMachine`、六个冻结 modules、`UVPDeploymentRegistry` 和 `UVPIdentityRegistry`，登记 deployment，并发布当前 Plan。输出地址清单使用 `uvp-eth.addresses.v1`。

## 部署并运行协议 Smoke

```bash
BASE_SEPOLIA_RPC_URL=... \
UVP_ETH_DEPLOYER_PRIVATE_KEY=... \
UVP_BASE_SEPOLIA_BROADCAST_CONFIRMATION=I_UNDERSTAND_THIS_BROADCASTS_BASE_SEPOLIA_AND_USES_REMOTE_QUOTA \
uvp-deploy/deploy/scripts/bootstrap-base-sepolia.sh
```

Smoke 会继续创建 Order、写入 Signal 授权、提交场景 Signal，并核对链事件与 replay 结果。

## 安全门

```bash
pnpm no-spend:safety
```

广播前逐项确认：

- [ ] Base Sepolia workflow 只能手动触发。
- [ ] Workflow 必须把确认串传给脚本。
- [ ] Bootstrap 在构建和广播前检查确认串。
- [ ] 普通 CI 不读取部署 secrets。
- [ ] 本地部署入口只接受 loopback RPC。
- [ ] 地址清单和 summary 作为本次运行的公开技术记录保留；私钥、原始 RPC URL、数据库内容和未筛选日志不进入版本控制。

部署失败或 smoke 校验不一致时，按[排障](troubleshooting.md)排查（含 "Base Sepolia RPC 慢或 timeout" 一节）；通过后进入[发布与验证](release-checklist.md)登记地址清单。
