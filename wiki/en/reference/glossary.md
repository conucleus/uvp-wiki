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
| [Order](../concepts/core/order.md) / 订单 | One concrete run of some Plan. | `UVPStateMachine.Order`, `triggerOrderFromOutsideFor()` / `triggerOrderFromSignalFor()`, `OrderRegistered`, `OrderTriggered`. |
| [Nucleus](../concepts/core/nucleation.md) | The organizational core that initiates, designs, and maintains a kind of Zhixu. It lets a class of coordination rules take shape, gain boundaries, and stay maintained; it can be a team, organization, project owner, or workflow owner. | `spec.nucleation.id`, Store Nucleus workbench. |
| nucleation | The nucleation process, context, or field name--not a subject name. Existing DSL/API keeps this spelling to avoid public-interface drift. | `spec.nucleation.id`, `nucleationId`. |
| Stage | A step or execution segment inside a task pattern. | `taskPatterns[].stages[]`, `stageIdentifier`, `stageId`. |
| Task Pattern | A reusable grouping of stages inside a Zhixu. Many examples use `master` for the main task pattern. | `taskPatterns[].name`. |
| [Supplier](../concepts/core/supplier.md) | A real-world or digital subject organized by the Store; capability profiles are off-chain Store judgments. | Store metadata, Identity Binding. |
| [Executor](../concepts/core/executor.md) | The Supplier or submitter selected or elected to handle the current Order stage or submit that stage's signal. | order authorization, stage executor overlay, EIP-712 submitter. |
| [Source](../concepts/core/source.md) | The causal namespace a signal belongs to, answering which business-progression line an action enters. | `source`, `sourceId`, `signalKey`. |
| [Signal](../concepts/core/signal.md) | The smallest business fact the state machine accepts for an Order. | `submitSignal()`, `SignalSubmitted`, `SignalRecord`. |
| [Hook](../concepts/core/hook.md) | A state-machine condition; not an HTTP webhook, nor a callback. | `CompiledHook`, `HookStatusChanged`. |
| [Trigger](../concepts/core/trigger.md) | A hook mark that opens an executable task via `HookReady`. | stage `trigger`, `HookReady`. |
| [File Resource](../concepts/core/file-resources.md) | A handle for off-chain materials such as stage protocols, evidence templates, and resource manifests; not plaintext file storage. | `fileResources`, resource patch, metadata URI/hash. |
| OnchainHookPlan | The compact on-chain artifact for EVM registration and material review. | `OnchainHookPlanArtifact`, compact hooks, dependency indexes, selector bindings. |
| HookPlan IR | The compiler-internal intermediate shape; no longer a public Store/import/deploy flow. | Used internally by `compileZhixuOnchainHookPlan()`. |

## Actions and Events

| Term | Plain meaning | Code or on-chain counterpart |
| --- | --- | --- |
| [Identity Binding](../concepts/contracts-and-registries.md) | A revocable registration made by the Store Registry for the real-world-subject-to-wallet correspondence; it does not include Plan or capability material review. | `IdentityBindingRegistered`, `IdentityBindingRevoked`. |
| [Authorization](../concepts/trust/signal-authorization.md) | Permission for a wallet to submit a specific source/signal for a specific Order, or to perform a controlled stage patch. | `SignalSubmitterAuthorized`, stage patch authorization. |
| [Publisher](../concepts/lifecycle.md) | The registered account or mechanism allowed to register Plans. | plan publisher allowlist; `commitPlan()` commit + `finalizePlan()` finalization (only a finalized Plan can create an Order). |
| [Registrar](../concepts/lifecycle.md) | The account or mechanism that creates trigger orders: the order creator signs trigger typed data to create the Order (the current contracts have no registrar allowlist). | `triggerOrderFromOutsideFor()` / `triggerOrderFromSignalFor()`. |
| [Registry Boundary](../concepts/contracts-and-registries.md) | One `UVPIdentityRegistry` address is one identity-resolution domain. Initially Store operates one; multiple independent regulated entities may be configured in the future. StateMachine does not read it. | `registryAddress`, `bindingId`, `UVPIdentityRegistry.owner()`. |
| [HookReady](../concepts/state-machine/README.md) | The event emitted after a trigger hook becomes ready, meaning a Product task can open. | `HookReady(orderId, hookId, stageId, hookName)`. |
| [Stage Overlay](../concepts/state-machine/stage-overlay.md) | An order-level runtime overlay of executor or resources; it does not change the Plan. | executor/resource patch events. |
| [Stage Patch](../concepts/state-machine/stage-overlay.md) | A controlled order action that applies an executor or resource overlay; "patch" here is not a code patch. | `StageExecutorPatchApplied`, `StageResourcePatchApplied`. |
| Selector Binding | A Plan rule declaring which target stage a given stage may patch. | selector stage id, target stage id, binding key. |
| [Replay](../concepts/state-machine/replay.md) | Rebuilding or verifying order state from chain events. | statemachine reducer, chain-services projections. |

> TODO(confirm): The Registrar entry has been rewritten per the current contracts; please manually re-check the external communication wording.

## Evidence, Proof, and Product Terms

| Term | Plain meaning | Code or product counterpart |
| --- | --- | --- |
| [Evidence](../concepts/services/evidence-proof.md) | Off-chain business material or metadata supporting a signal. | Product evidence route, object handle, evidence metadata. |
| Payload Hash | Fingerprint of the submitted business payload or evidence bundle. | `payloadHash` in signal submission. |
| Metadata URI | Reference pointing at off-chain metadata, a manifest, or a storage reference. | `metadataURI`. |
| [Proof](../concepts/services/evidence-proof.md) | A traceable record of how a claim maps to chain events, signatures, or hashes. Product proof rows should include tx, block, log, contract, chain id, event, and payload context. | Product proof row, event provenance. |
| [Projection](../concepts/services/indexer-projections.md) | A read model rebuilt from chain events for display. | chain-services indexer, Product DTO. |
| [Product DTO](../concepts/product/dto.md) | Data format translating on-chain facts into orders, tasks, proof, and trust views ordinary users can read. | `ZhixuDetailDTO`, `ProductOrderDTO`, `ProductTaskDTO`. |
| [Product BFF](../concepts/product-bff.md) | Product Backend-for-Frontend, the product workflow service handling drafts, invites, participant confirmation, authorization building, and order registration. | `uvp-chain-services/service/src/product/bff/`. |
| [Signal Container](../concepts/product/signal-container.md) | The Product-layer wrapper around task, evidence, typed data, signature, submission, and proof. | Product API prepare/submit/proof flow. |
| [Store](../concepts/store/README.md) | The product workbench serving the Nucleus, Suppliers, the Identity Registry, operators, and proof views. | `zhixu-store/app`, Store Console API. |
| [Chain Services](../concepts/services/chain-services.md) | The rebuildable service layer responsible for indexing, projection, proof, relaying, the Product API, and the Store API. | `@uvp-eth/chain-services`. |

## Advanced and Environment Terms

| Term | Plain meaning | Code or operational counterpart |
| --- | --- | --- |
| [Docked Zhixu](../concepts/state-machine/docking.md) | One Zhixu hands a stage to another independently runnable Zhixu. | `supplierType=zhixu`, `signalMap`, docking events. |
| `signalMap` | Maps the linked Zhixu's `str/cmp/err` outputs back into the local stage interface. | `zhixuExecutorConfig.signalMap`. |
| [Periphery Adapter](../concepts/periphery-and-deploy.md) | Funding, guarantee, payment, agent, or business-system adapter layers around the core state machine. | `uvp-periphery/`. |
| [Relayer](../concepts/services/relayer.md) | A service or wallet broadcasting signed transactions and possibly paying gas. It is not the business signer. | chain-services relayer, `submitSignalFor()`. |
| [EIP-712](../concepts/trust/eip712-relayer.md) | The format wallets use to sign structured business actions. | typed data builders, `UVPStateMachineSignal`. |
| Anvil | The local EVM chain used for development and protocol loops. | local Anvil scripts. |
| Base Sepolia | The public EVM testnet target used for staging/rehearsal claims. | chain id `84532`. |

## Key Concept Pairs

| Pair | Correct reading |
| --- | --- |
| Zhixu / Order | Zhixu is the static design; Order is one run of that design. |
| Plan / Order | Plan is the version that passed material review; Order is a concrete run under that Plan. |
| Nucleus / Store operator | The Nucleus owns internal Zhixu design; the Store operator manages platform workflow. |
| Store or external institution / Authorization | publication is material review; authorization is permission to submit order actions. |
| Supplier / Executor | Supplier is the capability and trust identity; Executor is the runtime submitter or handler. |
| Evidence / Proof | Evidence is off-chain material or metadata; proof is the traceable record from hash, signature, and event to Product display. |
| File Resource / Business File | File Resource is a handle or requirement; private business files stay off chain. |
| Relayer / Submitter | The relayer broadcasts transactions; the submitter signs business claims. |
| Store metadata / On-chain facts | Store metadata organizes materials and workflow; on-chain facts come from registry and state-machine events. |
