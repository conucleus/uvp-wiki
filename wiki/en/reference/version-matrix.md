---
title: Version and Semantic Matrix
type: reference
audience: 工程贡献者
status: verified
---

# Version and Semantic Matrix

Every version sits on one fixed baseline: contract ABI fixtures `0.1`, EIP-712 domain versions `1`, artifact schemas `v1`. The authoritative per-key values live in `uvp-deploy/deploy/compatibility/uvp-stack.v1.json`.

| Boundary | Current version | Meaning |
| --- | --- | --- |
| Rust core package | `0.1.0` | Normative Hook evaluation core. |
| Zhixu analysis | `uvp.zhixuAnalysis.v1` | uvp-core analyze wire schema. |
| Protocol semantics | `uvp.semantic.v1` | Consistency boundary for Hook parsing, evaluation, and replay. |
| Cloud AST | `uvp.cloudAst.v1` | Cloud compiler AST wire schema. |
| HookPlan artifact | `uvp.hookPlan.v1` | Compiler internal/public artifact; birth lines derive from `sendSignals[].trigger`, and supplier bindings (default/candidate) plus the dynamic flag are carried in the artifact. |
| OnchainHookPlan | `uvp.onchainHookPlan.v1` | EVM compiled-artifact schema; `orderTriggerKind` is the closed set `none`/`trigger`, `triggers[]` enumerates birth lines, and `supplierBindings`/`supplierBindingsRoot` commit the plan's supplier bindings. |
| Cloud artifact | `uvp.cloudArtifact.v1` | Cloud compiler artifact schema. |
| Dock artifact | `uvp.dock.v1` | Static Dock document/compiled-artifact schema (produced by uvp-core analyzeDock, including the A validWhen AST/dependencies/atoms). |
| Dock binding read DTO | `uvp.dockBinding.v1` | Chain-read binding/per-output window projection wire schema. |
| StateMachine ABI | `0.1` | Signed Plan commit/finalize (five-field PlanCommit: publisher, hooksHash, capabilitiesRoot, supplierBindingsRoot, deadline, plus `StageSupplierBinding[]`), supplier-registry module slot with strong registration checks, dynamic stages (hook flag 32) with per-order supplierId assignment, effective-executor submit authority, and the `submitSignal` relayer entry (EIP-712 ECDSA/EIP-1271; msg.sender is only the relayer). Event surface: `PlanCommitted` carries `supplierBindingsRoot`, `SignalSubmitted` carries `relayer`, and `StageSupplierAssigned`/`StageSupplierPatchApplied` carry supplierId/patchNonce. EIP-712 domain version `1`. |
| Plan registration library ABI | `0.1` | The `UVPPlanRegistration` linked library hosting the externally segmented `commitPlan`/`finalizePlan`/`submitSignal` bodies (its artifact carries the state-machine event surface); commit validates `StageSupplierBinding[]` against `supplierBindingsRoot`. |
| IdentityRegistry ABI | `0.1` | Thin offline subject-to-wallet identity binding; it grants no execution authority and the state machine never reads it. |
| DeploymentRegistry ABI | `0.1` | Deployment cutover and canary records. |
| Derived signal module ABI | `0.1` | Frozen ABI of the derived-signal module (EIP-712 domain version `1`); submit authority is the from-stage effective executor, with no target-order explicit-authorization fallback. |
| Product submit domain | `1` | Product signal-submit EIP-712 domain. |
| Stage patch module ABI | `0.1` | Frozen ABI of the module hosting the executor patch and dock executor selection (patch EIP-712 domain version `1`); the patch payload is supplierId/previousSupplierId/patchNonce (`previousSupplierId == 0` is assign, non-zero is handoff; no mode/authorization fields), and dock selection carries supplierId. |
| DockRegistry ABI | `0.1` | Static Dock registry: `registerDock`/`DockRegistered`, with atom/output capability proofs verified by plan metadata. |
| Plan metadata module ABI | `0.1` | Frozen ABI of the plan-metadata module: capability vocabulary plus membership checks for signal capability, stage selector binding, and file-writer capability leaves (`UVP_FILE_WRITER_V1`), with leaves recomputed from field values. |
| File resource module ABI | `0.1` | Stage file-map module: `key -> (contentHash, handle)`, strict `add/replace/remove` with mandatory `baseHash`, no nonce, first-win `patchHash` absorption; write authority is the effective executor. |
| StateMachine lens ABI | `0.1` | Read-only dock/order/hook views, including effective-executor and active-stage-executor-patch reads. |
| Deployment manifest | `uvp-eth.addresses.v1` | Deployment address-manifest schema. |

Semantic boundary: the dependency index is many-to-many with no owning stage, so one fact may be observed by any number of hooks in any stage; evaluation does not depend on stage materialization, and Ready is announced at stage materialization (the materialization flush replays ready-but-unannounced hooks in the stage's hook registration order); `EMIT_READY` is a materialization capability bit, not an evaluation gate, and trigger hooks are evaluated only in the birth transaction.

The uvp-core analyze wire schema is `uvp.zhixuAnalysis.v1`: each stage emits normalized `triggers` (`<stage>.<signal>`) plus parsed hooks, consumed by the compiler and hook-core; it does not enter on-chain registration parameters. The chain-track TS compiler only consumes that result for lowering/decoration/shell assembly and does not re-validate the definition.

`supplierId: bytes32` is the on-chain supplier identity primary key (the `supplierID` string is only an alias; the compiler derives the same `supplierId` through a fixed domain). `UVPSupplierRegistry` is the only on-chain execution identity: it stores only the thin `supplierId ↔ account` binding plus `pending/active/suspended/revoked` status, with no tier/validity/descriptor fields, and the platform store is the sole registrar. `UVPSupplierRegistryDebug` is a QA-only stand-in that production deployment must never wire. Plan runtime identity is derived from `publisher + runtimePlanHash`; `runtimePlanHash` covers hooks, capabilitiesRoot, and supplierBindingsRoot (domain `uvp.plan.runtime.v7`, a frozen cross-track commitment domain rather than a release version). Order identity is always the composite key `(planId, orderId)`. `UVPIdentityRegistry` only records subject/account bindings and authorizes no execution; `zhixu-registry` is an off-chain data registration layer and no chain execution authorization either. Supplier capability, reputation, names, tags, contact details, search recommendations, and workflow state are stored independently by the Store. Chain projections in Chain Services are rebuildable. For the full boundary see [Protocol Boundaries](../concepts/protocol-boundaries.md).
