# One Order Story

This page ties the main UVP path together with one high-value cross-border cargo order. Keep one sentence in mind first: Zhixu is the static coordination design, and Order is one on-chain runtime of that design.

## 1. Nucleation Designs a Zhixu

The Nucleation first designs a reusable cross-border supply Zhixu: demand confirmation, supplier sourcing, payment path, logistics, customs clearance, on-site delivery, and buyer acceptance. This static definition is written as `ZhixuDefinition`:

```text
Zhixu
  -> task patterns
  -> stages
  -> sources
  -> receive/send signals
  -> supplier/executor requirements
  -> file resource handles
```

There is no concrete Order yet, and no participant has submitted evidence. This only says how this kind of coordination should run.

## 2. Compile Into a Plan

The compiler turns the Zhixu into deterministic artifacts:

```text
ZhixuDefinition
  -> HookPlanArtifact
  -> OnchainHookPlanArtifact
  -> registerPlan args
  -> planId / planHash
```

The Plan is the chain-targeted version of the Zhixu. Any change to fields that affect semantics changes the hash, so later review, registration, and order runtime all have a stable boundary.

## 3. A Trust Domain Endorses the Plan

The official trust domain reviews the Plan materials, hash, and policy, then emits the following in `ZhixuTrustRegistry`:

```text
PlanAttested(domainId, planId, planHash, ...)
```

This step turns “reviewable materials” into on-chain verifiable plan trust. Store can display the request, review materials, and projections, but the basis for an officially trusted plan is the registry event.

## 4. Register the Order and Write Authorization

When a buyer actually wants to run one cross-border supply flow, the registrar registers an Order in `UVPStateMachine`:

```text
registerOrder(orderId, planId, creator, authorizations)
```

The Order is bound to a registered and endorsed Plan. `authorizations` also records who may submit which source/signal for this Order:

```text
SignalSubmitterAuthorized(orderId, sourceId, signalId, submitter, ...)
```

Only from this point on does `orderId` represent one concrete runtime.

## 5. Participants Submit Signals

An authorized wallet submits a business signal with an EIP-712 signature, for example a logistics provider submits the evidence hash for “customs clearance complete,” and a buyer submits the confirmation for “acceptance passed”:

```text
submitSignal(orderId, sourceId, signalId, payloadHash, metadataURI, ...)
  -> SignalSubmitted
```

The contract deduplicates by `(orderId, sourceId, signalId)` with first-writer-wins semantics. Business files stay off chain; on chain keeps the hash, URI, submitter, time, and event proof.

## 6. HookReady Generates Tasks and Proof

After each signal enters the state machine, the contract evaluates only the hooks affected by that signal. When the conditions are satisfied, it emits:

```text
HookStatusChanged
HookReady
```

chain-services rebuild the order, tasks, timeline, proof rows, and trust projection from events, then translate them into `ProductOrderDTO` and `ProductTaskDTO` for Store, Order App, and executor-kit.

## 7. Another Zhixu Takes Over a Stage

Some stages can be handed to another independent Zhixu, such as customs clearance or payment settlement. The static layer declares this with `supplierType=zhixu` and `signalMap`:

```text
local stage
  -> peer Zhixu plan
  -> linked order
  -> linked signal proof
  -> mapped local signal
```

The current contracts already provide the runtime docking event path:

```text
DockedOrderLinked
DockedSignalMapped
DockedSignalSubmitted
```

Store/Product can first organize the sandbox, contacts, operator review, and proof checklist. Once the flow enters runtime, both Orders still use their own `UVPStateMachine` events as the source of truth.

## Quick Reference for Facts

| Question | Source of Truth | Product Display |
| --- | --- | --- |
| Is this Zhixu version trusted? | `PlanAttested` / `PlanRevoked` | Store trust badge, Product proof row. |
| Does this Order exist? | `OrderRegistered` | Product order, Store runtime view. |
| Who can submit a given action? | `SignalSubmitterAuthorized`, active executor overlay | task assignment, canSubmit, blocked reason. |
| Did a given action happen? | `SignalSubmitted` | task submitted, timeline, proof row. |
| Is the next step ready? | `HookReady` | task inbox, executor-kit watcher. |
| Has the peer Zhixu been docked? | `DockedOrderLinked`, `DockedSignalMapped`, `DockedSignalSubmitted` | docking proof, linked runtime view. |
