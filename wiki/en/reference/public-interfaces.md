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

`@uvp-eth/protocol-bindings` is the browser-safe protocol bindings package. It provides ABI constants, typed-data builders, calldata builders, address/bytes32 validation, stage patch helpers, dock selection / poke / registration calldata builders, the file patch digest helper (`filePatchDigest`), and capability leaf/proof helpers (`signalCapabilityLeaf`, `selectorBindingProofFor`, `fileWriterProofFor`, `capabilitiesRootOf`).

It reads no environment variables, stores no private keys, submits no transactions, and makes no business authorization decisions. Order App, uvp-client, Chain Services, and deploy scripts can reuse it to avoid hand-writing ABI, typed data, or calldata on their own.

## Interface Map

| Interface | Primary owner | Consumers | Change requirements |
| --- | --- | --- | --- |
| Solidity ABI / bytecode / function selector | `uvp-protocol/contracts/uvp-contracts` | protocol-bindings, chain-services, uvp-client, deploy scripts, release gates | Update fixtures, bindings, contract tests, deploy/replay tests, and the release note. |
| Event name / topic / indexed fields | contracts | indexer, statemachine replay, Product projection, proof verifier | Update the replay oracle, projection tests, and the contracts/events reference. |
| EIP-712 domain / typed data | contracts, protocol-bindings | Product submit, relayer, uvp-client, wallet UI | Update digest helpers, signing tests, and the staging domain check; staging signs with the current productSubmit domain version. |
| Canonical hash / artifact schema | compiler, hook-core, statemachine | Plan publication, commitPlan/finalizePlan, release evidence | Update golden fixtures, canonical hash docs, and compiler/statemachine tests. |
| Product DTO | product-dto | chain-services, Order App, uvp-client, periphery adapter | Update DTO tests, route tests, frontend/API consumers, and ordinary-user copy. |
| Product API | chain-services | Order App/hosts (via uvp-client/browser), enterprise scripts/AI agents (via uvp-client) | Update the API reference, route tests, browser E2E, and failure language. |
| Deployment manifest | uvp-deploy/deploy | chain-services, staging scripts, release records | Commit only curated manifest/evidence; local generated address files are not committed by default. |
| Release evidence schema | uvp-deploy/deploy | release owner, audit, release-evidence consumers | Keep it no-secret, redacted, and auditable; do not treat raw logs or object bytes as release records. |
| Chain-read and operations HTTP routes | chain-services (`uvp-chain-services/service/src/api/routes/`) | chain-read consumers such as Order App, hosts, and the application backend | Route shapes follow the `@uvp-eth/chain-read-contract` wire DTO; update route contract tests and the wiki reference page. |
| CLI and runtime configuration | uvp-client, chain-services config, deploy scripts | executors, release owner, staging operator | Private keys are read only from explicitly named env vars; staging/profile configuration must fail closed; update the CLI reference and profile tests. |

## Drift Checklist

When changing a public interface, check at least:

```text
contracts/tests
fixtures
protocol-bindings
compiler/statemachine replay
chain-services indexer/projection/routes
Product DTO tests
Order App / host / uvp-client consumers
deploy scripts and release gates
wiki reference pages
release record or PRD trace
```

## Non-Interface State

- Store metadata is platform workflow and material state; the Identity Registry binding is the on-chain subject-to-wallet correspondence record; see [Read Model Boundary](../concepts/protocol-boundaries.md#read-model-boundary).
- The Product BFF database is a rebuildable read model; the source of truth for plan/order/signal/hook is chain events; see [Sources of Truth](../concepts/protocol-boundaries.md#source-of-truth).
- Relayer configuration is broadcast configuration; business authorization comes from order authorization and signatures; see [Authorization and Signatures](../concepts/protocol-boundaries.md#authorization-and-signatures).
- Product surfaces read chain projections: empty projections return empty results, there is no demo profile to switch on, and operational aids never change protocol truth; for the complete boundary see [Protocol Boundaries](../concepts/protocol-boundaries.md).
- Funding, USDC, settlement-custody, guarantee, and payment adapters belong to adapter/periphery; see [Periphery Adapters](../concepts/protocol-boundaries.md#periphery-adapters).

## Related References

- [Contracts and Events](contracts-and-events.md)
- [Product API Endpoints](product-api-endpoints.md)
- [CLI and Configuration](cli-and-config.md)
- [Module Map](module-map.md)
- [Release and Verification](../how-to/release-checklist.md)
- Fixed change flow: [Development § Fixed Flow After Changing a Public Interface](../how-to/development.md)
