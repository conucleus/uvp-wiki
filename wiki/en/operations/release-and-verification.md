# Release and Verification

`uvp-eth` release gates focus on two things:

- whether the protocol public interface has drifted;
- whether the current release claim is backed by auditable evidence.

## Local Baseline

```bash
pnpm check
pnpm test
pnpm build
pnpm verify:protocol-freeze
pnpm verify:product-signal-map
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

`fixture` only proves the UI fixture path. Only `full --require-full` can support a chain-backed Product claim.

`pnpm verify:product-signal-map` is a release blocker for Product submit
convergence. It checks that UI actions, Product Schema permission rows,
compiled HookPlan signals, Product BFF authorizations, and contract
authorization pairs all use the same `sourceId` / `signalId` mapping.

## Staging Gate

```bash
set -a
source ~/.test_envs
set +a

pnpm staging:preflight
pnpm staging:rehearsal -- --allow-broadcast
```

Run preflight first, then broadcast. Preflight should not spend gas. Before broadcast, confirm funded wallets, role permissions, and chain id.

## Release Evidence

Release records should live in `uvp-deploy/deploy/releases/` and should only record public, auditable, redacted information:

- commit hash;
- run id and date;
- target network;
- chain id;
- contract addresses;
- plan/order/task/submission ids;
- transaction hashes;
- proof rows;
- storage/evidence/backend profile;
- browser E2E summary;
- known exclusions;
- follow-up gates.

Do not submit:

- private keys or secrets;
- raw `.test_envs`;
- object storage credentials;
- local DB;
- Playwright trace, screenshots, or HTML reports unless the release gate explicitly requires them and they have been redacted;
- unfiltered temporary local address files.

## Claim Language

You may say:

- "local Anvil protocol loop passed";
- "Base Sepolia staging rehearsal passed on date/run id";
- "chain-backed Product projection has proof rows".

Do not say:

- "production-ready" unless there is a production gate;
- "funds are secured by UVP core", because funds are periphery;
- "Store metadata attests the plan", because the trust registry attests it;
- "the relayer authorized the business action", because the participant signature authorizes the business action.
