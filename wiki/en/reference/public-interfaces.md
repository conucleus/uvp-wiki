# Public Interfaces

`uvp-eth` public interfaces include ABI, events, EIP-712, canonical hashes, artifact schemas, Product DTOs, deployment manifests, HTTP APIs, and release evidence. These interfaces are consumed by other modules and by external audits.

When changing any of these, treat the change as a protocol-boundary change and update fixtures, consumers, reference docs, and release language together.

## Interface Map

| Interface | Primary owner | Consumers | Change requirements |
| --- | --- | --- | --- |
| Solidity ABI / bytecode / function selector | `uvp-protocol/contracts/uvp-contracts` | protocol-bindings, chain-services, executor-kit, deploy scripts, release gates | Update fixtures, bindings, contract tests, deploy/replay tests, and the release note. |
| Event name / topic / indexed fields | contracts | indexer, statemachine replay, Product projection, proof verifier | Update the replay oracle, projection tests, and contracts/events reference. |
| EIP-712 domain / typed data | contracts, protocol-bindings | Product submit, relayer, executor-kit, wallet UI | Update digest helpers, signing tests, and the staging domain check; staging must not fall back to the older `0.1` domain. |
| Canonical hash / artifact schema | compiler, hook-core, statemachine | trust registry, registerPlan, release evidence | Update golden fixtures, canonical hash docs, and compiler/statemachine tests. |
| Product DTO | product-dto | chain-services, Store, Order App, executor-kit, periphery adapter | Update DTO tests, route tests, frontend/API consumers, and ordinary-user copy. |
| Product API | chain-services | Store, Order App, executor-kit Product API mode, MCP adapter | Update the API reference, route tests, browser E2E, and failure language. |
| Deployment manifest | uvp-deploy/deploy | chain-services, staging scripts, release records | Commit only curated manifest/evidence; local generated address files should not be committed by default. |
| Release evidence schema | uvp-deploy/deploy | release owner, audit, PRD101 evidence pack | Keep it secret-free, redacted, and auditable; do not treat raw logs or object bytes as release records. |

## Drift Checklist

When changing public interfaces, check at least:

```text
contracts/tests
fixtures
protocol-bindings
compiler/statemachine replay
chain-services indexer/projection/routes
Product DTO tests
Store / Order App / executor-kit consumers
deploy scripts and release gates
wiki reference pages
release record or PRD trace
```

## Non-Interface State

- Store metadata is platform workflow/material state; trust-registry attestation is the on-chain endorsement interface.
- The Product BFF database is a rebuildable read model; the source of truth for plan/order/signal/hook is chain events.
- Relayer configuration is broadcast configuration; business authorization comes from order authorization and signatures.
- Demo fallback, fixture catalog, and mock frontend modes can only support demos or tests.
- Funding, USDC, escrow, guarantee, and settlement adapters belong to adapter/periphery; entering core semantics requires a clear signal/event boundary.

## Related References

- [Contracts and Events](contracts-and-events.md)
- [Product API](product-api.md)
- [CLI and Configuration](cli-and-config.md)
- [Module Map](module-map.md)
- [Release and Verification](../operations/release-and-verification.md)
