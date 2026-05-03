# 发布与验证

`uvp-eth` 的 release gate 关注两件事：

- 协议 public interface 是否漂移；
- 当前 release claim 是否有可审计证据支持。

## 本地 Baseline

```bash
pnpm check
pnpm test
pnpm build
pnpm verify:protocol-freeze
cd uvp-protocol/contracts/uvp-contracts && forge build && forge test
uvp-deploy/deploy/scripts/bootstrap-local-anvil.sh --self-update
uvp-deploy/deploy/scripts/bootstrap-local-anvil.sh --failure
```

## Product Baseline

```bash
uvp-deploy/deploy/scripts/product-local-anvil.sh
uvp-deploy/deploy/scripts/product-browser-e2e.sh --mode fixture
uvp-deploy/deploy/scripts/product-browser-e2e.sh --mode full --require-full
pnpm --filter @uvp-eth/order-app readiness
```

`fixture` 只证明 UI fixture path。`full --require-full` 才能支撑 chain-backed
Product claim。

## Staging Gate

```bash
set -a
source ~/.test_envs
set +a

pnpm staging:preflight
pnpm staging:rehearsal -- --allow-broadcast
```

先 preflight，后 broadcast。preflight 不应花 gas。broadcast 前确认 funded wallets、
role permissions 和 chain id。

## Release Evidence

Release record 应放在 `uvp-deploy/deploy/releases/`，并只记录可公开、可审计、
已 redacted 的信息：

- commit hash；
- run id 和日期；
- target network；
- chain id；
- contract addresses；
- plan/order/task/submission ids；
- transaction hashes；
- proof rows；
- storage/evidence/backend profile；
- browser E2E summary；
- known exclusions；
- follow-up gates。

不要提交：

- 私钥或 secret；
- raw `.test_envs`；
- object storage credentials；
- local DB；
- Playwright trace、screenshot、HTML report，除非 release gate 明确要求并已 redacted；
- 未筛选的 temporary local address file。

## Claim 语言

可以说：

- "local Anvil protocol loop passed"；
- "Base Sepolia staging rehearsal passed on date/run id"；
- "chain-backed Product projection has proof rows"。

不要说：

- "production-ready"，除非有生产 gate；
- "funds are secured by UVP core"，因为 funds 是 periphery；
- "Store metadata attests plan"，因为 trust registry 才 attests；
- "relayer authorized the business action"，因为 participant signature 才授权业务动作。
