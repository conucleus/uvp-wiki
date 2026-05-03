# Quick Start

Run the following commands from the repository root.

```bash
pnpm install
pnpm check
pnpm test
pnpm build
pnpm verify:protocol-freeze
```

These commands cover TypeScript package typecheck/test/build, plus drift checks for the current protocol ABI/hash fixtures and the EIP-712 domain. They do not spend gas and do not require private keys.

## Local Contract Checks

Run the Foundry commands inside the contracts directory:

```bash
cd uvp-protocol/contracts/uvp-contracts
forge build
forge test
```

If the contract ABI, bytecode, event topic, selector, or EIP-712 public boundary changes, you must update the fixtures explicitly and keep the relevant adapters, indexers, executors, and deployment scripts in sync.

## Run the Local Protocol Loop

```bash
uvp-deploy/deploy/scripts/bootstrap-local-anvil.sh --self-update
uvp-deploy/deploy/scripts/bootstrap-local-anvil.sh --failure
```

This script deploys the contracts, compiles Zhixu, registers plans and orders, submits signals, triggers hook events, and uses the `statemachine` chain oracle to replay-check chain events.

## Common Root Scripts

| Command | Purpose |
| --- | --- |
| `pnpm check` | Typecheck all packages. |
| `pnpm test` | Test all packages. |
| `pnpm build` | Build all packages. |
| `pnpm lint` | Run lint for packages that provide a lint script. |
| `pnpm verify:protocol-freeze` | Verify the `UVPStateMachine`, `ZhixuTrustRegistry`, `UVPDeploymentRegistry`, and Base Sepolia EIP-712 `0.2` domain fixtures. |
| `pnpm release:baseline:dry-run` | Dry-run the local release baseline. |
| `pnpm staging:preflight` | Non-spending preflight for Base Sepolia staging. |

## Where to Read the Implementation

- Protocol compiler: `uvp-protocol/packages/compiler/`
- Semantic core: `uvp-protocol/packages/hook-core/`
- Chain-event replay: `uvp-protocol/packages/statemachine/`
- Contracts: `uvp-protocol/contracts/uvp-contracts/`
- API/indexer/relayer: `uvp-chain-services/service/`
- Store workbench: `zhixu-store/app/`
- Order App: `uvp-order-app/app/`
- Executor CLI/SDK: `uvp-executor-kit/package/`
- Deploy and release evidence: `uvp-deploy/deploy/`
