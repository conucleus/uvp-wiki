---
title: The Rebuildable Service Layer: Chain Services
type: meta
audience: 工程贡献者
status: verified
---

# The Rebuildable Service Layer: Chain Services

`uvp-chain-services/service` is the rebuildable service layer of the UVP EVM track. It is not the source of protocol truth; contracts and chain events are. Chain Services provides rebuildable replay, projection, relaying, verification, and HTTP APIs. The compiler turns a Zhixu into deterministic artifacts, the state machine owns on-chain facts, and Chain Services owns off-chain projections and service operation.

It is a forkable off-chain service package. Any participant, nucleus, supplier, auditor, or third-party integration can download, fork, compile, and run its own instance; as long as it respects the ABI, event, EIP-712, canonical hash, Product DTO, and Store/Product API boundaries, different instances can rebuild the same class of fact views from the same set of chain events.

```text
UVPDeploymentRegistry / UVPStateMachine / UVPIdentityRegistry events
  -> chain-services indexer and replayed projections
  -> proof verifier / relayer boundary / workflow stores
  -> Product API / Store Console API / executor-kit integration / ops views
```

## Why It Is Rebuildable

Rebuildable means the source of facts remains on chain. Chain Services still matters: it turns events into task lists, proofs into DTOs, signed payloads over to the relayer, Store drafts and audit workflows into records, and notifications into retryable delivery intents. Every public conclusion it produces must be traceable back to chain events, signatures, notarized hashes, or replayable projections.

| Question | Source of truth | Chain Services' role |
| --- | --- | --- |
| Is the plan committed and finalized | `UVPStateMachine` event | Index, query, and display the plan projection. |
| Has the order started; has the signal been submitted | Events such as `OrderRegistered`, `SignalSubmitted`, `HookReady` | Replay into orders, tasks, timelines, and proof rows. |
| Which wallet does an offline subject correspond to | `UVPIdentityRegistry` event | Rebuild the identity binding projection for Store display names. |
| Did the user sign a given business action | EIP-712 signer recovery and on-chain authorization | Validate the payload and hand it to the relayer; never sign for the user. |
| Store drafts, contacts, notifications, review material | Store workflow storage | Organize workflows and audits; on-chain proof or trust publication is displayed separately. |

## Forkable Operating Model

Chain Services is an ordinary Node service package: `@uvp-eth/chain-services`. It can run as the official testnet service, or be downloaded by external teams onto their own machines, CI, private clouds, or integration environments. For dev/rebuild and other run commands, see [Run Services and Frontends](../../how-to/run-services-and-apps.md).

When forking or self-deploying, these interface constraints must hold:

- Rebuild projections from the deployment block, chain id, contract addresses, and event logs.
- Preserve contract context such as `stateMachineAddress` / `deploymentId`; bare order ids may only be resolved when unique.
- Keep ABI, event name, EIP-712 typed data, canonical hash, and Product DTO semantics.
- Label local databases, object storage, notification state, and Store review results as projection/workflow.
- User private keys stay on the user side; the relayer key only broadcasts.

## Child Pages

| Subsystem | Code entry | Description |
| --- | --- | --- |
| [Indexer and Projections](indexer-projections.md) | `src/indexer/`, `src/storage/` projection rows | Rebuild order/task/proof/identity views from deployment registry, state-machine, and identity registry events. |
| [Relayer](relayer.md) | `src/relayer/` | Gas payer, broadcasting, confirmation, retry; generates no business signatures. |
| [Submissions and Stage Patch](submissions-stage-patch.md) | `src/submissions/`, `src/product/bff/`, `src/stage-patches/` | Submission status tracking, order registration/BFF workflow, executor/resource stage patch submission entry points. |
| [Evidence, Proof, and File Resource](evidence-proof.md) | `src/evidence/`, `src/proof-verifier/` | Evidence hashes, metadata hashes, object handles, proof mismatch reports. |
| [Product API](product-api.md) | `src/product/`, `src/api/routes/product-read.ts` | Ordinary-user order/task/timeline/proof DTOs and Product staging readiness. |
| [Store Console, Supplier, and Governance API](store-api.md) | `src/store-console/`, `src/store-suppliers/`, `src/governance/` | Nucleus workbench, supplier directory, reviews, identity binding register/revoke requests. |
| [Notifications and Reconcile](notifications-reconcile.md) | `src/notifications/`, `src/reconcile/` | Delivery intents, retry/dead-letter, submission/projection reconciliation. |
| [Storage, Migration, and Runtime Profile](storage-runtime.md) | `src/storage/`, `src/config/`, `migrations/` | memory/SQLite/PostgreSQL, migrations, testnet fail-closed profile. |
| [API Routes](api-routes.md) | `src/api/routes/` | Which module owns Product, Store, governance, notification, evidence, and diagnostics routes. |

## Subsystem Map

| Subsystem | Input | Output |
| --- | --- | --- |
| Indexer | Deployment registry, state-machine, Identity Registry logs. | Normalized projections and sync status over `OrderRegistered`, `SignalSubmitted`, `HookStatusChanged`, `HookReady`, etc. |
| Projection storage | Replayed events, workflow rows, submission rows. | memory/SQLite/PostgreSQL stores; erasable, rebuildable query state. |
| Relayer boundary | Participant-signed EIP-712 payloads. | Tx submission, retry, confirmation, failure states. |
| Stage patches | Selector-signed executor/resource patch typed data. | Submission path for `StageExecutorPatchApplied`, `StageResourcePatchApplied`. |
| Proof verifier | Metadata hash, evidence hash, Zhixu hash, object handle. | Proof mismatch report and evidence metadata. |
| Product projection | Chain projection, identity projection, evidence metadata. | Order/task/timeline/proof DTOs and staging readiness. |
| Product BFF | Order draft, invite, participant wallets, plan publication. | Order registration submit workflow and authorization table. |
| Store Console | Store drafts, versions, docking, audit, runtime metadata. | Nucleus workbench and review material. |
| Store Supplier | Supplier metadata, capability tags, contact material. | Off-chain supplier directory and review records; identity registration requests handled separately. |
| Identity workflow | Store identity review, admin actions. | Tx intents and audit for `IdentityBindingRegistered` / `IdentityBindingRevoked`. |
| Notifications | `HookReady`, submitter authorization, supplier identity, profiles. | Delivery intents and retry/dead-letter runtime states. |
| Reconcile | Submission state, chain confirmations, projection lag. | Background reconciliation status and repair loops. |
| API shell | Route context, stores, services, authz headers. | Product, Store, governance, notification, diagnostic HTTP routes. |
| Config/security/shared | Env, runtime profile, audit/redaction rules. | Fail-closed runtime checks, redacted diagnostics, shared types. |

## Boundary Checklist

The full protocol boundary statement lives in the [protocol boundary overview](../protocol-boundaries.md); the checklist below applies it to Chain Services:

- Contracts and chain events are the sole source of truth; Chain Services only projects, relays, and displays.
- Chain Services is replaceable, forkable off-chain execution software responsible for projection and relaying.
- A relayer may pay gas and broadcast transactions but cannot create business signatures.
- Product DTOs, Store DTOs, notification state, and audit trails are projection/workflow.
- Store metadata, contact information, reviews, tagging, and docking sessions are explicitly labeled off-chain workflow; identity bindings link to `UVPIdentityRegistry`, Order/Signal proof links to `UVPStateMachine`.
- The proof verifier can detect hash mismatches; fulfillment completion, internal fairness, and Identity Registry conclusions are expressed respectively by signal/proof, nucleus material, and registry publication.
- Off-chain storage keeps only object handles, metadata, hashes, and workflow state; plaintext evidence such as contracts, invoices, logistics, or vehicle documents never goes on chain.
- The indexer database must be erasable and rebuildable from contract events; any fork must preserve the replay and redaction rules.
