# Glossary

This page first explains each object in plain terms, then gives the code and on-chain names. `Zhixu` is the transliteration of the underlying Chinese coordination term; the body text should prefer “Zhixu,” while code, ABI, DTO, events, and type names keep their English forms.

| Chinese name | Code name | One-sentence definition | Code or on-chain counterpart |
| --- | --- | --- | --- |
| Zhixu | `Zhixu` | A static coordination definition designed by Nucleation that describes how a class of Orders should run. | `ZhixuDefinition`, `kind: "Zhixu"`, compiler input. |
| Plan / Zhixu version | `Plan` | A deterministic on-chain version compiled from a Zhixu for EVM. | `HookPlanArtifact`, `OnchainHookPlanArtifact`, `registerPlan()`, `PlanRegistered`. |
| Order | `Order` | One runtime instance of a Plan, holding the signals, hook runtime, overlays, and proof for that run. | `UVPStateMachine.Order`, `registerOrder()`, `OrderRegistered`. |
| Nucleation | `Nucleation` | The organizing nucleus that originates, designs, and maintains a kind of Zhixu. | `spec.nucleation.id`, Store Nucleation workbench. |
| Supplier | `Supplier` | A subject with a certain real-world fulfillment capability that can be organized by Store and endorsed by a trust domain. | `SupplierDefinition`, `SupplierAttested`, `SupplierRevoked`. |
| Executor | `Executor` | The subject that actually takes on the task or submits signals for a given Order and stage. | order-level authorization, stage executor overlay, EIP-712 submitter. |
| Source | `Source` | The causal namespace that a signal belongs to, used to express same-source chaining, branching, and convergence. | `source`, `sourceId`, `signalKey`. |
| Signal | `Signal` | The smallest business fact submitted by an authorized wallet for an Order. | `submitSignal()`, `SignalSubmitted`, `SignalRecord`. |
| Hook | `Hook` | The rule that derives whether a stage is ready, waiting, or cancelled from signal conditions. | `CompiledHook`, `HookStatusChanged`. |
| Trigger | `Trigger` | A hook marked as a task entry that emits `HookReady` after it becomes ready. | stage `trigger`, `HookReady`. |
| File Resources | `File Resources` | A handle for off-chain materials such as stage protocols, evidence templates, and resource manifests. | `fileResources`, resource patch, metadata URI/hash. |
| Trust Domain | `Trust Domain` | A governance subject that gives external endorsement to a plan or supplier. | `ZhixuTrustRegistry` domain, `PlanAttested`, `SupplierAttested`. |
| Authorization | `Authorization` | Which source/signals a wallet may submit in a particular Order. | `SignalSubmitterAuthorized`, stage patch authorization. |
| Projection | `Projection` | A read model rebuilt from chain events for display in Product API, Store, and Order App. | chain-services indexer, Product DTO. |
| Store | `Store` | The product workbench for Nucleation, Suppliers, trust domains, and operators. | `zhixu-store/app`, Store Console API. |
| Product DTO | `Product DTO` | A translation of chain facts into orders, tasks, proof, and trust views that ordinary users can read. | `ZhixuDetailDTO`, `ProductOrderDTO`, `ProductTaskDTO`. |
| Docked Zhixu | `Docked Zhixu` | One Zhixu hands a stage to another independently runnable Zhixu. | `supplierType=zhixu`, `signalMap`, `DockedOrderLinked`, `DockedSignalMapped`, `DockedSignalSubmitted`. |
| Periphery Adapter | `Periphery Adapter` | A funding, guarantee, agent, or business-system adapter that consumes signals/proofs around the core state machine. | `uvp-periphery/`, adapter contracts/services. |

## The Three Most Confusing Pairs

| Pair | Correct reading |
| --- | --- |
| Zhixu / Order | Zhixu is the static design; Order is one runtime of that design. |
| Supplier / Executor | Supplier is the capability and trust subject; Executor is the runtime submitter for the current Order and stage. |
| Store metadata / On-chain facts | Store metadata organizes materials and workflow; on-chain facts come from registry and state-machine events. |

## Correspondence When Reading Code

```text
Static design
ZhixuDefinition
  -> HookPlanArtifact
  -> OnchainHookPlanArtifact
  -> PlanRegistered

Dynamic runtime
registerOrder
  -> SignalSubmitterAuthorized
  -> SignalSubmitted
  -> HookStatusChanged / HookReady
  -> ProductOrderDTO / ProductTaskDTO
```
