---
title: Signal
type: explanation
audience: 协议读者
preread: README.md
status: verified
---

# Signal

A Signal is the smallest business input the order state machine accepts. It represents "some authorized wallet submitted some class of action or evidence fingerprint to some order".

## Who Uses It

Authorized submitters (participant wallets, executors, adapters) submit signals; contracts validate and record them; Product/Store/executor-kit project `SignalSubmitted` into task completion status and proof rows.

## What It Produces

A successful submission writes an immutable `SignalRecord` and emits `SignalSubmitted`; it drives [Hook](hook.md) evaluation for hooks depending on that signal and may trigger `HookStatusChanged` or `HookReady`.

## Where Authority Comes From

A signal's validity is decided by contract authorization checks over `(orderId, signalKey, submitter)`; only hashes go on chain, and business meaning is interpreted by the Zhixu, stage protocol, and Product DTO.

## Where Signals Sit in the DSL

Two places in a Zhixu stage relate directly to signals:

| Field | Meaning |
| --- | --- |
| `receiveSignals` | Which input signals the stage waits for. Each key compiles into one [Hook](hook.md). |
| `sendSignals` | Which output signals the stage may emit after execution. |

For example, a buyer commitment stage:

```yaml
buyer_commit:
  source: buyer
  trigger:
    - OFFER_READY
  receiveSignals:
    OFFER_READY: commercial::master.commercial_offer.cmp
  sendSignals:
    - cmp
    - cxl
    - err
```

The meaning: once the commercial offer completes, the buyer commitment stage is ready; that stage may subsequently emit `cmp`, `cxl`, or `err` for later hooks to consume.

## From Text Name to On-chain Key

In Hook DSL a signal is usually written as:

```text
task.stage.signal
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

Concrete meaning is still interpreted by the Zhixu, stage protocol, Product DTO, and business evidence. The contract only recognizes `signalId` and authorization.

## First Writer Wins

For the protocol boundary overview, see [Protocol Boundaries](../protocol-boundaries.md).

Within one order, a given `signalKey` can be successfully submitted only once:

- The first submission writes the `SignalRecord` and emits `SignalSubmitted`.
- Later duplicate submissions revert with `SignalAlreadyExists`.
- The first successful write is the final on-chain fact of that `(orderId, sourceId, signalId)`; there is no overwrite, revocation, or admin rewrite entry point.

The `idempotencyKey` is kept in events and projections so the service layer can identify request origin; but the contract-level deduplication key is `(orderId, sourceId, signalId)`.

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

## Authorization Is an On-chain Check

Product API may show a task to some participant, but whether submission succeeds is finally checked by the contract:

```text
orderId + signalKey + submitter
```

Authorization can come from explicit grants at Order creation or from a valid Executor patch dynamically delegating within the Plan-predeclared `sendSignals` scope; see [Signal Authorization](../trust/signal-authorization.md). Both paths are checked by the contract; even if the UI shows a button, submission without valid authorization will be rejected.

## The Protocol Boundary of Signals

A signal means "an authorized action happened". Supplier internal workflows, procurement processes, financing processes, or AI reasoning can live in evidence, metadata URIs, or supplier systems; the UVP core verifies only authorization, signatures, payload hashes, and event proofs. For the site-wide invariants — on-chain source of truth, no plaintext on chain, relayers do not sign — see [Protocol Boundaries](../protocol-boundaries.md).
