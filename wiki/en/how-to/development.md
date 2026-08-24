---
title: Day-to-Day Development
type: how-to
audience: 工程贡献者
preread: quick-start.md
status: verified
---

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

1. Update or regenerate the fixture per the "ABI Fixture Drift" section in [Troubleshooting](troubleshooting.md).
2. Run `pnpm verify:protocol-freeze`.
3. Check the chain-services indexer, executor-kit, protocol-bindings, and deploy scripts.
4. Explain the drift in a release note or PRD trace.

## Where to Put New Features

Which module a new feature belongs to, and what each module is and is not responsible for, see the [Module Map](../reference/module-map.md). Judgment rule: protocol semantics go into `uvp-protocol` packages and contracts; rebuildable services go into `uvp-chain-services`; product surfaces go into store / order-app; funding, guarantee, payment, and agent adapters go into `uvp-periphery`.

Cross-module changes must sync each module's existing AGENTS.md (not every module has one), plus the relevant interface docs.
