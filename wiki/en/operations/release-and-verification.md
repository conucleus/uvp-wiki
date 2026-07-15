# Release and Verification

Run the current protocol, component and workspace checks:

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

The address manifest must explicitly include current `stateMachineDeployments[]`, `activeDeploymentId`, frozen modules, `UVPDeploymentRegistry`, and `UVPIdentityRegistry`. Generated logs, temporary wallets, databases, and browser artifacts stay out of version control.
