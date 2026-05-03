# Actor Map

This page names the people, organizations, wallets, and services in the one-order path. Keep the main split in mind: people and services help prepare, submit, display, and relay actions; registry and state-machine events prove protocol facts.

## One Cross-Border Order

| Actor | What they do | Where they act | What proves it |
| --- | --- | --- | --- |
| Buyer | Starts or participates in a concrete supply order, reviews tasks, and signs buyer-side confirmations. | Product UI, Order App, wallet. | `OrderRegistered` for the order; `SignalSubmitted` for signed buyer actions. |
| Nucleation | Designs and maintains the reusable Zhixu for this kind of order. For example, a procurement team can own `spec.nucleation.id=procurement-nucleus`, maintain versions, define stages, and organize supplier slots. | Store Nucleation workbench and Zhixu source materials. | The compiled `planId` / `planHash`; later `PlanAttested` if endorsed. |
| Store operator | Imports the Zhixu, checks compile previews, organizes supplier profiles, reviews materials, and starts attestation workflows. | Store / Store Console. | Store audit records for workflow actions; registry events for official trust. |
| Trust Domain | Externally endorses a plan version or supplier subject. | Trust registry workflow and governance wallet. | `PlanAttested`, `PlanRevoked`, `SupplierAttested`, or `SupplierRevoked`. |
| Registrar | Registers a concrete Order against an endorsed Plan and writes initial order-level signal permissions. | Product BFF, governance flow, or direct contract call. | `OrderRegistered` and `SignalSubmitterAuthorized`. |
| Supplier | Provides a real-world capability such as customs, logistics, inspection, payment adapter, guarantee, or another Zhixu. | Store supplier registry and Product projection. | `SupplierAttested` for trust; order authorization for current action permission. |
| Executor | Actually handles a task or submits a signal for the current Order and stage. | Order App, executor-kit, enterprise system, or adapter. | EIP-712 signature plus `SignalSubmitted`; stage overlay events if an active executor was chosen. |
| Relayer | Broadcasts a participant-signed transaction and may pay gas. | Chain Services relayer. | Transaction hash and on-chain event; the relayer does not prove business authority. |
| Chain Services | Rebuilds order, task, timeline, proof, and trust views from chain events, and exposes Product / Store APIs. | Rebuildable service layer. | Projection rows with tx, block, log, contract, chain id, and event provenance. |

## Who Has Authority

| Question | Authority source |
| --- | --- |
| Is this Zhixu version trusted? | Trust-domain `PlanAttested` / `PlanRevoked`. |
| Does this Order exist? | `UVPStateMachine.OrderRegistered`. |
| Who may submit this action for this Order? | `SignalSubmitterAuthorized` plus active executor overlay when present. |
| Did a business action happen? | Authorized signature and `SignalSubmitted`. |
| Is the next task open? | `HookReady`. |
| Is a Product or Store view reliable? | It must point back to chain events or clearly marked workflow metadata. |

## Do Not Confuse

| Pair | Correct reading |
| --- | --- |
| Nucleation / Store operator | Nucleation owns the internal Zhixu design; Store operators manage platform workflow and review materials. |
| Trust Domain / Registrar | The trust domain endorses plans or suppliers; the registrar creates concrete Orders and writes signal authorizations. |
| Supplier / Executor | Supplier is capability and trust identity; Executor is the runtime handler or submitter for this Order and stage. |
| Relayer / Submitter | The relayer broadcasts; the submitter signs the business action. |
