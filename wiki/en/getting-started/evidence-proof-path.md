# Evidence and Proof Path

A cross-border PV project produces many business files: design confirmations, equipment specifications, purchase contracts, factory reports, packing lists, customs materials, port-arrival and customs-release records, warehouse receipts, site-delivery photos, installation records, and O&M reports. UVP records the authorized statements, evidence fingerprints, metadata references, signatures, and chain events attached to those materials.

## Main Path

```text
business file or private record
  -> evidence metadata
  -> payloadHash / metadataURI
  -> participant signature
  -> submitSignal / submitSignalFor
  -> SignalSubmitted
  -> Product proof row
```

## Each Step in the PV Project

| Step | PV project example | Authority boundary |
| --- | --- | --- |
| Business file or private record | Purchase contract, equipment spec, factory report, packing list, customs declaration, customs-release record, warehouse receipt, site-delivery photo, O&M report. | Stays off chain; access policy belongs to the business system, object storage, or enterprise archive. |
| Evidence metadata | Product or adapter record for file type, hash, object handle, visibility, and related Order/stage/signal. | Workflow/read-model data used to organize evidence and build the submission payload. |
| `payloadHash` | Fingerprint of one submitted business payload or evidence bundle, such as "customs released + customs material hash". | Signed by the participant and submitted; later verification can recompute it from the original materials. |
| `metadataURI` | Reference to off-chain metadata, manifest, or storage reference. | The chain stores the reference; private file access stays under off-chain control. |
| participant signature | OEM, logistics provider, EPC, owner, O&M provider, or trust domain signs with an authorized wallet. | Proves which business subject accepts responsibility for the statement. |
| `SignalSubmitted` | The state machine accepts one source/signal for this Order. | Chain event; first writer wins for the same order and signal key. |
| Product proof row | User-readable proof row showing tx, block, log, contract, chain id, event, submitter, payload hash, and metadata URI. | Rebuildable from chain events for Store, Order App, and executor-kit display. |

## Where fileResources Fit

`fileResources` describe material requirements agreed before the stage begins, for example:

- OEM factory-release stage requires equipment specifications, inspection report, and packing list.
- Customs stage requires invoice, packing list, declaration materials, and port-arrival information.
- Site-delivery stage requires warehouse outbound record, site photos, and handover receipt.
- O&M stage requires inspection report, fault-response record, and maintenance-complete record.

They are stage requirements and material handles. Business completion is shown by an authorized signal and the corresponding chain-event proof.

## Common Readings

| Situation | Correct reading |
| --- | --- |
| File uploaded | Evidence material is prepared; task completion still depends on the authorized signal. |
| Store operator reviewed it | Workflow moved forward; protocol fact comes from registry or state-machine events. |
| Relayer broadcast a transaction | Transaction was submitted; business responsibility comes from participant signature. |
| Product proof row is temporarily missing | Check indexer sync status and event provenance first. |
| Off-chain material must stay private | Chain keeps only hashes, URIs, signatures, and events; plaintext access stays under business-system control. |
