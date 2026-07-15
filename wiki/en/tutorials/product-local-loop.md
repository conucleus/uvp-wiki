# Local Product Loop

Start the current local chain closure:

```bash
uvp-deploy/deploy/scripts/bootstrap-local-anvil.sh
```

It deploys the current contracts and frozen modules, compiles and publishes a Plan, creates an Order, installs Signal authorizations, submits scenario Signals, and checks chain events against replay.

Start Chain Services with the generated manifest:

```bash
UVP_ADDRESS_MANIFEST=uvp-deploy/deploy/addresses/anvil.local.json \
UVP_RPC_URL=http://127.0.0.1:8545 \
pnpm --filter @uvp-eth/chain-services dev:api
```

Start Store or Order App:

```bash
VITE_UVP_CHAIN_SERVICES_URL=http://127.0.0.1:8787 pnpm --filter @uvp-eth/zhixu-store-web dev
VITE_UVP_CHAIN_SERVICES_URL=http://127.0.0.1:8787 pnpm --filter @uvp-eth/order-app dev
```

Product API Orders, Tasks, Plan publication, and proof come from chain projections. Store supplier capabilities and matching data remain off-chain.
