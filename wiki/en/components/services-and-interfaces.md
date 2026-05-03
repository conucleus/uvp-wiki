# Services and Interfaces

The services and interfaces component answers “what do the public interfaces look like, and who consumes what.” The off-chain software that actually carries the indexer, relayer, proof, and Product/Store API runtime is covered by the peer page [Rebuildable Service Layer: Chain Services](chain-services.md); this page only keeps the interface relationships and drift boundaries.

## Component Chain

```text
ABI / EIP-712 / calldata helpers
  -> rebuildable service layer / chain-services
  -> Product DTO / Product API
  -> Store / Order App / executor-kit / adapters
```

## Component Responsibilities

| Component | Interfaces it owns | Responsibility boundary |
| --- | --- | --- |
| protocol-bindings | ABI, typed data, hash helpers, calldata helpers, ResourceManifest/StagePatch helpers. | Network requests, private keys, databases, and business authorization decisions. |
| rebuildable service layer / chain-services | Product API, Store API, submission API, evidence/proof API, notification ops, runtime diagnostics. | Facts come from chain events, business signatures come from participants. |
| product-dto | order/task/proof/trust DTO in ordinary user language. | HookPlan raw text, low-level sourceId/signalId, gas/ABI details. |
| Store API | nucleation workspace, drafts, review, supplier metadata, contact, audit, governance workflow. | trust attestation, nucleation-internal governance, and business completion are expressed by registry, nucleation, and state-machine proof respectively. |
| Executor Kit | signal producer CLI/SDK/MCP. | authorization creation, default private-key custody, and business signatures are handled by Product/registrar, key management, and business-party wallets. |

## Read These First

| Page | Purpose |
| --- | --- |
| [Public Interfaces](../reference/public-interfaces.md) | drift checklist for ABI, events, EIP-712, canonical hashes, DTOs, APIs, and release evidence. |
| [Rebuildable Service Layer: Chain Services](chain-services.md) | overview of indexer, relayer, proof verifier, Product API, Store API, and runtime profiles in `uvp-chain-services/service`. |
| [Product BFF](../concepts/architecture/components/chain-services-bff.md) | order draft, invite, participant confirmation, authorization, and registration workflow. |
| [Product DTO](../concepts/product/dto.md) | order/task/proof/trust DTO readable by ordinary users. |
| [Product API](../reference/product-api.md) | reference for Product and Store routes. |
| [CLI and Config](../reference/cli-and-config.md) | executor-kit, chain-services, frontend config, and root scripts. |

## Service Boundary

- Protocol bindings only provide browser-safe ABI, typed data, calldata, and hash helpers; they do not read env, hold private keys, or submit transactions.
- Chain Services may index, project, verify, relay, and record workflow state, but its databases must be rebuildable.
- The Product API may prepare typed data, verify participant signatures, call the relayer, and return proof; order-level authorization is still checked by the contract.
- The Store API may manage nucleation workspaces, drafts, supplier metadata, audit, and review; metadata is written as workflow/material, trust truth comes from the registry projection, and internal nucleation governance belongs to the nucleation kernel.
- Docking, contact, notification, and resource availability are all workflow/projection state; every public claim must trace back to registry/state-machine events.
