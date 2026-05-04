# Evidence, Proof, and File Resource

The evidence and proof subsystems handle handles, hashes, metadata, and proof views for off-chain materials. They help Product UI, Store, auditors, and executors confirm whether a given material matches a given on-chain event. Business completion is still determined by state-machine signal/hook proof.

## Code Entry Points

| File | Responsibility |
| --- | --- |
| `src/evidence/hashing.ts` | evidence hash and metadata hash calculation. |
| `src/evidence/service.ts` | evidence metadata creation, lookup, and proof composition. |
| `src/evidence/store.ts` | storage contract. |
| `src/evidence/sqlite-store.ts`, `postgres-store.ts` | durable evidence store. |
| `src/evidence/storage.ts` | object storage adapter interface. |
| `src/evidence/rehearsal-object-storage.ts` | local/rehearsal object storage adapter. |
| `src/evidence/s3-object-storage.ts` | S3/R2-style object storage adapter. |
| `src/proof-verifier/service.ts` | metadata hash, evidence hash, and Zhixu hash alignment checks. |
| `src/api/routes/evidence.ts` | evidence upload metadata and proof route. |

## File Resource Is a Handle

A File Resource is a verifiable resource reference:

```text
file resource handle
  -> fileType / object namespace / URI policy
  -> metadata hash / content hash
  -> chain event proof row
```

The common form is off-chain object storage: S3, R2, private object storage, or a local rehearsal adapter. It can also be designed as on-chain storage, but that is a different `fileType` and cost model; the default object-storage interpretation is an off-chain handle.

## What the Proof Verifier Does

- Checks whether evidence metadata and hashes match.
- Checks whether the evidence hash aligns with the signal payload or proof row.
- Checks whether the Zhixu hash / plan hash matches the current version.
- Reports mismatches in a form that UI/API can display.

Proof verifier boundaries:

- Whether goods were actually delivered is judged by business participants, evidence, and the dispute/review system.
- Supplier trust is expressed by trust-domain attestation.
- Object handle accessibility cannot generate `SignalSubmitted`.
- Hash alignment is a proof condition; hook readiness comes from state-machine events.

## Plain-Text Evidence Boundary

Contracts, invoices, logistics records, vehicle records, photos, OCR originals, and similar business materials should not be written on chain in plaintext. On-chain storage should contain only hashes, URIs, signatures, events, and the minimum necessary metadata. Chain Services may store object handles and reconstructable metadata. Private credentials, RPC secrets, JWT secrets, and database passwords must stay out of docs, logs, and proof output.
