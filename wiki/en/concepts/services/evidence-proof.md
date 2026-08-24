---
title: Evidence, Proof, and File Resource
type: explanation
audience: 工程贡献者
status: verified
---

# Evidence, Proof, and File Resource

The evidence and proof subsystems handle handles, hashes, metadata, and proof views for off-chain materials. They help the Product UI, Store, auditors, and executors confirm whether a given material matches a given on-chain event. Business completion is still determined by state-machine signal/hook proof.

## Code Entry Points

| File | Responsibility |
| --- | --- |
| `src/evidence/hashing.ts` | Evidence hash and metadata hash calculation. |
| `src/evidence/service.ts` | Evidence metadata creation, lookup, and proof composition. |
| `src/evidence/store.ts` | Storage contract. |
| `src/evidence/sqlite-store.ts`, `postgres-store.ts` | Durable evidence store. |
| `src/evidence/storage.ts` | Object storage adapter interface. |
| `src/evidence/rehearsal-object-storage.ts` | Local/rehearsal object storage adapter. |
| `src/evidence/s3-object-storage.ts` | S3/R2-style object storage adapter. |
| `src/proof-verifier/service.ts` | Metadata hash, evidence hash, and Zhixu hash alignment checks. |
| `src/api/routes/evidence.ts` | Evidence upload metadata and proof route. |

## A File Resource Is a Handle

A File Resource is a verifiable resource handle — fileType, object namespace, and URI policy plus metadata/content hashes, ultimately landing as an on-chain proof row. In practice it is an off-chain object such as S3, R2, private object storage, or a local rehearsal adapter. For the full model and type definitions, see [File Resources](../core/file-resources.md).

## What the Proof Verifier Does

- Checks whether evidence metadata and hashes are consistent.
- Checks whether the evidence hash aligns with the signal payload or proof row.
- Checks whether the Zhixu hash / plan hash aligns with the current version.
- Reports mismatches in a form the UI/API can display.

Proof verifier boundaries:

- Whether goods were actually delivered is judged by business participants, evidence, and the dispute/review system.
- Identity Registry publication expresses only the binding between an offline subject and an on-chain account; it does not certify supplier capability or reputation, which remain Store off-chain business data.
- Object-handle accessibility cannot generate `SignalSubmitted`.
- Hash alignment is a proof condition; hook readiness comes from state-machine events.

## The Plaintext Evidence Boundary

Business materials such as contracts, invoices, logistics records, vehicle documents, photos, and OCR originals must not go on chain in plaintext. Only hashes, URIs, signatures, events, and necessary metadata are stored on chain. Chain Services may store object handles and rebuildable metadata, but must keep private credentials, RPC secrets, JWT secrets, and database passwords out of docs, logs, and proof output.
