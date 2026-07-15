# Glossary

This page explains project terms in plain language first, then points to code or on-chain counterparts. `Zhixu` is the transliteration of the underlying Chinese coordination term; code, ABI, DTO, events, and type names keep their English forms.

## Core Objects

| Term | Plain meaning | Code or on-chain counterpart |
| --- | --- | --- |
| UVP / Universal Value Protocol | A coordination protocol and product vocabulary for recording authorized business signals and their consequences. In Chinese, UVP is 通用价值协议. | `uvp-eth` is the EVM/Web3 implementation track. |
| Zhixu | A reusable coordination rulebook that describes how a class of Orders should run. | `ZhixuDefinition`, `kind: "Zhixu"`, compiler input. |
| Plan / Zhixu version | A deterministic on-chain version compiled from a Zhixu. | `OnchainHookPlanArtifact`, `registerPlan()`, `PlanRegistered`. |
| Order | One runtime instance of a Plan. | `UVPStateMachine.Order`, `triggerOrderFromOutsideFor()` / `triggerOrderFromSignalFor()`, `OrderRegistered`, `OrderTriggered`. |
| Nucleus | The organizing core that originates, designs, and maintains a kind of Zhixu. It lets a class of coordination rules take shape, gain a boundary, and remain maintainable over time. | `spec.nucleation.id`, Store Nucleus workbench. |
| nucleation | Process, context, or field name, not the subject name. Existing DSL/API names keep this spelling to avoid public-interface drift. | `spec.nucleation.id`, `nucleationId`. |
| Stage | A step or execution segment inside a task pattern. | `taskPatterns[].stages[]`, `stageIdentifier`, `stageId`. |
| Task Pattern | A reusable grouping of stages inside a Zhixu. Many examples use `master` as the main task pattern. | `taskPatterns[].name`. |
| Supplier | A real-world or digital subject organized by Store; capability remains off-chain Store data. | Store metadata and Identity Binding. |
| Executor | The Supplier or submitter selected or elected to handle the current Order stage or submit its signal. | order authorization, stage executor overlay, EIP-712 submitter. |
| Source | The causal namespace a signal belongs to. | `source`, `sourceId`, `signalKey`. |
| Signal | The smallest business fact accepted by the state machine for an Order. | `submitSignal()`, `SignalSubmitted`, `SignalRecord`. |
| Hook | A state-machine condition; not an HTTP webhook or callback. | `CompiledHook`, `HookStatusChanged`. |
| Trigger | A hook mark that opens an executable task by emitting `HookReady`. | stage `trigger`, `HookReady`. |
| File Resource | A handle for off-chain materials such as stage protocols, evidence templates, and resource manifests. It is not plaintext file storage. | `fileResources`, resource patch, metadata URI/hash. |
| OnchainHookPlan | Compact EVM-facing artifact used for registration and publication. | `OnchainHookPlanArtifact`, compact hooks, dependency indexes, selector bindings. |
| HookPlan IR | Compiler-internal intermediate shape; no longer a public Store/import/deploy flow. | Used inside `compileZhixuOnchainHookPlan()`. |

## Actions and Events

| Term | Plain meaning | Code or on-chain counterpart |
| --- | --- | --- |
| Identity Binding | A revocable Store Registry statement mapping a real-world subject to an account; it is not Plan or capability endorsement. | `IdentityBindingRegistered`, `IdentityBindingRevoked`. |
| Authorization | Permission for a wallet to submit a specific source/signal for a specific Order, or to perform a controlled stage patch. | `SignalSubmitterAuthorized`, stage patch authorization. |
| Publisher | The allowed registration account or mechanism that registers Plans. | plan publisher allowlist, `registerPlan()`. |
| Registrar | The allowed account or mechanism that broadcasts trigger-order creation and writes initial signal authorization; the business action is still signed by the submitter. | order registrar allowlist, `triggerOrderFromOutsideFor()` / `triggerOrderFromSignalFor()`. |
| Registry Boundary | One `UVPIdentityRegistry` address is one identity-resolution domain. The initial domain is Store-operated; future independent regulated entities may run others. StateMachine does not read it. | `registryAddress`, `bindingId`, `UVPIdentityRegistry.owner()`. |
| HookReady | The event that says a trigger hook became ready and a Product task can open. | `HookReady(orderId, hookId, stageId, hookName)`. |
| Stage Overlay | Order-level runtime change that assigns executor or resources without changing the Plan. | executor/resource patch events. |
| Stage Patch | A controlled order action that applies an executor or resource overlay. "Patch" here is not a code patch. | `StageExecutorPatchApplied`, `StageResourcePatchApplied`. |
| Selector Binding | The Plan rule saying one stage may patch a target stage. | selector stage id, target stage id, binding key. |
| Replay | Rebuilding or checking order state from chain events. | statemachine reducer, chain-services projections. |

## Evidence, Proof, and Product Terms

| Term | Plain meaning | Code or product counterpart |
| --- | --- | --- |
| Evidence | Off-chain business material or metadata supporting a signal. | Product evidence route, object handle, evidence metadata. |
| Payload Hash | Fingerprint of the submitted business payload or evidence bundle. | `payloadHash` in signal submission. |
| Metadata URI | Pointer to off-chain metadata, manifest, or storage reference. | `metadataURI`. |
| Proof | A traceable record that a claim maps to chain events or hashes. In Product, proof rows should include tx, block, log, contract, chain id, event, and payload context. | Product proof row, event provenance. |
| Projection | A read model rebuilt from chain events for display. | chain-services indexer, Product DTO. |
| Product DTO | Data format translating chain facts into orders, tasks, proof, and trust views ordinary users can read. | `ZhixuDetailDTO`, `ProductOrderDTO`, `ProductTaskDTO`. |
| Product BFF | Product Backend-for-Frontend workflow service that handles drafts, invites, participant confirmation, authorization building, and order registration. | `uvp-chain-services/service/src/product/bff/`. |
| Signal Container | Product wrapper for task, evidence, typed data, signature, submission, and proof. | prepare/submit/proof Product API flow. |
| Store | Product workbench for the Nucleus, Suppliers, trust registries, operators, and proof views. | `zhixu-store/app`, Store Console API. |
| Chain Services | Rebuildable service layer for indexing, projection, proof, relaying, Product API, and Store API. | `@uvp-eth/chain-services`. |

## Advanced and Environment Terms

| Term | Plain meaning | Code or operational counterpart |
| --- | --- | --- |
| Docked Zhixu | One Zhixu hands a stage to another independently runnable Zhixu. | `supplierType=zhixu`, `signalMap`, docking events. |
| signalMap | Mapping from a linked Zhixu's `str/cmp/err` outputs back into the local stage interface. | `zhixuExecutorConfig.signalMap`. |
| Periphery Adapter | Funding, guarantee, payment, agent, or business-system adapter around the core state machine. | `uvp-periphery/`. |
| Relayer | Service or wallet that broadcasts signed transactions and may pay gas. It is not the business signer. | chain-services relayer, `submitSignalFor()`. |
| EIP-712 | Structured wallet signature format for business actions. | typed data builders, `UVPStateMachineSignal`. |
| Anvil | Local EVM chain used for development and protocol loops. | local Anvil scripts. |
| Base Sepolia | Public EVM testnet target for staging/rehearsal claims. | chain id `84532`. |

## Key Concept Pairs

| Pair | Correct reading |
| --- | --- |
| Zhixu / Order | Zhixu is the static design; Order is one runtime of that design. |
| Plan / Order | Plan is an endorsed version; Order is a concrete run under that Plan. |
| Nucleus / Store operator | The Nucleus owns internal Zhixu design; Store operator manages platform workflow. |
| Store or external institution / Authorization | publication is endorsement; authorization is permission to submit an order action. |
| Supplier / Executor | Supplier is capability and trust identity; Executor is the runtime submitter or handler. |
| Evidence / Proof | Evidence is off-chain material or metadata; proof is the trace from hash/signature/event to Product display. |
| File Resource / Business File | File Resource is a handle or requirement; private business files stay off chain. |
| Relayer / Submitter | The relayer broadcasts; the submitter signs the business claim. |
| Store metadata / On-chain facts | Store metadata organizes materials and workflow; on-chain facts come from registry and state-machine events. |
