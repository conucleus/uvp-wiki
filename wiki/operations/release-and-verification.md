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

地址清单必须明确包含当前 `stateMachineDeployments[]`、`activeDeploymentId`、冻结模块、`UVPDeploymentRegistry` 和 `UVPIdentityRegistry`。生成日志、临时钱包、数据库和浏览器产物不进入版本库。
