---
title: Protocol Boundaries
type: explanation
audience: 协议读者
preread: README.md
status: verified
---

This page is the single authoritative statement of UVP protocol boundaries. Everywhere else in this wiki, these boundaries are referenced with one sentence plus a link here, never restated in full. Protocol truth comes from code, `uvp-protocol/contracts/uvp-contracts/fixtures/`, chain events, and release records; if this page ever conflicts with the implementation, the implementation wins and this page gets fixed.

## Source of Truth

Contracts and chain events are the only source of truth for plan, order, signal, hook, publication, and deployment cutover state. Backends, Store, Order App, executor-kit, and periphery adapters may consume, project, present, relay, or extend core state — they cannot rewrite it. See [Data Flow and Source of Truth](data-flow-and-truth.md).

## Rebuildability

Every off-chain store — indexer databases, Product BFF databases, Store workflow state — must be rebuildable from chain events starting at the configured deployment block. They may cache, accelerate, and enrich the experience, but they are never sources of truth and may not retain state that cannot be explained after a rebuild. Operational details: [Storage, Migration, and Runtime Profile](services/storage-runtime.md).

## Read-Model Boundary

Store metadata is a read model: supplier capabilities, tags, reputation, search ranking, recommendations, contact info, review status, notification status, docking sessions, and operator audits are off-chain commercial and workflow data owned by Store or Product surfaces. Whether business actually progresses is always decided by registry/state-machine events (`PlanFinalized`, `OrderRegistered`, `SignalSubmitted`, `HookReady`). Canonical example: `approved_for_broadcast` only means Store is willing to take the next step; whether a Plan is usable depends on finalization in `UVPStateMachine`.

## Identity Boundary

`UVPIdentityRegistry` only records revocable subject-to-wallet bindings (`IdentityBindingRegistered` / `IdentityBindingRevoked`) so observers can resolve "who stands behind this account". It does not certify Plans, does not record capability or reputation, and is not an admission condition for the StateMachine; capability judgment belongs to Nuclei and Store off-chain. See [Contracts and Registries](contracts-and-registries.md) and [Store or external institution](trust/domains.md).

## Authorization and Signatures

- Business signatures come only from authorized participants' wallets; a relayer may broadcast transactions and pay gas but never creates business signatures.
- Signal submission is gated by order-level `SignalSubmitterAuthorized` and the active executor overlay, signed as EIP-712 typed data.
- Each `(orderId, sourceId, signalId)` accepts exactly one successful write (first-writer-wins); duplicate submissions revert with `SignalAlreadyExists`. Details: [Signal](core/signal.md) and [EIP-712 and Relayer](trust/eip712-relayer.md).

## Plan Lifecycle

A Plan is committed via `commitPlan()` binding the publisher signature and hooks/metadata hashes, then frozen once via `finalizePlan()`; only finalized Plans can create Orders. Plan identity derives from publisher plus committed content (`planId = hash(publisher, planHash)`). Modules frozen at deployment cannot be swapped by the owner; upgrades require deploying a new StateMachine and an explicit Deployment Registry cutover. See [Contracts and Registries](contracts-and-registries.md), [Canonical Hash](artifacts/canonical-hashes.md), and [Plan and Order Lifecycle](lifecycle.md).

## Order and Evidence Boundary

Once registered, an Order is an independent fact stream; the core protocol defines no terminal running/completed/cancelled states, and product-visible completion comes from authorized signals and proofs. Contracts, invoices, logistics documents, photos, OCR text, and other business materials never go on chain in plaintext — chains store only payloadHash, metadata URIs, resource manifest hashes, signatures, and events. A proof row should trace to tx, block, log, contract, chain id, event, and payload context. See [File Resources](core/file-resources.md) and [Evidence, Proof, and File Resource](services/evidence-proof.md).

## Product Surfaces and Service Boundaries

Product API may prepare typed data, verify signatures, call the relayer, and return proofs, but authorization checks always execute in the contract; Store review is platform workflow, not trust publication; Order App and executor-kit never expose HookPlan/sourceId/ABI/calldata/gas details and cannot bypass order-level signal authorization. Role names are display-only; rights come from on-chain authorization state.

## Periphery Adapters

Funding, USDC, escrow, guarantee, settlement, payments, logistics, and enterprise-system adapters belong to periphery (`uvp-periphery/`): they run around the core state machine, consuming `UVPStateMachine`, optional Identity Registry name resolution, Product DTO, or executor-kit interfaces — they must not turn funding, guarantee, payment, release, refund, or dispute state into new core facts.

## Public Interface Discipline

ABI, event topics, EIP-712 typed-data domains, canonical hash domains, artifact schemas, Product DTOs, deployment manifests, HTTP API contracts, and release evidence are public interfaces. Any change must explicitly update fixtures, pass `pnpm verify:protocol-freeze`, and sync adapters/indexers/executors/deployment scripts. Event inventory: [Contracts and Events](../reference/contracts-and-events.md); interface map: [Public Interfaces](../reference/public-interfaces.md); change checklist: [Daily Development](../how-to/development.md).

## Runtime Environment Discipline

Staging/testnet profiles must fail closed: reject memory/SQLite storage, localhost RPC, demo fallbacks, E2E fixture controls, permissive authorization, and Anvil default keys; demo/mock modes exist only inside explicitly declared demo profiles. Private keys, RPC secrets, JWT secrets, and object-storage credentials appear only redacted — never in the repository, logs, or docs. Execution details: [Storage, Migration, and Runtime Profile](services/storage-runtime.md) and [Troubleshooting](../how-to/troubleshooting.md).
