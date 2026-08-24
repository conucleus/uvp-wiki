---
title: Base Sepolia Deployment
type: how-to
audience: 运维
status: verified
---

# Base Sepolia Deployment

Base Sepolia is the current public test target with chain id `84532`. Deployment consumes testnet gas and uses RPC quota.

## Preparation

- `BASE_SEPOLIA_RPC_URL` points to a Base Sepolia RPC.
- `UVP_ETH_DEPLOYER_PRIVATE_KEY` is injected from the environment or a secret-management system.
- Optional `UVP_ETH_DEPLOYER_ADDRESS` must match the address derived from the private key.
- Private keys, RPC secrets, and temporary logs stay out of the repository.

## Contract-only Deployment

```bash
BASE_SEPOLIA_RPC_URL=... \
UVP_ETH_DEPLOYER_PRIVATE_KEY=... \
UVP_BASE_SEPOLIA_BROADCAST_CONFIRMATION=I_UNDERSTAND_THIS_BROADCASTS_BASE_SEPOLIA_AND_USES_REMOTE_QUOTA \
pnpm deploy:base-sepolia
```

This entry deploys `UVPStateMachine`, the six frozen modules, `UVPDeploymentRegistry`, and `UVPIdentityRegistry`, records the deployment, and publishes the current Plan. The output address manifest uses `uvp-eth.addresses.v5`.

## Deploy and Run the Protocol Smoke

```bash
BASE_SEPOLIA_RPC_URL=... \
UVP_ETH_DEPLOYER_PRIVATE_KEY=... \
UVP_BASE_SEPOLIA_BROADCAST_CONFIRMATION=I_UNDERSTAND_THIS_BROADCASTS_BASE_SEPOLIA_AND_USES_REMOTE_QUOTA \
uvp-deploy/deploy/scripts/bootstrap-base-sepolia.sh
```

The smoke continues by creating an Order, writing signal authorizations, submitting scenario signals, and cross-checking chain events against replay results.

## Safety Gate

```bash
pnpm no-spend:safety
```

Confirm each item before broadcasting:

- [ ] The Base Sepolia workflow can only be triggered manually.
- [ ] The workflow must pass the confirmation string to the script.
- [ ] The bootstrap checks the confirmation string before building and broadcasting.
- [ ] Ordinary CI does not read deployment secrets.
- [ ] Local deployment entries accept loopback RPCs only.
- [ ] Address manifests and summaries are kept as public technical records of the run; private keys, raw RPC URLs, database contents, and unfiltered logs stay out of version control.
