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
| HookPlan artifact | `uvp.hookPlan.v7` | Compiler internal/public artifact, including derived stage `trigger` lines. |
| OnchainHookPlan | `uvp.onchainHookPlan.v7` | EVM compiled-artifact schema; `orderTriggerKind` is trigger/none and the derived `triggers[]` enumerates birth lines. |
| Cloud artifact | `uvp.cloudArtifact.v8` | Cloud compiler artifact schema. |
| Dock artifact | `uvp.dock.v1` | Static Dock document/compiled-artifact schema (produced by uvp-core analyzeDock, including the A validWhen AST/dependencies/atoms). |
| Dock binding read DTO | `uvp.dockBinding.v1` | Chain-read binding/per-output window projection wire schema. |
| StateMachine ABI | `0.19` | Signed Plan commit/finalize (eight-field PlanCommit including executorCandidatesRoot and birthAuthorizer), composite `(planId, orderId)` orders, permissionless relayer, outside birth constrained by both the plan-committed birthAuthorizer (`UnauthorizedBirthSubmitter`) and the trigger signal's empty-order-context admission (`SignalAdmissionRejected`), and the governance-fork `forkOrder` birth channel. B-03 self-contained events batch: `PlanCommitted` gains a trailing `birthAuthorizer`, `SignalSubmitted` a trailing `factStageId`, and `OrderForked` trailing `forkPayloadHash` + `replayedFactKeys` (fork replayed vs new facts are distinguishable). File patches enter through `submitSignalFor` (trailing `bytes32 filesDigest` and `FilePatch`; a pure file patch uses `signalId == 0`). The EIP-712 domain version is `0.17` (`UVPStateMachineSignal` gains a trailing `bytes32 filesDigest`). |
| Plan registration library ABI | `0.6` | The `UVPPlanRegistration` linked library hosting the externally segmented `commitPlan`/`finalizePlan`/`forkOrder` bodies (its artifact carries the state-machine event surface extended in the same B-03 batch). |
| IdentityRegistry ABI | `0.1` | Thin offline subject-to-wallet identity binding. |
| DeploymentRegistry ABI | `0.2` | Deployment cutover and canary records. |
| Derived signal module ABI | `0.5` | Frozen ABI of the derived-signal module (EIP-712 domain version `0.6` unchanged); B-03: `DerivedSignalSubmitted` gains a trailing `relation`. |
| Product submit domain | `0.17` | Product signal-submit EIP-712 domain. |
| Order-link module ABI | `0.3` | Frozen ABI of the linked-order module (trigger EIP-712 domain version `0.8`). |
| Stage patch module ABI | `0.9` | Frozen ABI of the module hosting the executor patch (the resource half is removed; dock executor patch plus poke; patch EIP-712 domain version `0.4`; the executor patch mode vocabulary is the closed set assign/handoff, and the digest includes authorizationsHash). |
| DockRegistry ABI | `0.1` | Static Dock registry: `registerDock`/`DockRegistered`, with atom/output capability proofs verified by plan metadata. |
| Plan metadata module ABI | `0.8` | Plan metadata / dock interface port validation (with the interface-name dimension), plus file-writer capability leaf (`UVP_FILE_WRITER_V1`) membership checks. |
| File resource module ABI | `0.1` | Stage file-map module: `key -> (contentHash, handle)`, strict `add/replace/remove` with mandatory `baseHash`, no nonce, first-win `patchHash` absorption. |
| StateMachine lens ABI | `0.6` | Read-only dock/order/hook views. |
| Deployment manifest | `uvp-eth.addresses.v1` | Deployment address-manifest schema. |

The uvp-core analyze wire schema is `uvp.zhixuAnalysis.v4`: each stage emits normalized `triggers` (`<stage>.<signal>`) plus parsed hooks, consumed by the compiler and hook-core; it does not enter on-chain registration parameters.

Plan runtime identity is derived from `publisher + runtimePlanHash`; `runtimePlanHash` covers hooks, capabilitiesRoot, and executorCandidatesRoot. Order identity is always the composite key `(planId, orderId)`, so a bare `orderId` is not a global primary key. The Identity Registry only records subject/account bindings. Supplier capability, reputation, names, tags, contact details, search recommendations, and workflow state are stored independently by the Store. Chain projections in Chain Services are rebuildable. For the full boundary see [Protocol Boundaries](../concepts/protocol-boundaries.md).
