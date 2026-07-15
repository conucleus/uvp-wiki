# 本地 Product 闭环

先启动当前本地链闭环：

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

Product API 的 Order、Task、Plan 发布和 proof 来自链上投影；Store 供应商能力与匹配资料仍是链下数据。
