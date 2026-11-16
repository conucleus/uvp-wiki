---
title: Version and Semantic Matrix
type: reference
audience: 工程贡献者
status: verified
---

# Version and Semantic Matrix

| Boundary | Current version | Meaning |
| --- | --- | --- |
| Rust core package | `0.1.0` | Normative Hook evaluation core. |
| Zhixu analysis | `uvp.zhixuAnalysis.v4` | uvp-core analyze wire schema. |
| Protocol semantics | `uvp.semantic.v1` | Consistency boundary for Hook parsing, evaluation, and replay. |
| Cloud AST | `uvp.cloudAst.v4` | Cloud compiler AST wire schema. |
| HookPlan artifact | `uvp.hookPlan.v8` | Compiler internal/public artifact; birth lines derive from `sendSignals[].trigger`, and executor bindings (default/candidate) plus the dynamic flag are carried in the artifact. |
| OnchainHookPlan | `uvp.onchainHookPlan.v8` | EVM compiled-artifact schema; `orderTriggerKind` is the closed set `none`/`trigger`, `triggers[]` enumerates birth lines, and `executorBindings`/`executorBindingsRoot` commit the plan's executor bindings. |
| Cloud artifact | `uvp.cloudArtifact.v8` | Cloud compiler artifact schema. |
| Dock artifact | `uvp.dock.v1` | Static Dock document/compiled-artifact schema (produced by uvp-core analyzeDock, including the A validWhen AST/dependencies/atoms). |
| Dock binding read DTO | `uvp.dockBinding.v1` | Chain-read binding/per-output window projection wire schema. |
| StateMachine ABI | `0.21` | Signed Plan commit/finalize (six-field PlanCommit: publisher, hooksHash, capabilitiesRoot, executorBindingsRoot, birthAuthorizer, deadline, plus `ExecutorBinding[]`), supplier-registry module slot with strong registration checks, dynamic stages (hook flag 32) with per-order supplierId assignment, effective-executor submit authority, the `submitSignalFor` relayer entry (EIP-712 ECDSA/EIP-1271; msg.sender is only the relayer), and the governance-fork `forkOrder` birth channel; `SignalAuthorization` and order-level authorization arrays are removed. Event surface: `PlanCommitted` carries `executorBindingsRoot`, `SignalSubmitted` carries `relayer`, and `StageExecutorActivated`/`StageExecutorPatchApplied` carry supplierId/patchNonce. EIP-712 domain version `0.19`. |
| Plan registration library ABI | `0.7` | The `UVPPlanRegistration` linked library hosting the externally segmented `commitPlan`/`finalizePlan`/`forkOrder` bodies (its artifact carries the state-machine event surface); commit validates `ExecutorBinding[]` against `executorBindingsRoot`. |
| IdentityRegistry ABI | `0.1` | Thin offline subject-to-wallet identity binding. |
| DeploymentRegistry ABI | `0.2` | Deployment cutover and canary records. |
| Derived signal module ABI | `0.7` | Frozen ABI of the derived-signal module (EIP-712 domain version `0.7`); submit authority is the from-stage effective executor, with no target-order explicit-authorization fallback. |
| Product submit domain | `0.19` | Product signal-submit EIP-712 domain. |
| Order-link module ABI | `0.4` | Frozen ABI of the linked-order module (trigger EIP-712 domain version `0.9`); the trigger request drops the authorizations fields. |
| Stage patch module ABI | `0.10` | Frozen ABI of the module hosting the executor patch and dock executor selection (patch EIP-712 domain version `0.5`); the patch payload is supplierId/previousSupplierId/patchNonce (`previousSupplierId == 0` is assign, non-zero is handoff; no mode/authorization fields), and dock selection carries supplierId. |
| DockRegistry ABI | `0.1` | Static Dock registry: `registerDock`/`DockRegistered`, with atom/output capability proofs verified by plan metadata. |
| Plan metadata module ABI | `0.8` | Frozen ABI of the plan-metadata module: capability vocabulary plus membership checks for signal capability, stage selector binding, and file-writer capability leaves (`UVP_FILE_WRITER_V1`), with leaves recomputed from field values. |
| File resource module ABI | `0.2` | Stage file-map module: `key -> (contentHash, handle)`, strict `add/replace/remove` with mandatory `baseHash`, no nonce, first-win `patchHash` absorption; write authority is the effective executor. |
| StateMachine lens ABI | `0.7` | Read-only dock/order/hook views, including effective-executor and active-stage-executor-patch reads. |
| Deployment manifest | `uvp-eth.addresses.v1` | Deployment address-manifest schema. |

Semantic changes in this batch: the single-observation and cross-stage-observation rejection is removed — the dependency index is many-to-many with no owning stage, so one fact may be observed by any number of hooks in any stage; evaluation no longer depends on stage materialization, and Ready is announced at stage materialization (the materialization flush replays ready-but-unannounced hooks in the stage's hook registration order); `EMIT_READY` is a materialization capability bit, not an evaluation gate, and trigger hooks are evaluated only in the birth transaction.

The uvp-core analyze wire schema is `uvp.zhixuAnalysis.v4`: each stage emits normalized `triggers` (`<stage>.<signal>`) plus parsed hooks, consumed by the compiler and hook-core; it does not enter on-chain registration parameters.

`supplierId: bytes32` is the on-chain supplier identity primary key (the `supplierID` string is only an alias; the compiler derives the same `supplierId` through a fixed domain). `UVPSupplierRegistry` stores only the thin `supplierId ↔ executor` binding — no tier/validity/descriptor fields — and the platform store is the sole registrar. `UVPSupplierRegistryDebug` is a QA-only stand-in that production deployment must never wire. Plan runtime identity is derived from `publisher + runtimePlanHash`; `runtimePlanHash` covers hooks, capabilitiesRoot, and executorBindingsRoot. Order identity is always the composite key `(planId, orderId)`. The Identity Registry only records subject/account bindings. Supplier capability, reputation, names, tags, contact details, search recommendations, and workflow state are stored independently by the Store. Chain projections in Chain Services are rebuildable. For the full boundary see [Protocol Boundaries](../concepts/protocol-boundaries.md).
