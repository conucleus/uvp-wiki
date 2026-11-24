---
title: Base Sepolia Deployment
type: how-to
audience: 运维
status: verified
---

# Base Sepolia Deployment

Base Sepolia is the current public test target with chain id `84532`. Deployment consumes testnet gas and uses RPC quota.

## Preparation

Required environment variables:

- `BASE_SEPOLIA_RPC_URL` points to a Base Sepolia RPC.
- `UVP_ETH_DEPLOYER_PRIVATE_KEY` (or `UVP_ETH_DEPLOYER_PRIVATE_KEY_FILE`) is injected from the environment or a secret-management system.
- `UVP_BASE_SEPOLIA_BROADCAST_CONFIRMATION=I_UNDERSTAND_THIS_BROADCASTS_BASE_SEPOLIA_AND_USES_REMOTE_QUOTA`.
- `UVP_ETH_BOOTSTRAP_ZHIXU` points to the Zhixu YAML for this compile/register/replay run; the contract-only path requires it too.
- `UVP_ETH_BOOTSTRAP_RELEASE` points to a release record under `uvp-deploy/deploy/releases/`; the current top record is `uvp-deploy/deploy/releases/base-sepolia-pending-2026-11-10.md`, and it must pass the `deploy-base-sepolia.sh --check` version/hash gate before use.

Optional:

- `UVP_ETH_DEPLOYER_ADDRESS` must match the address derived from the private key.
- `UVP_ETH_BOOTSTRAP_MANIFEST` overrides the address manifest path (default `uvp-deploy/deploy/addresses/base-sepolia.local.json`).
- `UVP_ETH_BOOTSTRAP_RUN_ROOT` overrides the run log directory (default `logs/base-sepolia-bootstrap/<run_id>`).
- `BASE_SEPOLIA_CHAIN_ID` is pinned to `84532` at the broadcast entry and cannot be overridden by the environment; the bootstrap still reads `eth_chainId` before broadcast and rejects a mismatch.

Private keys, RPC secrets, and temporary logs stay out of the repository.

## Contract-only Deployment

```bash
BASE_SEPOLIA_RPC_URL=... \
UVP_ETH_DEPLOYER_PRIVATE_KEY=... \
UVP_ETH_BOOTSTRAP_ZHIXU=uvp-protocol/packages/compiler/fixtures/uvp-update-zhixu-v2.yaml \
UVP_ETH_BOOTSTRAP_RELEASE=uvp-deploy/deploy/releases/base-sepolia-pending-2026-11-10.md \
UVP_BASE_SEPOLIA_BROADCAST_CONFIRMATION=I_UNDERSTAND_THIS_BROADCASTS_BASE_SEPOLIA_AND_USES_REMOTE_QUOTA \
pnpm deploy:base-sepolia
```

This entry deploys `UVPStateMachine`, the seven frozen modules (stage patch, plan metadata, derived signal, dock registry, file resource, lens, identity registry), `UVPDeploymentRegistry`, and `UVPIdentityRegistry`, records the deployment, and writes the address manifest (`uvp-eth.addresses.v1`). It is the contract-only entry: it stops here and does not register a Plan — the plan/order smoke continues in the bootstrap entry below.

## Deploy and Run the Protocol Smoke

```bash
BASE_SEPOLIA_RPC_URL=... \
UVP_ETH_DEPLOYER_PRIVATE_KEY=... \
UVP_ETH_BOOTSTRAP_ZHIXU=uvp-protocol/packages/compiler/fixtures/uvp-update-zhixu-v2.yaml \
UVP_ETH_BOOTSTRAP_RELEASE=uvp-deploy/deploy/releases/base-sepolia-pending-2026-11-10.md \
UVP_BASE_SEPOLIA_BROADCAST_CONFIRMATION=I_UNDERSTAND_THIS_BROADCASTS_BASE_SEPOLIA_AND_USES_REMOTE_QUOTA \
uvp-deploy/deploy/scripts/bootstrap-base-sepolia.sh
```

The smoke continues by registering the compiled plan, creating a trigger Order from the birth stage's assigned supplier account, submitting scenario signals, and cross-checking chain events against replay results.

## Safety Gate

```bash
pnpm no-spend:safety
```

Confirm each item before broadcasting:

- [ ] The Base Sepolia workflow can only be triggered manually.
- [ ] The workflow must pass the confirmation string to the script.
- [ ] The bootstrap checks the confirmation string, the release record, and the Zhixu path before building and broadcasting.
- [ ] Ordinary CI does not read deployment secrets.
- [ ] Local deployment entries accept loopback RPCs only.
- [ ] Address manifests and summaries are kept as public technical records of the run; private keys, raw RPC URLs, database contents, and unfiltered logs stay out of version control.

If deployment fails or smoke verification reports mismatches, start with [Troubleshooting](troubleshooting.md) (including the "Base Sepolia RPC slow or timeout" section); after it passes, continue to [Release and Verification](release-checklist.md) to register the address manifest.
