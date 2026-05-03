# Day-to-Day Development

## Workspace Commands

Run from the repository root:

```bash
pnpm check
pnpm test
pnpm build
pnpm lint
```

Protocol fixture:

```bash
pnpm verify:protocol-freeze
```

## Package Commands

| Package | Common command |
| --- | --- |
| `@uvp-eth/hook-core` | `pnpm --filter @uvp-eth/hook-core test` |
| `@uvp-eth/compiler` | `pnpm --filter @uvp-eth/compiler test` |
| `@uvp-eth/statemachine` | `pnpm --filter @uvp-eth/statemachine test` |
| `@uvp-eth/protocol-bindings` | `pnpm --filter @uvp-eth/protocol-bindings test` |
| `@uvp-eth/product-dto` | `pnpm --filter @uvp-eth/product-dto test` |
| `@uvp-eth/chain-services` | `pnpm --filter @uvp-eth/chain-services check` |
| `@uvp-eth/executor-kit` | `pnpm --filter @uvp-eth/executor-kit test` |
| `@uvp-eth/zhixu-store-web` | `pnpm --filter @uvp-eth/zhixu-store-web build` |
| `@uvp-eth/order-app` | `pnpm --filter @uvp-eth/order-app readiness` |
| `@uvp-eth/deploy` | `pnpm --filter @uvp-eth/deploy test` |

## Contract Development

```bash
cd uvp-protocol/contracts/uvp-contracts
forge fmt
forge build
forge test
```

After changing a public interface, you must:

1. Update or regenerate the ABI/hash fixture.
2. Run `pnpm verify:protocol-freeze`.
3. Check chain-services indexer, executor-kit, protocol-bindings, and deploy scripts.
4. Explain the drift in a release note or PRD trace.

## Where to Put New Features

| New feature | Put it here |
| --- | --- |
| Hook DSL parse/eval | `uvp-protocol/packages/hook-core` |
| Zhixu compiler / artifact | `uvp-protocol/packages/compiler` |
| Solidity runtime rule | `uvp-protocol/contracts/uvp-contracts` |
| Chain-event replay oracle | `uvp-protocol/packages/statemachine` |
| Browser-safe typed data/calldata | `uvp-protocol/packages/protocol-bindings` |
| Product DTO contract | `uvp-protocol/packages/product-dto` |
| indexer / relayer / Product API | `uvp-chain-services/service` |
| Store UI | `zhixu-store/app` |
| Participant task UI | `uvp-order-app/app` |
| executor CLI/SDK/MCP | `uvp-executor-kit/package` |
| deployment / release gates | `uvp-deploy/deploy` |
| payment/guarantee/agent demo | `uvp-periphery` |

Cross-module changes must update the relevant `AGENTS.md` files and interface docs at the same time.
