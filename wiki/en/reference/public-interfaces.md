---
title: Public Interfaces
type: reference
audience: 工程贡献者
status: verified
---

# Public Interfaces

`uvp-eth` public interfaces include ABI, events, EIP-712, canonical hashes, artifact schemas, Product DTOs, deployment manifests, HTTP APIs, and release evidence. All of these interfaces are consumed by other modules or by external audits.

When changing any of these, treat the change per the protocol boundaries and sync fixtures, consumers, reference docs, and release language together.

## Positioning of Protocol Bindings

`@uvp-eth/protocol-bindings` is the browser-safe protocol bindings package. It provides ABI constants, typed-data builders, calldata builders, address/bytes32 validation, stage patch helpers, and resource manifest hash helpers.

It reads no environment variables, stores no private keys, submits no transactions, and makes no business authorization decisions. Order App, executor-kit, Chain Services, and deploy scripts can reuse it to avoid hand-writing ABI, typed data, or calldata on their own.

## Interface Map

| Interface | Primary owner | Consumers | Change requirements |
| --- | --- | --- | --- |
| Solidity ABI / bytecode / function selector | `uvp-protocol/contracts/uvp-contracts` | protocol-bindings, chain-services, executor-kit, deploy scripts, release gates | Update fixtures, bindings, contract tests, deploy/replay tests, and the release note. |
| Event name / topic / indexed fields | contracts | indexer, statemachine replay, Product projection, proof verifier | Update the replay oracle, projection tests, and the contracts/events reference. |
| EIP-712 domain / typed data | contracts, protocol-bindings | Product submit, relayer, executor-kit, wallet UI | Update digest helpers, signing tests, and the staging domain check; staging must not fall back to the older `0.1` domain. |
| Canonical hash / artifact schema | compiler, hook-core, statemachine | Plan publication, commitPlan/finalizePlan, release evidence | Update golden fixtures, canonical hash docs, and compiler/statemachine tests. |
| Product DTO | product-dto | chain-services, Store, Order App, executor-kit, periphery adapter | Update DTO tests, route tests, frontend/API consumers, and ordinary-user copy. |
| Product API | chain-services | Store, Order App, executor-kit Product API mode, MCP adapter | Update the API reference, route tests, browser E2E, and failure language. |
| Deployment manifest | uvp-deploy/deploy | chain-services, staging scripts, release records | Commit only curated manifest/evidence; local generated address files are not committed by default. |
| Release evidence schema | uvp-deploy/deploy | release owner, audit, PRD101 evidence pack <!-- TODO(confirm): which PRD does PRD101 refer to? No prd-101 found under docs/product --> | Keep it no-secret, redacted, and auditable; do not treat raw logs or object bytes as release records. |
| Store Console HTTP API | chain-services (`uvp-chain-services/service/src/api/routes/`) | Store workbench, operator scripts | Routes, error codes, proof rows, and authz semantics must stay in sync with the DTO; update Store frontend consumers and route tests. |
| CLI and runtime configuration | executor-kit, chain-services config, deploy scripts | executors, release owner, staging operator | Private keys are read only from explicitly named env vars; staging/profile configuration must fail closed; update the CLI reference and profile tests. |

## Drift Checklist

When changing a public interface, check at least:

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

- Store metadata is platform workflow and material state; the Identity Registry binding is the on-chain subject-to-wallet correspondence record; see [Read Model Boundary](../concepts/protocol-boundaries.md#读模型边界).
- The Product BFF database is a rebuildable read model; the source of truth for plan/order/signal/hook is chain events; see [Sources of Truth](../concepts/protocol-boundaries.md#事实源).
- Relayer configuration is broadcast configuration; business authorization comes from order authorization and signatures; see [Authorization and Signatures](../concepts/protocol-boundaries.md#授权与签名).
- Demo fallback, fixture catalogs, and mock frontend modes only support demo or test profiles; for the complete boundary see [Protocol Boundaries](../concepts/protocol-boundaries.md).
- Funding, USDC, escrow, guarantee, and settlement adapters belong to adapter/periphery; see [Periphery Adapters](../concepts/protocol-boundaries.md#外围适配).

## Related References

- [Contracts and Events](contracts-and-events.md)
- [Product API](product-api.md)
- [CLI and Configuration](cli-and-config.md)
- [Module Map](module-map.md)
- [Release and Verification](../operations/release-and-verification.md)
