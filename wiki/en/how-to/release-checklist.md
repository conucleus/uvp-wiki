---
title: Release and Verification
type: how-to
audience: 运维
status: verified
---

# Release and Verification

Current verification has three layers:

```bash
pnpm verify:protocol-freeze
pnpm verify:stack-compatibility
pnpm no-spend:safety
pnpm check
pnpm test
pnpm build
```

Contracts:

```bash
cd uvp-protocol/contracts/uvp-contracts
forge test
```

Local chain closure:

```bash
uvp-deploy/deploy/scripts/bootstrap-local-anvil.sh
```

The address manifest must explicitly include the current `stateMachineDeployments[]`, `activeDeploymentId`, frozen modules, `UVPDeploymentRegistry`, and `UVPIdentityRegistry` (full requirements in `uvp-deploy/deploy/README.md`). Generated logs, temporary wallets, databases, and browser artifacts stay out of version control.

If any check fails, locate the symptom in [Troubleshooting](troubleshooting.md) first, then decide whether it is an intentional public interface change.
