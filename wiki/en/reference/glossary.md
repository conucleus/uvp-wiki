---
title: Glossary
type: reference
audience: 全部读者
status: verified
---

# Glossary

This page explains project terms in plain language first, then gives the code and on-chain names. `Zhixu` is the pinyin of 秩序 ("order/orderliness"); code, ABI, DTO, event, and type names keep their English forms.

## Core Objects

| Term | Plain meaning | Code or on-chain counterpart |
| --- | --- | --- |
| UVP / Universal Value Protocol | A coordination protocol and product language for recording authorized business signals and the state consequences those signals bring. In Chinese, UVP is 通用价值协议. | `uvp-eth` is the EVM/Web3 implementation track. |
| [Zhixu](../concepts/core/zhixu.md) | A reusable coordination rulebook describing how a class of Orders should run. | `ZhixuDefinition`, `kind: "Zhixu"`, compiler input. |
| [Plan](../concepts/core/plan.md) / Zhixu version | A deterministic on-chain version compiled from one Zhixu. | `OnchainHookPlanArtifact`, two-step registration/finalization via `commitPlan()` + `finalizePlan()`, `PlanRegistered`. |
| [Order](../concepts/core/order.md) / 订单 | One concrete run of some Plan. | `UVPStateMachine.Order`, `submitSignal(orderId=0)` (the only birth entry), `OrderRegistered`, `OrderTriggered`. |
| [Dock](../concepts/state-machine/docking.md) | A static A→B time-window subscription declared by the B side: it declares which output signal of which B stage emits when which fact condition holds on which A-side source. A Dock never creates orders. | `kind: "Dock"`, `spec.from` / `spec.to` / `spec.signalMap`, `uvp.dock.v1`, `UVPDockRegistry.registerDock`. |
| dkid | The Dock's content-derived identity: the same content yields the same identity across environments; on chain it is used as a right-zero-padded 32-byte word. | `zd-<32hex>` (`dkid`), `dkid = bytes32(bytes16(docHash))`, `getDock(dkid)`. |
| [Nucleus](../concepts/core/nucleation.md) | The organizational core that initiates, designs, and maintains a kind of Zhixu. It lets a class of coordination rules take shape, gain boundaries, and stay maintained; it can be a team, organization, project owner, or workflow owner. | `spec.nucleation.id`, Store Nucleus workbench. |
| nucleation | The nucleation process, context, or field name--not a subject name. Existing DSL/API keeps this spelling to avoid public-interface drift. | `spec.nucleation.id`, `nucleationId`. |
| Stage | A step or execution segment inside a Zhixu; stage names are globally unique within the Zhixu. | `spec.stages[]`, `stageIdentifier`, `stageId`. |
| [Supplier](../concepts/core/supplier.md) | A real-world or digital subject organized by the Store; capability profiles are off-chain Store judgments. | Store metadata, Identity Binding. |
| [Executor](../concepts/core/executor.md) | The role that handles the current Order stage or submits that stage's signal; not materialized on chain. | `stage -> supplierId`, `accountOf(supplierId)`, EIP-712 submitter. |
| Dock executor | The subject that handles execution of a dock-stage order on the B side; the order selects it once through a stage patch on the attached stage, after which it is fixed. | `HOOK_FLAG_DOCK_EXECUTOR`, `selectStageDockSupplier` / `selectStageDockSupplierFor`, `StageDockSupplierSelected`. |
| [Source](../concepts/core/source.md) | The causal namespace a signal belongs to, answering which business-progression line an action enters. | `source`, `sourceId`, `signalKey`. |
| [Signal](../concepts/core/signal.md) | The smallest business fact the state machine accepts for an Order. | `submitSignal()`, `SignalSubmitted`, `SignalRecord`. |
| [Hook](../concepts/core/hook.md) | A state-machine condition; not an HTTP webhook, nor a callback. | `CompiledHook`, `HookStatusChanged`. |
| [Trigger](../concepts/core/trigger.md) | Order-entry semantics: a stage's birth signal synthesizes an order-trigger hook; `orderTriggerKind` is the closed set `none`/`trigger`, and `emitReady` independently controls whether an actionable `HookReady` is emitted. | `sendSignals[].trigger`, `orderTriggerKind`, `triggers[]`, `emitReady`, `HookReady`. |
| Trigger signal | A sendSignal in the stage's birth-signal set; submitting it with an empty `orderId` past admission creates the order and writes the first fact. | `trigger: true`, `SignalAdmissionRejected`, `NotTriggerSignal`. |
| [File Resource](../concepts/core/file-resources.md) | A declaration of off-chain materials such as stage protocols, evidence templates, and resource manifests; not plaintext file storage. | `fileResources`, `StageFile{key,payload}`, `StageFileWritten`. |
| OnchainHookPlan | The compact on-chain artifact for EVM registration and material review. | `OnchainHookPlanArtifact`, compact hooks, dependency indexes, selector bindings, derived `triggers[]`. |
| HookPlan IR | The compiler-internal intermediate shape; not a public Store/import/deploy flow. | Used internally by `compileZhixuOnchainHookPlan()`. |

## Actions and Events

| Term | Plain meaning | Code or on-chain counterpart |
| --- | --- | --- |
| [Identity Binding](../concepts/contracts-and-registries.md) | A revocable registration made by the Store Registry for the real-world-subject-to-wallet correspondence; it does not include Plan or capability material review. | `IdentityBindingRegistered`, `IdentityBindingRevoked`. |
| Execution Authority | Permission for a supplier account to submit a signal for a specific stage of an Order, or to perform a controlled stage supplier patch. | `stage -> supplierId`, `UVPIdentityRegistry.accountOf`, `StageSupplierPatchApplied`. |
| [Publisher](../concepts/lifecycle.md) | The account or mechanism that signs the Plan commit with its own key: the protocol has no publisher allowlist — publication is permissionless (who may publish externally is a Store/governance admission question). | `commitPlan()` commit + `finalizePlan()` finalization (only a finalized Plan can create an Order). |
| [Registrar](../concepts/lifecycle.md) | The account or mechanism that creates trigger orders: the birth stage's current effective assigned supplier account signs and submits with `UVPStateMachineSignalSubmission`; there is no registrar allowlist, and deduplication is by `(submitter, idempotencyKey)`. | `submitSignal(orderId=0)` (`UVPStateMachine`), `DuplicateTriggerKey`. |
| [Registry Boundary](../concepts/contracts-and-registries.md) | One `UVPIdentityRegistry` address is one identity-resolution domain. Initially Store operates one; multiple independent regulated entities may be configured in the future. StateMachine does not read it. | `registryAddress`, `bindingId`, `UVPIdentityRegistry.owner()`. |
| [HookReady](../concepts/state-machine/README.md) | The event emitted after a receive hook with `emitReady=true` becomes ready, meaning a Product task can open. | `HookReady(planId, orderId, hookId, stageId, hookName)`. |
| [Stage Overlay](../concepts/state-machine/stage-overlay.md) | An order-level rewrite of the stage supplier or the stage file map; it does not change the Plan. | stage supplier patch / stage file write events. |
| [Stage Patch](../concepts/state-machine/stage-overlay.md) | A controlled order action that rewrites the executor or the stage file map; "patch" here is not a code patch. | `StageSupplierPatchApplied`, `StageFileWritten`, `StageFileWritten`. |
| [Selector Binding](../concepts/state-machine/stage-overlay.md) | A Plan rule declaring which target stage a given stage may patch. | selector stage id, target stage id, binding key. |
| Dock executor selection | A one-time order-level decision that selects the dock executor on the attached stage and fixes it; re-selection is rejected loudly. | `selectStageDockSupplier` / `selectStageDockSupplierFor`, `StageDockSupplierSelected`, `StageDockSupplierAlreadySelected`. |
| binding / `dock_link` | A binding is the runtime A→B relation determined by the attached stage's `dock_link` file entry; the entry's value is the canonical A order id, so writing establishes and rewriting switches the binding. | `dock_link` (key = `keccak("dock_link")`), `bindingId` (seven 32-byte words). |
| pokeDockBinding | The permissionless evaluation entry: authenticates the `dock_link` payload, evaluates the A window at `block.timestamp`, re-checks the B window, and emits B signals per output first-win. | `pokeDockBinding`, `DockBindingPoked`, `DockOutputSubmitted`, `DockBindingContentHashMismatch`. |
| Window | The A window is the A-side `validWhen` time-window program (`~` closes on fact arrival, `+T` delays the anchor); the B window is the B-side `sendSignals.validWhen` emission admission; only their intersection emits. Historical window times are not on chain. | `uvp.dock.v1` output window, `dockOutputWindow`, `uvp.dockBinding.v1`, `dueInSeconds`. |
| [Replay](../concepts/state-machine/replay.md) | Rebuilding or verifying order state from chain events. | statemachine reducer, chain-services projections. |

## Evidence, Proof, and Product Terms

| Term | Plain meaning | Code or product counterpart |
| --- | --- | --- |
| [Evidence](../concepts/services/evidence-proof.md) | Off-chain business material or metadata supporting a signal. | Product evidence route, object handle, evidence metadata. |
| Payload Hash | Fingerprint of the submitted business payload or evidence bundle. | `payloadHash` in signal submission. |
| Metadata URI | Reference pointing at off-chain metadata, a manifest, or a storage reference. | `metadataURI`. |
| [Proof](../concepts/services/evidence-proof.md) | A traceable record of how a claim maps to chain events, signatures, or hashes. Product proof rows should include tx, block, log, contract, chain id, event, and payload context. | Product proof row, event provenance. |
| [Projection](../concepts/services/indexer-projections.md) | A read model rebuilt from chain events for display. | chain-services indexer, Product DTO. |
| [Product DTO](../concepts/product/dto.md) | Data format translating on-chain facts into orders, tasks, proof, and trust views ordinary users can read. | `ZhixuDetailDTO`, `ProductOrderDTO`, `ProductTaskDTO`. |
| [Product BFF](../concepts/product-bff.md) | Product Backend-for-Frontend, the product workflow service handling drafts, invites, participant confirmation, authorization building, and order registration. | used-car application backend. |
| [Signal Container](../concepts/product/signal-container.md) | The Product-layer wrapper around task, evidence, typed data, signature, submission, and proof. | Product API prepare/submit/proof flow. |
| [Store](../concepts/store/README.md) | The product workbench serving the Nucleus, Suppliers, the Identity Registry, operators, and proof views. | used-car application Store surfaces, the `zhixu-store/registry` data-layer library. |
| [Chain Services](../concepts/services/chain-services.md) | The rebuildable service layer responsible for indexing, projection, proof, chain-read routes, and operations routes. | `@uvp-eth/chain-services`. |

## Advanced and Environment Terms

| Term | Plain meaning | Code or operational counterpart |
| --- | --- | --- |
| `signalMap` | The emission-condition declaration in a Dock document: the key is a B-side output signal name and the value is an A-side `validWhen` expression. | `Dock.spec.signalMap`, `uvp.dock.v1` output. |
| [Relayer](../concepts/services/relayer.md) | A participant role or wallet broadcasting signed transactions and possibly paying gas. It is not the business signer. | application-backend submission orchestration, `submitSignal()` (a contract executor may be paid for by a relayer). |
| [EIP-712](../concepts/trust/eip712-relayer.md) | The format wallets use to sign structured business actions. | typed data builders, `UVPStateMachineSignalSubmission`, `UVPStagePatchModuleStageSupplierPatch`. |
| Anvil | The local EVM chain used for development and protocol loops. | local Anvil scripts. |
| Base Sepolia | The public EVM testnet target used for staging/rehearsal claims. | chain id `84532`. |

## Key Concept Pairs

| Pair | Correct reading |
| --- | --- |
| Zhixu / Order | Zhixu is the static design; Order is one run of that design. |
| Plan / Order | Plan is the version that passed material review; Order is a concrete run under that Plan. |
| Dock / Order | A Dock is a static A→B subscription declaration; the two Orders are created and executed independently, and the Dock only maps A facts into emission conditions for B output signals. |
| Binding / `dock_link` | The binding is the runtime relation identity; the `dock_link` file entry is its on-chain basis, and its value is the A order id. |
| Nucleus / Store operator | The Nucleus owns internal Zhixu design; the Store operator manages platform workflow. |
| Store or external institution / Authorization | publication is material review; authorization is permission to submit order actions. |
| Supplier / Executor | Supplier is the capability and trust identity; Executor is the runtime submitter or handler. |
| Evidence / Proof | Evidence is off-chain material or metadata; proof is the traceable record from hash, signature, and event to Product display. |
| File Resource / Business File | File Resource is a handle or requirement; private business files stay off chain. |
| Relayer / Submitter | The relayer broadcasts transactions; the submitter signs business claims. |
| Store metadata / On-chain facts | Store metadata organizes materials and workflow; on-chain facts come from registry and state-machine events. |
