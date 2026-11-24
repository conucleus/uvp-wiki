---
title: Version and Semantics Matrix
type: reference
audience: 工程贡献者
status: verified
---

# Version and Semantics Matrix

All versions converge on one baseline: contract ABI fixtures `0.1`, EIP-712 domain version `1`, and artifact schemas `v1`. The authoritative values live in `uvp-deploy/deploy/compatibility/uvp-stack.v1.json`.

| Boundary | Current version | Meaning |
| --- | --- | --- |
| Rust core package | `0.1.0` | Canonical Hook evaluation core. |
| Zhixu analysis | `uvp.zhixuAnalysis.v1` | uvp-core analyze wire schema. |
| Protocol semantics | `uvp.semantic.v1` | Hook parsing, evaluation, and replay consistency boundary. |
| Cloud AST | `uvp.cloudAst.v1` | Cloud-side compiled AST wire schema. |
| HookPlan artifact | `uvp.hookPlan.v1` | Compiler internal/public artifact; birth lines derive from `sendSignals[].trigger`, and supplier bindings (default/candidate) plus dynamic markers enter the artifact. |
| OnchainHookPlan | `uvp.onchainHookPlan.v1` | EVM compiled artifact schema; `orderTriggerKind` is `none`/`trigger`, `triggers[]` enumerates birth lines, and `supplierBindings`/`supplierBindingsRoot` commit plan supplier bindings. |
| Cloud artifact | `uvp.cloudArtifact.v1` | Cloud-side compiled artifact schema. |
| Dock artifact | `uvp.dock.v1` | Static Dock document/compiled artifact schema (uvp-core analyzeDock; contains A validWhen AST/dependencies/atoms). |
| Dock binding read DTO | `uvp.dockBinding.v1` | Chain-read binding/per-output window projection wire schema. |
| StateMachine ABI | `0.1` | Signed Plan commit/finalize (six-field PlanCommit: publisher, hooksHash, capabilitiesRoot, supplierBindingsRoot, `fileWritersHash`, deadline, plus `StageSupplierBinding[]` and `StageFileWriter[]`), identityRegistry module slot and supplier strong-registration checks, dynamic stages (hook flag 32) with per-order supplierId assignment, assigned-supplier-account submission authority, and a single `submitSignal` entry (EIP-712 ECDSA/EIP-1271, msg.sender only a relayer). Events: `PlanCommitted` carries `supplierBindingsRoot`; `SignalSubmitted` carries `relayer`; `StageSupplierAssigned`/`StageSupplierPatchApplied` carry supplierId/patchNonce. EIP-712 domain version `1`. |
| Plan registration library ABI | `0.1` | `commitPlan`/`finalizePlan`/`submitSignal` execution body linked out as `UVPPlanRegistration`; commit checks `StageSupplierBinding[]`, `StageFileWriter[]`, `supplierBindingsRoot`, `fileWritersHash`, and the `_validateInstructions`/`_registerPlanAdmission` instruction plans. |
| IdentityRegistry ABI | `0.1` | The single on-chain identity boundary: subjectId/account bindings (revocable trust attestation) and the supplier capability/account namespace (SID minting, permanent account binding, `pending/active/suspended/revoked`); the supplier namespace is the execution-authority source and the subject namespace grants no submission right. |
| DeploymentRegistry ABI | `0.1` | Deployment cutover and canary records. |
| Derived signal module ABI | `0.1` | Derived signal module frozen ABI (EIP-712 domain version `1`); write authority comes from the from-stage's effective supplier, with no target-order explicit-authorization fallback. |
| Product submit domain | `1` | Product signal submit EIP-712 domain; primary type `UVPStateMachineSignalSubmission` (11 fields including `targetStageId`, `filesHash`, `attributionHash`). |
| Stage patch module ABI | `0.1` | `applyStageSupplierPatch` / `applyStageSupplierPatchFor` and one-time dock selection `selectStageDockSupplier` / `selectStageDockSupplierFor` (patch EIP-712 domain version `1`); the patch payload is supplierId/previousSupplierId/patchNonce (`previousSupplierId == 0` assign, non-zero handoff, no mode/authorization fields), with candidate membership proved by a kind=1 leaf under `supplierBindingsRoot`. |
| DockRegistry ABI | `0.1` | Static Dock registry: `registerDock`/`DockRegistered`; atom/output capability proofs are verified by plan metadata. |
| Plan metadata module ABI | `0.1` | Plan metadata frozen ABI: capability vocabulary and membership checks for signal capability and stage selector binding under `capabilitiesRoot`; `fileWriters` is not here, see PlanCommit `fileWritersHash`. |
| File resource module ABI | `0.1` | Stage file-map module: `StageFile{string key; bytes payload}`, `applyStageFiles` overwrites the same key; no `add/replace/remove`, no `baseHash`/`patchHash`, no handle/version; only `StageFileWritten`; write authority follows the target/writer stage's assigned supplier. |
| StateMachine lens ABI | `0.1` | Dock/order/hook read views, including effective supplier assignment and stage dock selection. |
| Deployment manifest | `uvp-eth.addresses.v1` | Deployment address manifest schema. |

Semantic boundary: the dependency index is many-to-many with no stage owner, so one fact can be observed by any number of hooks in any stage; evaluation does not depend on stage materialization, and Ready is announced when the stage materializes (materialization flush re-announces Ready-but-unannounced hooks in this stage's hook registration order); `EMIT_READY` is a materialization capability bit, not an evaluation gate, and triggers are evaluated only in the birth transaction.

`uvp-core analyze`'s wire schema is `uvp.zhixuAnalysis.v1`: each stage emits canonical `triggers` (`<stage>.<signal>`) and hook parse results, consumed by the compiler/hook-core; it does not enter on-chain registration parameters. The chain-track TS compiler only consumes that result for lowering/decoration/shell assembly and does not re-validate the definition.

`supplierId: bytes32` is the on-chain supplier identity primary key (the DSL `supplierID` string is an alias for the same UUID; the compiler decodes the standard 36-character lower-case UUID into the low 16 bytes of bytes32 and never hashes it). The only execution-identity source is the supplier namespace of `UVPIdentityRegistry`, which stores only the permanent SID↔account binding plus `pending/active/suspended/revoked` status, with no tier/validity/descriptor fields; the platform store is the sole registrar. The plan runtime hash domain is `uvp.plan.runtime.v8`, whose preimage is the four-tuple `(hooksHash, capabilitiesRoot, supplierBindingsRoot, fileWritersHash)` (a frozen cross-track commitment domain, not a release version); `planId` derives from `publisher + runtimePlanHash`. Order identity is always the composite key `(planId, orderId)`. The subject/account namespace of `UVPIdentityRegistry` is trust attestation only and authorizes no execution; `zhixu-registry` is an off-chain data registration layer and also does not participate in on-chain execution authorization. Supplier capability, reputation, names, tags, contact details, search recommendations, and workflow state are stored independently by the Store. Chain Services projections are rebuildable. For the full boundary see [Protocol Boundaries](../concepts/protocol-boundaries.md).
