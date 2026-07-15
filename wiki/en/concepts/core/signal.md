# Signal

A Signal is the smallest business input accepted by the order state machine. It represents “an authorized wallet submitted a certain kind of action or evidence fingerprint for a certain Order.”

## Where Signal Sits in the DSL

Zhixu stages have two fields directly related to signal:

| Field | Meaning |
| --- | --- |
| `receiveSignals` | Which input signals the current stage is waiting for. Each key compiles into one hook. |
| `sendSignals` | Which output signals the current stage may emit after it runs. |

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

The meaning is: after the commercial offer is complete, the buyer commitment stage becomes ready; that stage may later emit `cmp`, `cxl`, or `err` for downstream hooks to consume.

## From Text Name to On-chain Key

In the Hook DSL, a signal is usually written as:

```text
task.stage.signal
```

On chain, it becomes three stable identifiers:

```text
sourceId = keccak256(source)
signalId = keccak256(signalName)
signalKey = keccak256(abi.encode(sourceId, signalId))
```

`source` describes the causal context, meaning which traceable chain this action belongs to. Roles, Suppliers, or system entry points may be part of the submitter or business interpretation, but the on-chain signal key is determined by `source` and `signalName`. `signalName` is the specific action name, and the contract ultimately deduplicates and resolves dependencies by `signalKey`.

## Common Signal Naming Conventions

`str`, `cmp`, `err`, `cxl`, `pass`, and `fail` are common signal conventions in the current DSL and product semantics:

| Name | Common meaning |
| --- | --- |
| `str` | start, the executor starts or accepts the task. |
| `cmp` | complete, the stage is complete. |
| `err` | error, the stage has an exception. |
| `cxl` | cancel, cancellation. |
| `pass` | verification passed. |
| `fail` | verification failed. |
| `reject` | business rejection. |

The exact meaning is still interpreted by the Zhixu, stage protocol, Product DTO, and business evidence. The contract only recognizes `signalId` and authorization.

## First Writer Wins

Within a single Order, the same `signalKey` can only be successfully submitted once:

- The first submission writes a `SignalRecord` and emits `SignalSubmitted`.
- Later duplicate submissions revert with `SignalAlreadyExists`.
- The first successful write is the final on-chain fact for that `(orderId, sourceId, signalId)`; there is no overwrite, revocation, or administrator rewrite entry point.

`idempotencyKey` is stored in events and projections to help services identify the request source; but the contract-level deduplication key is `(orderId, sourceId, signalId)`.

If the first submission is wrong, the remedy is not to edit that Signal. Create a new Order from the Zhixu and submit again; the old Order remains as auditable history.

## Payloads Are Hashes Only

The contract does not store plaintext business data such as contracts, invoices, shipping records, vehicle photos, or approval files. Business evidence should stay off chain; on chain only stores:

| Field | Meaning |
| --- | --- |
| `payloadHash` | The hash of the evidence or action payload. |
| `metadataURI` | If needed, a reference to off-chain metadata from a projection or adapter. |
| `submitter` | The authorized wallet address. |
| `submittedAt` | The on-chain timestamp. |

This boundary matters: the chain provides verifiable ordering and permissions, not business file storage.

## Authorization Is Checked On Chain

The Product API may show a task to a participant, but whether they can actually submit it is still checked by the contract:

```text
orderId + signalKey + submitter
```

Authority may come from explicit Order-creation authorization or from an executor patch dynamically delegating the Plan-declared `sendSignals` scope. Both paths are enforced by the contract; a UI button cannot create authority.

## Signal Protocol Boundary

A signal means “an authorized action happened.” Internal supplier workflows, procurement processes, financing processes, or AI reasoning steps may be stored in evidence, metadata URIs, or supplier systems; UVP’s core validation boundary is authorization, signature, payload hash, and event proof.
