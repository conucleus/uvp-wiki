# Executor

Executor is the actual subject that takes on a stage, produces business actions, or submits signals at runtime for an Order. It can be a person, an enterprise system, a wallet sent out by a Supplier, an adapter, an AI/MCP agent, or a standalone Zhixu.

Executor must be separated from Supplier:

| Object | Problem it solves | Typical authority |
| --- | --- | --- |
| Supplier | Who has a certain real-world fulfillment capability, and whether that subject is endorsed by a trust registry. | Store metadata + `ZhixuTrustRegistry` supplier attestation. |
| Executor | Who is actually executing or submitting the signal for the current Order and current stage. | `UVPStateMachine` order authorization, stage executor overlay, EIP-712 signature. |

Supplier is the capability subject and trust subject; Executor is the runtime binding and signal submitter. One Supplier can send out multiple executor wallets, and one Executor can also represent a Supplier, an adapter, or a Zhixu that runs independently.

## How an Executor Is Chosen

The usual path for an Executor to take effect is:

```text
Supplier registers in the Store
  -> Store maintains capability tags, contacts, fulfillment records, and trust projection
  -> Trust registry attests/revokes the supplier subject
  -> Zhixu stage declares the required executor or Supplier type
  -> Order registration writes order-level signal authorization
  -> Control stage may specify an active executor through executor patch
  -> only the active executor can submit the business signal for the target stage
```

Store provides candidate networks, contactability, and proof materials for Nucleation and operators; on-chain stage binding, order-level authorization, active executor overlays, and EIP-712 signatures determine whether a given Order can accept the signals submitted by that subject.

## Static Executor

The `executor` field in the Zhixu DSL is the static default configuration in the Plan. It expresses “which kind of subject is expected to take over this stage.” The wallet that can submit for the current Order is still determined by order authorization and the active executor overlay.

```yaml
executor:
  supplierType: organization
  supplierID: "{{ .customs_broker_uid }}"
```

The static executor enters the compiler artifact’s executor route, helping Product API, Store, Order App, and executor-kit know who should be contacted for that stage, what fulfillment notes should be shown, and what resources or evidence are required. Whether a signal is actually submittable still depends on order registration authorization and runtime overlays.

## Dynamic Active Executor

For some stages, the executor is selected during Order runtime by a control stage with `stage_executor_patch` capability. The control stage must be authorized to select the target stage in `selectedStages`.

```yaml
selectedStages:
  - customs.complete
sendSignals:
  - select_executor
```

Runtime events may look like this:

```text
StageExecutorPatchApplied(orderId, selectorStageId, targetStageId, selector, executor, ...)
StageExecutorActivated(orderId, targetStageId, executor, ...)
```

The active executor overlay affects only this Order and does not modify the Plan. Once a target stage has an active executor, later business signals for that stage must be submitted by the active executor; even if another wallet originally had signal authorization, the contract rejects the wrong submitter according to the overlay.

## Zhixu Can Also Be an Executor

A Zhixu can serve as the executor of another Zhixu. It receives the local Zhixu’s exposed execution interface, runs according to its own plan, authorization, and proof path, and then maps the agreed signals back to the local Zhixu through `signalMap`.

A typical example is cross-border supply:

- The local procurement Zhixu is responsible for demand confirmation, sourcing, payment path, logistics, and acceptance.
- The settlement stage can choose the `payment-settlement` Zhixu as the executor.
- The internal `fiat_bridge` stage of `payment-settlement` can in turn choose the `fiat-payout-bridge` Zhixu as the executor.

The local stage is written like this:

```yaml
executor:
  supplierType: zhixu
  supplierID: "{{ .fiat_payout_bridge_zhixu_uid }}"
  zhixuExecutorConfig:
    signalMap:
      str: fiat_bridge::payout.start.str
      cmp: fiat_bridge::payout.close.cmp
      err: fiat_bridge::payout.close.err
```

This means:

1. The local Plan declares that the stage executor type is `zhixu`.
2. `supplierID` points to a peer Zhixu or supplier subject that Store or the Trust Registry can recognize.
3. `signalMap` declares how the local stage waits for or interprets linked Zhixu output signals.
4. The compiler generates `kind=signalMap` hooks for `signalMap`; `str` and `cmp` must exist, and a single signalMap must reference the same source.
5. Creation, notification, proof validation, and local signal mapping for the linked Zhixu are organized by Store/Product/adapter/executor-kit workflows.
6. Runtime docking can land in `linkDockedOrder`, `DockedOrderLinked`, `DockedSignalMapped`, `submitDockedSignal`, and `DockedSignalSubmitted`.
7. The local Order and linked Order each use their own `UVPStateMachine` events as the source of truth.

The engineering model of a docked Zhixu is: the linked Zhixu runs independently, Store/Product or an adapter observes the linked proof, and then the local Order is advanced through an on-chain docking link and an authorized signal mapping. That bridging action leaves signal proof on the local Order.

## Runtime Path for a Docked Zhixu

```text
some trigger hook in the local Order becomes Ready
  -> Product/Store create the local stage task
  -> Store selects or confirms the peer Zhixu version
  -> Product/adapter registers or locates the linked Order
  -> the linked Order executes according to its own Plan, authorization, and executor
  -> the linked Order produces str/cmp/err proof
  -> adapter or Product workflow validates the proof and signalMap
  -> linkDockedOrder / submitDockedSignal or authorized submitter maps the local signal
  -> the local Order reaches Hook Ready / Cancelled / next stage
```

Two numbering systems may appear here:

- On chain, the local `orderId` and linked `orderId` are created by their respective trigger-order entrypoints.
- Product task IDs, Store docking sessions, and adapter jobs may have their own execution numbers; runtime proof still returns to on-chain order/signal/docking events.

## Protocol Meaning of `signalMap`

`signalMap` is the semantic contract for how a local stage accepts output from a linked Zhixu.

| Field | Meaning |
| --- | --- |
| `str` | The signal that the linked Zhixu has started or received the delegation. The current compiler requires it. |
| `cmp` | The signal that the linked Zhixu has completed. The current compiler requires it. |
| `err` | The signal that the linked Zhixu failed, rejected, or raised an exception. Optional, but most real workflows should configure it. |

The compiler validates that `signalMap` expressions can be parsed by hook-core and that the referenced local stages/signals exist.

## Where Executor Kit Fits

`uvp-executor-kit` is the integration toolkit for Executors, as described in [Executor Kit](../../execution/executor-kit.md). It has two equally important entry points:

- Chain-native: listen for `HookReady`, route by handler, and submit authorized signals.
- Product API: read the task/signal container, prepare evidence, sign, submit, and read proof.

Executor Kit can help an executor observe tasks, generate payload hashes, sign, submit, and diagnose blocked reasons.
