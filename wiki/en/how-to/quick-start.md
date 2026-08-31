---
title: Quick Start
type: how-to
audience: 工程贡献者
status: verified
---

# Quick Start

Prerequisites: Node.js 20+, pnpm 9.15.0; Solidity checks additionally need Foundry. The following commands run from the repository root.

```bash
pnpm install
pnpm check
pnpm test
pnpm build
pnpm verify:protocol-freeze
```

These commands cover typecheck/test/build for the TypeScript packages plus drift checks for the current protocol ABI/hash fixtures and EIP-712 domain. They spend no gas and need no private keys; all exit codes being 0 means verification passed.

## Local Contract Checks

Prerequisite: Foundry is installed. The commands run inside the contracts directory:

```bash
cd uvp-protocol/contracts/uvp-contracts
forge build
forge test
```

Success criterion: build and test both pass. If the contract ABI, bytecode, event topics, selectors, or the EIP-712 public boundary change, the fixtures must be updated explicitly, and the related adapters, indexers, executors, and deployment scripts must be synced.

## Run the Local Protocol Loop

Prerequisites: Anvil is available and an explicit deployer private key is exported (`UVP_ETH_DEPLOYER_PRIVATE_KEY`; a throwaway local key is fine, but there is no built-in Anvil default key anymore). The full local loop (deploy contracts, compile Zhixu, register plan/order, submit signals, hook events, and replay verification) is covered in [Local Anvil Protocol Loop](../tutorials/local-anvil-loop.md).

Success criterion: every item in that tutorial's "Success Criteria" section passes, with replay mismatch equal to 0.

## Common Root Scripts

| Command | Purpose |
| --- | --- |
| `pnpm check` | Typecheck all packages. |
| `pnpm test` | Test all packages. |
| `pnpm build` | Build all packages. |
| `pnpm lint` | Run lint for packages that provide a lint script. |
| `pnpm verify:protocol-freeze` | Verify the v0.8 `UVPStateMachine`, v0.1 `UVPIdentityRegistry`, modules, `UVPDeploymentRegistry`, and EIP-712 fixtures. |
| `pnpm no-spend:safety` | Run the deploy package's no-spend checks plus environment-file validation; spends no gas. |

Verification: the corresponding command exits with code 0.

## Where to Read the Implementation

Prerequisite: `pnpm install` completed. For each module's path, responsibility, and boundary see the [Module Map](../reference/module-map.md).
