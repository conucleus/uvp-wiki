---
title: Signal
type: explanation
audience: 协议读者
preread: ../README.md
status: verified
---

# Signal

> Prerequisite reading: [Core Concepts](../README.md)
A Signal is the smallest business input the order state machine accepts. It represents "some authorized wallet submitted some class of action or evidence fingerprint to some order".

## Who Uses It

Authorized submitters (participant wallets, executors, adapters) submit signals; contracts validate and record them; Product/Store/uvp-client project `SignalSubmitted` into task completion status and proof rows.

## What It Produces

A successful submission writes an immutable signal record and emits `SignalSubmitted`; it drives [Hook](hook.md) evaluation for hooks depending on that signal and may trigger `HookStatusChanged` or `HookReady`.

## Where Authority Comes From

A signal's validity is decided by contract authorization checks over `(planId, orderId, signalKey, submitter)`; only hashes go on chain, and business meaning is interpreted by the Zhixu, stage protocol, and Product DTO. `orderId` is not a global primary key; every read must retain its `planId`.

## Where Signals Sit in the DSL

Two places in a Zhixu stage relate directly to signals:

| Field | Meaning |
| --- | --- |
| `sendSignals` | Which output signals the stage may emit after execution; entries are objects `{name, validWhen?, trigger?}`; `trigger: true` marks a birth signal and `validWhen` is the emission admission declaration. |
| `receiveSignals` | Which in-order input signals the stage waits for. Each key compiles into one [Hook](hook.md). |

For example, a buyer commitment stage:

```yaml
buyer_commit:
  source: buyer
  receiveSignals:
    OFFER_READY: commercial::commercial_offer.cmp
  sendSignals:
    - name: cmp
    - name: cxl
    - name: err
```

The meaning: once the commercial offer completes, the buyer commitment stage is ready; that stage may subsequently emit `cmp`, `cxl`, or `err` for later hooks to consume.

## Emission Admission (validWhen)

A `sendSignals` entry may declare `validWhen`, an emission admission expression. When an externally submitted signal carrying such a declaration arrives, the engine first evaluates the expression against the facts already committed on the order (excluding the submission itself): the whole expression must be ready for the emission to be admitted, otherwise it is rejected with a typed error — on chain the entire transaction reverts with `SignalAdmissionRejected`, and nothing is written to the fact stream. The declaration form is a list of expressions (`[]string`: each item a complete `{source}::{condition}`, all items sharing one header source; folded into a single AND tree at compile time). Signals without `validWhen` are admitted unconditionally; duplicate submissions of an already-recorded fact are absorbed first-win without re-screening.

The admission face is scoped by fact origin: external submissions are evaluated against the pre-state before writing; engine-internal derived-signal writes (`*FromModule` family) stay below this chokepoint; dock output emission re-checks the B-side `validWhen` at write time (an unsatisfied window skips that output without recording a failure). The expression language, compile-time constraints, and evaluation semantics are owned by the single canonical grammar manual (`uvp-core/docs/zhixu-dsl-grammar.md` §5.6 emission-admission position).

## Birth Signals and the First Fact

`trigger: true` on a `sendSignals` entry marks a birth signal, the only birth entry on the DSL declaration surface. When `orderId` is empty and the signal is a birth signal, the contract first evaluates that signal's `validWhen` in the **empty-order context** (no facts/files; negative conditions true; existence/delay conditions false), then derives the order id from the birth fact, registers/creates the order, and writes the signal as the first fact. Re-delivery of the same birth fact is idempotent; an empty `orderId` with a non-birth signal is rejected by name; a birth signal with an order id is an ordinary in-order fact.

The chain track has three runtime birth channels: outside-trigger open submission (signed submission by the plan-committed `birthAuthorizer`, or the direct entry when `birthAuthorizer` is a contract), order-link derived creation, and governance fork `forkOrder`; order ids are always derived purely from birth facts and never self-reported. Dock carries emission through a binding on an existing order and does not create orders. See [Order](order.md) and `uvp-chain.md`.

## From Text Name to On-chain Key

In Hook DSL a signal is usually written as:

```text
stage.signal
```

In the contract it becomes three stable identifiers:

```text
sourceId = keccak256(source)
signalId = keccak256(signalName)
signalKey = keccak256(abi.encode(sourceId, signalId))
```

`source` denotes the causal context — which traceable lane this action enters; see [Source Causal Chain](source.md). Roles, suppliers, or system entry points can be part of the submitter or business interpretation, but the on-chain signal key is decided by `source` and `signalName`. `signalName` names the concrete action; the contract deduplicates and looks up dependencies by `signalKey`.

## Common Signal Name Convention

The common name convention includes str, cmp, err, cxl, pass, fail, plus reject for veto scenarios:

| Name | Common meaning |
| --- | --- |
| `str` | start — the executor starts or takes the job. |
| `cmp` | complete — the stage finished. |
| `err` | error — the stage hit an exception. |
| `cxl` | cancel — cancelled. |
| `pass` | Validation passed. |
| `fail` | Validation failed. |
| `reject` | Business rejection. |

These are caller conventions; the engine has no built-in semantics for them, and order creation is carried only by birth signals. Concrete meaning is still interpreted by the Zhixu, stage protocol, Product DTO, and business evidence. The contract only recognizes `signalId` and authorization.

## First Writer Wins

For the protocol boundary overview, see [Protocol Boundaries](../protocol-boundaries.md).

Within one order, a given `signalKey` can be successfully submitted only once:

- The first submission writes the signal record and emits `SignalSubmitted`.
- Later duplicate submissions are absorbed first-win: no second fact, no repeated advance, and no re-run of the emission admission screen (safe for at-least-once retries); the `SignalAlreadyExists` revert is reserved for engine-internal write entry points.
- The first successful write is the final on-chain fact of that `(planId, orderId, sourceId, signalId)`; there is no overwrite, revocation, or admin rewrite entry point.

The `idempotencyKey` is kept in events and projections so the service layer can identify request origin; but the contract-level deduplication key is `(planId, orderId, sourceId, signalId)`.

If the first submission was wrong, create a new Order from the Zhixu and resubmit. The original Signal cannot be modified, and the old Order remains as auditable fact.

## Payload Stores Hashes Only

The contract does not store plaintext contracts, invoices, logistics documents, vehicle records, photos, or approval files. Business evidence belongs off-chain; on chain only:

| Field | Meaning |
| --- | --- |
| `payloadHash` | Hash of the evidence or action payload. |
| `metadataURI` | If needed, may point to off-chain metadata in projections or adapters. |
| `submitter` | The authorized wallet address. |
| `submittedAt` | The on-chain record time. |

This boundary matters: chain provides verifiable ordering and permissions, not business file storage.

### Encoding convention: payloadHash = bytes32(0) means no payload

`payloadHash` is a required `bytes32` field, but not every submission carries a business payload. The protocol specifies:

- `payloadHash = bytes32(0)` (that is, `0x0000…0000`) is a legal protocol constant meaning "this signal has no payload"; it is not missing data or an error state.
- With a payload, `payloadHash` must be the hash of the canonicalized off-chain payload; projections and consumers use it to distinguish "has evidence" from "pure action/state signal".
- This is an encoding convention, not a placeholder fallback: the submitting side writes `bytes32(0)` explicitly when there is no payload, and consumers read zero as "no payload" rather than unknown or error.

### File patches ride the signal submission

Stage file-map writes travel in the tail of the direct `submitSignal`: the call carries `bytes32 filesDigest` and `FilePatch filePatch`, and `filesDigest` must equal the patch's canonical digest. A pure file patch is submitted with `signalId == 0` — it is not a business signal, does not increment business signal counts, does not evaluate hooks, and does not run admission; key values, strict ops, `baseHash`, and events are covered in [File Resources](file-resources.md).

## Authorization Is an On-chain Check

Product API may show a task to some participant, but whether submission succeeds is finally checked by the contract:

```text
planId + orderId + signalKey + submitter
```

Authorization comes from the order-level explicit `SignalAuthorization`: written at order creation, or written as an explicit authorization set for the new executor when an executor patch takes effect; existing explicit authorizations are not revoked by later patches. The derived-signal module has a separate internal write face (relation=0 facts produced by the from stage's current executor) — it is not a bypass of the external-submission authorization face. See [Signal Authorization](../trust/signal-authorization.md). Both paths are checked by the contract; even if the UI shows a button, submission without valid authorization will be rejected.

## The Protocol Boundary of Signals

A signal means "an authorized action happened". Supplier internal workflows, procurement processes, financing processes, or AI reasoning can live in evidence, metadata URIs, or supplier systems; the UVP core verifies only authorization, signatures, payload hashes, and event proofs. For the site-wide invariants — on-chain source of truth, no plaintext on chain, relayers do not sign — see [Protocol Boundaries](../protocol-boundaries.md).
