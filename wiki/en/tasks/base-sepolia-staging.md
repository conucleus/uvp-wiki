# Base Sepolia Deployment

Base Sepolia is the current public test target with chain id `84532`. Deployment consumes testnet gas and RPC quota.

## Preparation

- `BASE_SEPOLIA_RPC_URL` points to a Base Sepolia RPC.
- `UVP_ETH_DEPLOYER_PRIVATE_KEY` comes from the environment or a secret manager.
- Optional `UVP_ETH_DEPLOYER_ADDRESS` must match the address derived from the private key.
- Private keys, RPC secrets, and temporary logs stay out of the repository.

## Contract-only Deployment

```bash
BASE_SEPOLIA_RPC_URL=... \
UVP_ETH_DEPLOYER_PRIVATE_KEY=... \
UVP_BASE_SEPOLIA_BROADCAST_CONFIRMATION=I_UNDERSTAND_THIS_BROADCASTS_BASE_SEPOLIA_AND_USES_REMOTE_QUOTA \
pnpm deploy:base-sepolia
```

This entry deploys `UVPStateMachine`, the six frozen modules, `UVPDeploymentRegistry`, and `UVPIdentityRegistry`; records the deployment; and publishes the current Plan. The address manifest uses `uvp-eth.addresses.v5`.

## Deployment with Protocol Smoke

```bash
BASE_SEPOLIA_RPC_URL=... \
UVP_ETH_DEPLOYER_PRIVATE_KEY=... \
UVP_BASE_SEPOLIA_BROADCAST_CONFIRMATION=I_UNDERSTAND_THIS_BROADCASTS_BASE_SEPOLIA_AND_USES_REMOTE_QUOTA \
uvp-deploy/deploy/scripts/bootstrap-base-sepolia.sh
```

The smoke path continues with Order creation, Signal authorization, scenario Signal submission, and chain-event replay checks.

## Safety Gate

```bash
pnpm no-spend:safety
```

The gate verifies that the Base Sepolia workflow is manual-only, passes the confirmation to the script, checks confirmation before build or broadcast work, keeps deployment secrets out of ordinary CI, and restricts local deployment to loopback RPCs.

The address manifest and summary may be retained as public technical records for the run. Private keys, raw RPC URLs, database contents, and unfiltered logs stay out of version control.
