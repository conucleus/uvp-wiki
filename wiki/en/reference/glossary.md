# Glossary

This page explains project terms in plain language first, then points to code or on-chain counterparts. `Zhixu` is the transliteration of the underlying Chinese coordination term; code, ABI, DTO, events, and type names keep their English forms.

## Core Objects

| Term | Plain meaning | Code or on-chain counterpart |
| --- | --- | --- |
| UVP / Universal Value Protocol | A coordination protocol and product vocabulary for recording authorized business signals and their consequences. In Chinese, UVP is 通用价值协议. | `uvp-eth` is the EVM/Web3 implementation track. |
| Zhixu | A static coordination definition that describes how a class of Orders should run. | `ZhixuDefinition`, `kind: "Zhixu"`, compiler input. |
| Plan / Zhixu version | A deterministic EVM-targeted version compiled from a Zhixu. | `HookPlanArtifact`, `OnchainHookPlanArtifact`, `registerPlan()`, `PlanRegistered`. |
| Order | One runtime instance of a Plan. | `UVPStateMachine.Order`, `registerOrder()`, `OrderRegistered`. |
| Nucleation | The organizing subject that originates, designs, and maintains a kind of Zhixu. For example, a procurement team can own the cross-border procurement Zhixu. | `spec.nucleation.id`, Store Nucleation workbench. |
| Stage | A step or execution segment inside a task pattern. | `taskPatterns[].stages[]`, `stageIdentifier`, `stageId`. |
| Task Pattern | A reusable grouping of stages inside a Zhixu. | `taskPatterns[].name`. |
| Supplier | A subject with real-world fulfillment capability that can be organized by Store and endorsed by a trust domain. | `SupplierDefinition`, `SupplierAttested`, `SupplierRevoked`. |
| Executor | The subject that actually handles the current Order stage or submits its signal. | order authorization, stage executor overlay, EIP-712 submitter. |
| Source | The causal namespace a signal belongs to. | `source`, `sourceId`, `signalKey`. |
| Signal | The smallest business fact accepted by the state machine for an Order. | `submitSignal()`, `SignalSubmitted`, `SignalRecord`. |
| Hook | A state-machine condition; not an HTTP webhook or callback. | `CompiledHook`, `HookStatusChanged`. |
| Trigger | A hook mark that opens an executable task by emitting `HookReady`. | stage `trigger`, `HookReady`. |
| File Resource | A handle for off-chain materials such as stage protocols, evidence templates, and resource manifests. It is not plaintext file storage. | `fileResources`, resource patch, metadata URI/hash. |
| HookPlan | Human-readable compiled artifact containing hooks, dependencies, routes, and audit labels. | `HookPlanArtifact`. |
| OnchainHookPlan | Compact EVM-facing artifact used for registration and attestation. | `OnchainHookPlanArtifact`, compact hooks, dependency indexes. |

## Actions and Events

| Term | Plain meaning | Code or on-chain counterpart |
| --- | --- | --- |
| Attestation | A trust-domain endorsement. It says a plan or supplier is trusted by that domain. | `PlanAttested`, `SupplierAttested`. |
| Authorization | Permission for a wallet to submit a specific source/signal for a specific Order, or to perform a controlled stage patch. | `SignalSubmitterAuthorized`, stage patch authorization. |
| Publisher | The allowed subject that registers Plans. | plan publisher allowlist, `registerPlan()`. |
| Registrar | The allowed subject that registers Orders and writes initial signal authorization. | order registrar allowlist, `registerOrder()`. |
| Official Domain | The trust domain configured for plan registration checks. Other domains may be displayed, but this one gates `registerPlan()`. | `officialDomainId`, `ZhixuTrustRegistry`. |
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
| Product BFF | Product workflow service that handles drafts, invites, participant confirmation, authorization building, and order registration. | `uvp-chain-services/service/src/product/bff/`. |
| Signal Container | Product wrapper for task, evidence, typed data, signature, submission, and proof. | prepare/submit/proof Product API flow. |
| Store | Product workbench for Nucleation, Suppliers, trust domains, operators, and proof views. | `zhixu-store/app`, Store Console API. |
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

## Do Not Confuse

| Pair | Correct reading |
| --- | --- |
| Zhixu / Order | Zhixu is the static design; Order is one runtime of that design. |
| Plan / Order | Plan is an endorsed version; Order is a concrete run under that Plan. |
| Nucleation / Store operator | Nucleation owns internal Zhixu design; Store operator manages platform workflow. |
| Trust Domain / Authorization | Attestation is endorsement; authorization is permission to submit an order action. |
| Supplier / Executor | Supplier is capability and trust identity; Executor is the runtime submitter or handler. |
| Evidence / Proof | Evidence is off-chain material or metadata; proof is the trace from hash/signature/event to Product display. |
| File Resource / Business File | File Resource is a handle or requirement; private business files stay off chain. |
| Relayer / Submitter | The relayer broadcasts; the submitter signs the business claim. |
| Store metadata / On-chain facts | Store metadata organizes materials and workflow; on-chain facts come from registry and state-machine events. |
