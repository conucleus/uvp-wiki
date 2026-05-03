# Rebuildable Service Layer: Chain Services

`uvp-chain-services/service` is the rebuildable service layer for the UVP EVM track. In protocol notes it may also be called the non-trusted execution layer, meaning it is not the source of truth; it does not mean the service is unsafe or unreliable. It sits at the same level as [Semantics, Hook Core, and Compiler](semantics-and-compiler.md) and [On-chain Execution, State Machine, and Replay](onchain-runtime.md): the compiler turns Zhixu into deterministic artifacts, the state machine handles on-chain facts, and Chain Services handles off-chain replay, projection, relaying, verification, and product-facing interfaces.

It is a forkable off-chain service package. Any participant, nucleation kernel, supplier, auditor, or third-party integration can download, fork, compile, and run its own instance; as long as ABI, event, EIP-712, canonical hash, Product DTO, and Store/Product API boundaries are respected, different instances can rebuild the same kind of fact view from the same chain events.

```text
UVPDeploymentRegistry / UVPStateMachine / ZhixuTrustRegistry events
  -> chain-services indexer and replayed projections
  -> proof verifier / relayer boundary / workflow stores
  -> Product API / Store Console API / executor-kit integration / ops views
```

## Why It Is Rebuildable

Rebuildable means the source of truth is still on chain. Chain Services is still important: it turns events into task lists, proofs into DTOs, signed payloads into relayer submissions, Store drafts and audit workflows into durable records, and notifications into retryable delivery intents. Every public conclusion it emits must trace back to a chain event, signature, notarized hash, or replayable projection.

| Question | Source of truth | Chain Services role |
| --- | --- | --- |
| Does a plan exist, and has it been registered? | `UVPStateMachine` / registry event | Index, query, and display the plan projection. |
| Has an order started, and has a signal been submitted? | `OrderRegistered`, `SignalSubmitted`, `HookReady`, and related events | Replay them into orders, tasks, timelines, and proof rows. |
| Has a supplier/plan been endorsed? | `ZhixuTrustRegistry` event | Rebuild the trust projection for Store/Product display. |
| Has a user signed a business action? | EIP-712 signer recovery and on-chain authorization | Verify the payload and pass it to the relayer; do not sign on the user’s behalf. |
| Store drafts, contact, notifications, review materials | Store workflow storage | Organize workflow and audit; show on-chain proof or trust attestation separately. |

## Forkable Runtime Form

Chain Services is a normal Node service package: `@uvp-eth/chain-services`. It can run as the official testnet service, or be downloaded by an external team and run on its own machine, CI system, private cloud, or integration environment.

```text
pnpm --filter @uvp-eth/chain-services dev:api
pnpm --filter @uvp-eth/chain-services dev:indexer
pnpm --filter @uvp-eth/chain-services rebuild:indexer
pnpm --filter @uvp-eth/chain-services dev:relayer
pnpm --filter @uvp-eth/chain-services dev:proof-verifier
```

When forking or self-hosting, these compatibility points must be preserved:

- Rebuild projections from the deployment block, chain id, contract address, and event log.
- Preserve contract context such as `stateMachineAddress` / `deploymentId`; a bare order id can only be resolved when it is unique.
- Keep ABI, event names, EIP-712 typed data, canonical hashes, and Product DTO semantics stable.
- Local databases, object storage, notification state, and Store review results belong in projection/workflow state.
- User private keys stay on the user side; the relayer key is only for broadcasting.

## Subpages

| Subsystem | Code entry | Description |
| --- | --- | --- |
| [Indexer and Projections](chain-services-indexer-projections.md) | `src/indexer/`, `src/storage/` projection rows | Rebuild order/task/proof/trust views from deployment registry, state-machine, and trust registry events. |
| [Relayer](chain-services-relayer.md) | `src/relayer/` | gas payer, broadcast, confirmation, retry; does not create business signatures. |
| [Submissions and Stage Patch](chain-services-submissions-stage-patch.md) | `src/submissions/`, `src/stage-patches/` | participant/selector signed payloads, submission tracking, executor/resource patch. |
| [Evidence, Proof, and File Resource](chain-services-evidence-proof.md) | `src/evidence/`, `src/proof-verifier/` | evidence hash, metadata hash, object handle, proof mismatch report. |
| [Product API](chain-services-product-api.md) | `src/product/`, `src/api/routes/product-read.ts` | ordinary user order/task/timeline/proof DTO and Product staging readiness. |
| [Product BFF](../concepts/architecture/components/chain-services-bff.md) | `src/product/bff/` | order draft, invite, participant confirmation, authorization, and registration workflow. |
| [Store Console, Supplier, and Governance API](chain-services-store-api.md) | `src/store-console/`, `src/store-suppliers/`, `src/governance/` | nucleation workbench, supplier directory, review, attestation/revocation request. |
| [Notifications and Reconcile](chain-services-notifications-reconcile.md) | `src/notifications/`, `src/reconcile/` | delivery intent, retry/dead-letter, submission/projection reconciliation. |
| [Storage, Migration, and Runtime Profile](chain-services-storage-runtime.md) | `src/storage/`, `src/config/`, `migrations/` | memory/SQLite/PostgreSQL, migrations, testnet fail-closed profile. |
| [API Routes](chain-services-api-routes.md) | `src/api/routes/` | ownership of Product, Store, governance, notification, evidence, and diagnostics route modules. |

## Subsystem Map

| Subsystem | Input | Output |
| --- | --- | --- |
| Indexer | deployment registry, state-machine, trust registry logs. | normalized events, sync status, order/task/proof/trust projections. |
| Projection storage | replayed events, workflow rows, submission rows. | memory/SQLite/PostgreSQL stores; erasable and rebuildable query state. |
| Relayer boundary | participant-signed EIP-712 payloads. | tx submission, retry, confirmation, and failure state. |
| Stage patches | selector-signed executor/resource patch typed data. | active executor patch, resource manifest patch submit path. |
| Proof verifier | metadata hash, evidence hash, Zhixu hash, object handle. | proof mismatch report, evidence metadata, object storage adapter. |
| Product projection | chain projection, trust projection, evidence metadata. | Product order/task/timeline/proof DTO, staging readiness. |
| Product BFF | order draft, invite, participant wallet, plan trust. | registration draft, authorization table, order submit workflow. |
| Store Console | Store draft, version, docking, audit, runtime metadata. | nucleation workbench, Zhixu catalog, review material, docking session. |
| Store Supplier | supplier metadata, capability tags, contact material. | supplier directory, review request, attestation/revocation workflow input. |
| Governance workflow | Store review material, admin action, trust request. | governance tx intent, hashing, review/attestation/revocation records. |
| Notifications | `HookReady`, submitter authorization, supplier trust, profile. | delivery intents, retry/dead-letter operational state. |
| Reconcile | submission state, chain confirmation, projection lag. | background reconciliation status and repair loop. |
| API shell | route context, stores, services, authz headers. | Product, Store, governance, notification, and diagnostic HTTP routes. |
| Config/security/shared | env, runtime profile, audit/redaction rules. | fail-closed runtime checks, redacted diagnostics, shared types. |

## Boundary Checks

- Contracts and chain events remain the source of truth.
- Chain Services is replaceable, forkable off-chain execution software responsible for projection and relaying.
- The relayer can pay gas and submit transactions, but cannot create business signatures.
- Product DTO, Store DTO, notification state, and audit trail are all projection/workflow state.
- Store metadata, contact information, review, tagging, docking sessions, and attestation requests must all link back to `UVPStateMachine` or `ZhixuTrustRegistry` events.
- The proof verifier can detect hash mismatches; fulfillment completion, internal fairness, and trust-domain conclusions are expressed separately by signal/proof, nucleation materials, and registry attestation.
- Off-chain storage only keeps object handles, metadata, hashes, and workflow state; plaintext evidence such as contracts, invoices, and logistics records stays off chain.
- The indexer database must be erasable and rebuildable from contract events; every fork must preserve replay and redaction rules.
