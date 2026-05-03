# Evidence and Proof Path

UVP does not put contracts, invoices, logistics files, photos, or private business documents on chain. It records authorized claims, evidence fingerprints, metadata references, signatures, and chain events.

## The Path

```text
business file or private record
  -> evidence metadata
  -> payloadHash / metadataURI
  -> participant EIP-712 signature
  -> submitSignal / submitSignalFor
  -> SignalSubmitted event
  -> Product proof row
```

## What Each Step Means

| Step | Meaning | Authority boundary |
| --- | --- | --- |
| Business file or private record | Contract, invoice, customs document, photo, report, or internal system record. | Stays off chain; access policy belongs to the business system or storage layer. |
| Evidence metadata | Product or adapter record describing the evidence, hashes, object handles, and visibility. | Workflow/read-model data; not business completion by itself. |
| `payloadHash` | Fingerprint of the submitted business payload or evidence bundle. | Signed and submitted on chain; useful for later verification. |
| `metadataURI` | Pointer to off-chain metadata, manifest, or storage reference. | A reference, not the protocol truth by itself. |
| EIP-712 signature | Structured statement signed by the authorized wallet. | Proves the business actor, not the relayer. |
| `SignalSubmitted` | State-machine event accepting the signal for `(orderId, sourceId, signalId)`. | Chain event; first writer wins for that order and signal key. |
| Product proof row | User-readable projection of the event with tx, block, log, contract, chain id, and payload fields. | Rebuildable from chain events. |

## Where File Resources Fit

`fileResources` describe what a stage expects: templates, protocols, resource manifests, evidence requirements, or acceptance criteria. They are handles and requirements, not the proof that a business action is complete. Completion is shown by an authorized signal and its event proof.

## Common Mistakes

- A file upload is not a completed task until the authorized signal is submitted.
- Store notes, notification delivery, or operator review are workflow records, not `SignalSubmitted`.
- A relayer transaction does not prove business consent unless the participant signature is valid.
- A missing Product proof row should be diagnosed with indexer sync status before assuming the chain event does not exist.
