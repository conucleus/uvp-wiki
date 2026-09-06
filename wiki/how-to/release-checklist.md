---
title: 发布与验证
type: how-to
audience: 运维
status: verified
---

# 发布与验证

当前验证分三层：

```bash
pnpm verify:protocol-freeze
pnpm verify:stack-compatibility
pnpm no-spend:safety
pnpm check
pnpm test
pnpm build
```

合约：

```bash
cd uvp-protocol/contracts/uvp-contracts
forge test
```

本地链闭环：

```bash
uvp-deploy/deploy/scripts/bootstrap-local-anvil.sh
```

地址清单必须明确包含当前 `stateMachineDeployments[]`、`activeDeploymentId`、冻结模块、`UVPDeploymentRegistry` 和 `UVPIdentityRegistry`（完整要求见 `uvp-deploy/deploy/README.md`）。生成日志、临时钱包、数据库和浏览器产物不进入版本库。

任一校验失败时，先对照[排障](troubleshooting.md)的症状清单定位，再决定是否为有意的 public interface 变更。
