# Product Local Loop

Product local loop 在 Local Anvil 协议闭环上再加 Product API：

```text
local contracts
  -> chain-services Product API
  -> order draft / invite / registration / start
  -> evidence
  -> prepare-submit / EIP-712 signature / submit
  -> order timeline / proof
```

## 运行

```bash
uvp-deploy/deploy/scripts/product-local-anvil.sh
```

默认使用 memory storage，适合快速验证。

使用 SQLite durable storage：

```bash
uvp-deploy/deploy/scripts/product-local-anvil.sh --durable
```

复用已有 API：

```bash
uvp-deploy/deploy/scripts/product-local-anvil.sh \
  --chain-services-url http://127.0.0.1:8787
```

## 这个脚本证明什么

它不再直接由 bootstrap 创建订单，而是通过 Product BFF 路径创建：

1. `POST /product/order-drafts`
2. `POST /product/orders/<draft-id>/invites`
3. `POST /product/invites/<invite-id>/accept`
4. `POST /product/order-drafts/<draft-id>/submit`
5. `GET /product/order-registrations/<registration-id>`
6. `POST /product/order-registrations/<registration-id>/start`
7. `POST /product/evidence`
8. `POST /product/tasks/<task-id>/prepare-submit`
9. 本地 Anvil participant key 产生 EIP-712 signature
10. `POST /product/tasks/<task-id>/submit`
11. `GET /product/submissions/<submission-id>`
12. `GET /product/orders/<order-id>/timeline`
13. `GET /product/orders/<order-id>/proof`

## 输出在哪里

`logs/product-anvil/<run_id>/` 包含：

- `summary.json`
- `api-transcript.json`
- `events.json`
- nested bootstrap summary
- per-run address manifest

`summary.json` 里的 tx hash、order id、task id、submission id 和 replay mismatch
是判断本地闭环是否真的 chain-backed 的关键。

## 与前端的关系

前端浏览器全链路由 `product-browser-e2e.sh` 驱动：

```bash
uvp-deploy/deploy/scripts/product-browser-e2e.sh --mode fixture
uvp-deploy/deploy/scripts/product-browser-e2e.sh --mode full --require-full
```

`--mode fixture` 用本地 fixture，不证明链上闭环。`--mode full --require-full`
会要求真实 Product stack、交易、indexer 和 service dependency 都可用。
