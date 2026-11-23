---
title: Signal Container
type: explanation
audience: 产品与集成工程师
preread: dto.md
status: verified
---

# Signal Container

> Prerequisite reading: [Product DTO](dto.md)
The signal container is the product layer's wrapper for one authorized business action. It is a product/API concept, not a new contract object. It organizes the existing task, evidence, typed data, business signature, submit, and proof into a repeatable model for users and integrations; the chain still uses the existing contract types and events.

## Why this concept is needed

Customs brokers, logistics systems, AI agents, payment adapters, guarantors, human teams, and ERPs can all produce business actions. UVP verifies one unified boundary:

```text
task -> evidence/input -> prepare typed data -> business signature -> submit -> chain proof
```

It is like a shipping container. A port does not need to know how the factory produces goods; it only needs a standard box, a manifest, an authorized party, and handoff records.

## What the container holds

Minimal contents:

| Field | Meaning |
| --- | --- |
| `taskId` | Product task. |
| `orderId` | Owning order. |
| `stageId` | Corresponding stage. |
| `actionKind` | `submit_signal` or `stage_executor_patch`; a stage file patch is expressed as the `FilePatch` companion surface of `submit_signal` (`signalId == 0` is a pure file patch). |
| `requiredInputs` | Inputs the user or system must provide. |
| `evidenceSpec` | Publisher-configured structured evidence requirements (key/label/inputKind/accept, ...); the sole source of task evidence rules — absent spec means no evidence slots. |
| `acceptedActor` | Accepted wallet, supplier subject, trust status. |
| `typedData` | EIP-712 data to sign. |
| `payloadHash` | Business payload fingerprint. |
| `idempotencyKey` | Request idempotency key. |
| `proof` | Tx, block, event, proof rows. |

These fields can be derived from the existing `ProductTaskDTO`, prepare/submit APIs, the evidence API, and projections.

## Product API mapping

Product-side prepare/submit endpoints are maintained by the used-car application backend (the application `app-contract` is the single path source); this repository does not verify endpoint names. The protocol-side submission surfaces are fixed:

- Ordinary signal: direct `submitSignal` (identity fixed to `msg.sender`; trailing `bytes32 filesDigest` + `FilePatch`).
- Executor patch: `UVPStagePatchModule`'s `StageExecutorPatch` typed data → `applyStageExecutorPatchFor` (domain `stageSupplierPatch` 1, mode closed set `assign`/`handoff`).
- Stage file patch: submitted as the trailing `FilePatch` on direct `submitSignal` (`signalId == 0` is a pure file patch) and applied by `UVPFileResourceModule.applyStageFilePatch` as `add` / `replace` / `remove`.

## Security rules

- The container is product packaging; authoritative proof comes from on-chain contracts and events.
- The Product API may prepare and explain containers; the business signature comes from the participant wallet.
- A relayer may broadcast; submitter identity comes from signatures and authorization.
- Evidence plaintext never goes on chain.
- `payloadHash` and metadata URI are the standard external boundary.
- Missing explicit capability metadata should fail closed instead of guessing permissions from role copy.
- Ordinary UIs do not show ABI, calldata, gas, sourceId, or signalId; advanced proof views may.

## Meaning for UVP Client and MCP

The uvp-client/browser Product V3 client, headless tools, and future MCP tools should consume signal containers so AI or enterprise systems do not need to understand HookReady, ABI, and event topics directly. Tools can list tasks, fetch containers, prepare evidence, sign, submit, and read proof; order authorization still comes from the state machine.

## Related Pages

- [Product Surfaces entry](README.md)
- [Product DTO](dto.md)
- [Evidence, Proof, and File Resource](../services/evidence-proof.md)
- [Product API Endpoints](../../reference/product-api-endpoints.md)
