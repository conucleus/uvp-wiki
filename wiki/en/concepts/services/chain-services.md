---
title: The Rebuildable Service Layer: Chain Services
type: meta
audience: 工程贡献者
status: verified
---

# The Rebuildable Service Layer: Chain Services

`uvp-chain-services/service` is the rebuildable service layer of the UVP EVM track. It is not the source of protocol truth; contracts and chain events are. Chain Services provides rebuildable replay, projection, verification, and HTTP chain reads. The compiler turns Zhixu and Docks into deterministic artifacts, the state machine and frozen modules own on-chain facts, and Chain Services owns off-chain projections and generic chain reads.

It is a forkable off-chain service package. Any participant, nucleus, auditor, or third-party integration can download, fork, compile, and run its own instance; as long as it respects the ABI, event, EIP-712, canonical hash, and generic read API boundaries, different instances can rebuild the same class of fact views from the same set of chain events.

Package boundary: chain indexer, projection, generic read API, proof verifier, and chain health. Business rows, wallet sessions, evidence/governance write paths, and submission orchestration belong to the application side (used-car/backend); the chain process only holds chain projections, broadcasts no transactions, and creates no business signatures.

```text
UVPDeploymentRegistry / UVPStateMachine / UVPIdentityRegistry events
  -> chain-services indexer and replayed projections
  -> plan_artifacts / dock_artifacts read projections
  -> generic chain read API / uvp-client integration / ops views
```

## Why It Is Rebuildable

Rebuildable means the source of facts remains on chain. Chain Services turns events into order/task/stage projections, proofs into DTOs, compiled plan/Dock artifacts into read projections, and the current Dock binding windows into live values. Every public conclusion it produces must be traceable back to chain events, signatures, notarized hashes, or replayable projections.

| Question | Source of truth | Chain Services' role |
| --- | --- | --- |
| Is the plan committed and finalized | `UVPStateMachine` event | Index, query, and display the plan projection. |
| Has the order started; has the signal been submitted | Events such as `OrderRegistered`, `SignalSubmitted`, `HookReady` | Replay into orders, tasks, timelines, and proof rows. |
| Stage executors and Dock bindings | `StageExecutorPatchApplied`, `StageDockExecutorSelected`, `DockBindingPoked`, `DockOutputSubmitted` | Project executors, bindings, and output emission; current A/B windows are read live from `dockOutputWindow`. |
| Stage file maps | `StageFilePatchApplied`, `StageFileOpApplied` | Replay `key -> contentHash + handle` in same-transaction log order. |
| Which wallet does an offline subject correspond to | `UVPIdentityRegistry` event | Rebuild the identity binding projection for display names. |
| Did the user sign a given business action | EIP-712 signer recovery and on-chain authorization | Validate the payload; never sign for the user. |
| Store workflow and business rows | Application-side workflow storage | Not on chain; on-chain proof or trust publication is displayed separately. |

## Forkable Operating Model

Chain Services is an ordinary Node service package: `@uvp-eth/chain-services`. It can run as the official testnet service, or be downloaded by external teams onto their own machines, CI, private clouds, or integration environments. For dev/rebuild and other run commands, see [Run Services and Frontends](../../how-to/run-services-and-apps.md).

When forking or self-deploying, these interface constraints must hold:

- Rebuild projections from the deployment block, chain id, contract addresses, and event logs.
- Preserve contract context such as `stateMachineAddress` / `deploymentId`; bare order ids may only be resolved when unique.
- Keep ABI, event name, EIP-712 typed data, canonical hash, and Product DTO semantics.
- Label local databases, object storage, notification state, and Store review results as projection/workflow.
- User private keys stay on the user side; broadcasting is done by uvp-client or the application side, and the broadcast key creates no business signatures.

## Child Pages

| Subsystem | Code entry | Description |
| --- | --- | --- |
| [Indexer and Projections](indexer-projections.md) | `src/indexer/`, `src/storage/` projection rows | Rebuild order/task/proof/identity/dock views from deployment registry, state-machine, and identity registry events. |
| [Submissions and Stage Patch](submissions-stage-patch.md) | `src/indexer/projections/stage*.ts`, `src/indexer/projections/dock.ts`; application-side submission | Signing and broadcasting live in uvp-client / the application side; this page covers on-chain stage-patch entries and projection event shapes. |
| [Evidence, Proof, and File Resource](evidence-proof.md) | Application-side object storage, `src/proof-verifier/` | Evidence hashes, metadata hashes, object handles, proof mismatch reports. |
| [Product API](product-api.md) | Application side, `src/api/routes/chain-read.ts` | Ordinary-user order/task/timeline/proof DTOs are owned by the application side; generic chain reads live in `chain-read.ts`. |
| [Store Console, Supplier, and Governance API](store-api.md) | Application side | Store workbench and governance workflow; chain-services only provides chain projections and generic chain reads. |
| [Relayer](relayer.md) | uvp-client / application side | Gas payer and broadcasting **role**; creates no business signatures. |
| [Notifications and Reconcile](notifications-reconcile.md) | Application side | Delivery intents and reconciliation are operational workflow. |
| [Storage, Migration, and Runtime Profile](storage-runtime.md) | `src/storage/`, `src/config/`, `migrations/` | Postgres-only storage, migrations, testnet fail-closed profile. |
| [API Routes](api-routes.md) | `src/api/routes/` | Which module owns chain-read, identity-binding, diagnostics, ops, and business-surface migration responses. |

## Subsystem Map

| Subsystem | Input | Output |
| --- | --- | --- |
| Indexer | Deployment registry, state-machine, Identity Registry logs. | Normalized projections and sync status over `OrderRegistered`, `SignalSubmitted`, `HookStatusChanged`, `HookReady`, `StageExecutorPatchApplied`, `StageDockExecutorSelected`, `DockBindingPoked`, `DockOutputSubmitted`, `StageFilePatchApplied`, `StageFileOpApplied`, etc. |
| Projection storage | Replayed events, projection snapshots. | Postgres store; erasable, rebuildable query state. |
| Plan/Dock artifacts | uvp-core compiled-artifact recording CLI. | Row-immutable `plan_artifacts` / `dock_artifacts` read projections; missing or identity-mismatched artifacts fail closed. |
| Chain read API | Projection snapshots, plan artifacts, dock binding window reader. | `/chain/*`, `/identity/bindings` generic chain reads and A/B window live enrichment. |
| Proof verifier | Metadata hash, evidence hash, Zhixu hash, object handle. | Proof mismatch report and evidence metadata. |
| Diagnostics/ops | Readiness, sync status, admin actions. | Redacted diagnostics and ops routes. |
| Config/security/shared | Env, runtime profile, audit/redaction rules. | Fail-closed runtime checks, redacted diagnostics, shared types. |

## Boundary Checklist

- Contracts and chain events are the sole source of truth; Chain Services only projects and displays. The full protocol boundary statement lives in the [protocol boundary overview](../protocol-boundaries.md).
- Chain Services is replaceable, forkable off-chain projection software.
- Broadcasting and signing are done by uvp-client or the application side; a broadcast key creates no business signatures.
- Product DTOs, Store DTOs, notification state, and audit trails are projection/workflow.
- Store metadata, contact information, reviews, tagging, and Dock declaration / trial-pairing records are explicitly labeled off-chain workflow; identity bindings link to `UVPIdentityRegistry`, Order/Signal proof links to `UVPStateMachine`.
- The proof verifier can detect hash mismatches; fulfillment completion, internal fairness, and Identity Registry conclusions are expressed respectively by signal/proof, nucleus material, and registry publication.
- Off-chain storage keeps only object handles, metadata, hashes, and workflow state; plaintext evidence such as contracts, invoices, logistics, or vehicle documents never goes on chain.
- The indexer database must be erasable and rebuildable from contract events; any fork must preserve the replay and redaction rules.
