# Signal Container

A signal container is the product-layer wrapper for one authorized business action. It organizes the existing task, evidence, typed data, business signature, submission, and proof into a repeatable user and integration model; the chain still uses the existing contract types and events.

## Why This Concept Is Needed

Customs brokers, logistics systems, AI agents, payment adapters, guarantors, human teams, and ERP systems can all produce business actions. UVP needs a unified boundary:

```text
task -> evidence/input -> prepare typed data -> business signature -> submit -> chain proof
```

It is like a shipping container. A port does not need to know how a factory makes the goods; it only needs a standard box, manifest, authorized party, and handoff record.

## What the Container Holds

Minimal contents:

| Field | Meaning |
| --- | --- |
| `taskId` | Product task. |
| `orderId` | Owning order. |
| `stageId` | Corresponding stage. |
| `actionKind` | `submit_signal`, `stage_executor_patch`, or `stage_resource_patch`. |
| `requiredInputs` | Inputs the user or system needs to provide. |
| `requiredEvidence` | Required evidence or credential references. |
| `acceptedActor` | The accepted wallet, supplier subject, and trust status. |
| `typedData` | EIP-712 data to be signed. |
| `payloadHash` | Fingerprint of the business payload. |
| `idempotencyKey` | Request idempotency key. |
| `proof` | Tx, block, event, and proof rows. |

These fields can be derived from existing `ProductTaskDTO`, prepare / submit APIs, evidence APIs, and projections.

## Product API Mapping

Ordinary signal:

```text
GET /product/tasks/:taskId
POST /product/tasks/:taskId/prepare-submit
POST /product/tasks/:taskId/submit
GET /product/submissions/:submissionId
```

Stage patch:

```text
POST /product/tasks/:taskId/prepare-stage-executor-patch
POST /product/tasks/:taskId/submit-stage-executor-patch
POST /product/tasks/:taskId/prepare-stage-resource-patch
POST /product/tasks/:taskId/submit-stage-resource-patch
```

## Security Rules

- The container is a product wrapper; authoritative proof comes from on-chain contracts and events.
- The Product API may prepare and explain containers; the business signature comes from the participant wallet.
- A relayer may broadcast; the submitter identity comes from the signature and authorization.
- Evidence plaintext does not go on chain.
- `payloadHash` and metadata URI are the standard external boundary.
- Missing explicit capability metadata should fail closed, so permissions are not guessed from role copy.
- Ordinary UI does not display ABI, calldata, gas, `sourceId`, or `signalId`; advanced proof views may display them.

## What It Means for Executor Kit and MCP

executor-kit Product API mode and future MCP tools should consume signal containers so that AI or enterprise systems do not need to understand `HookReady`, ABI, or event topics directly. Tools can list tasks, fetch containers, prepare evidence, sign, submit, and read proof; order authorization still comes from the state machine.
