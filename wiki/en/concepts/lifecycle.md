---
title: Plan and Order Lifecycle
type: explanation
audience: 应用开发者
status: verified
---

# Plan and Order Lifecycle

An order passes through seven steps from static Zhixu to on-chain fact. The six-stage table below shows the key component and source of authority for each step:

| Stage | Key components | Source of authority |
| --- | --- | --- |
| Design | Nucleus, Store, Compiler | Zhixu source, Store materials, and deterministic compilation results. |
| Publication | Publisher, Protocol Bindings, StateMachine | EIP-712 publisher signature and Plan events. |
| Identity resolution | Store, Identity Registry | Store offline records, subject/account binding, and supplier SID/account. |
| Order creation | Birth-stage assigned supplier, Order participants | The birth signal's submitter signature and explicit idempotency key. |
| Order progression | Order App, uvp-client, StateMachine | Submitter signatures, Signal and Hook events. |
| Display and verification | Chain Services, Product DTO | Replayable chain events, hashes, and projections. |

## 1. Author and Compile

Store or developers write the Zhixu; the Compiler generates hooks, selector bindings, signal capabilities, `StageFileWriter[]`, `hooksHash`, `capabilitiesRoot`, `supplierBindingsRoot`, `fileWritersHash`, and the runtime `planHash`. Compilation only validates rule structure; it does not certify real-world supplier capability.

## 2. Configure and Freeze the StateMachine

Deploy the StateMachine and seven modules (stage patch, derived signal, dock registry, plan metadata, lens, file resource, identity registry), then call `freezeModules()` once addresses are set. After freezing, the owner cannot replace a module; upgrades require deploying a new StateMachine and switching explicitly through the Deployment Registry.

## 3. Sign and Commit the Plan

The publisher signs the six-field PlanCommit (`publisher + hooksHash + capabilitiesRoot + supplierBindingsRoot + fileWritersHash + deadline`). Any relayer calls `commitPlan`; the contract verifies the hash of the full hooks, the `StageSupplierBinding[]`, the `StageFileWriter[]`, and the publisher signature, and derives `planId = keccak("uvp.plan.id.v1", publisher, runtimePlanHash)` — `runtimePlanHash` is the four-tuple `(hooksHash, capabilitiesRoot, supplierBindingsRoot, fileWritersHash)` under domain `uvp.plan.runtime.v8`.

## 4. Finalize the Plan

Capabilities (signal capability + stage selector binding) are folded into `capabilitiesRoot`, supplier default/candidate bindings are folded into `supplierBindingsRoot`, and the file-writer stage allowlist is committed by `fileWritersHash`; the publisher commits all of them with the Plan at commit time. Any caller calls `finalizePlan(planId)` to finalize (permissionless); this step only finalizes and submits no table data. Only finalized Plans can create Orders.

## 5. Identity Directory (Optional)

After verifying subjects offline, Store may register `subjectId -> account` in its own `UVPIdentityRegistry`. This step only improves name display, contacts, and compliance audit; it is not an on-chain admission step for Plans or Orders. The supplier namespace of the same registry is the execution identity source: SID minting, a permanent `SID -> account` binding, and `pending/active/suspended/revoked` status; the supplier bindings in `commitPlan`, stage patches, and `submitSignal` all require an active SID.

## 6. Trigger Creates the Order

On the DSL declaration surface, birth is expressed by `trigger: true` on a `sendSignals` entry. The chain track has one birth entry: `submitSignal(orderId=0)`. The birth stage's currently effective assigned supplier account signs and submits the birth signal, and any relayer may broadcast it. The contract binds the finalized `planId`, checks birth admission, generates the `orderId` at runtime (deduplicating by `(submitter, idempotencyKey)`), records the birth fact, and materializes the initial stage.

## 7. Business Execution and Projection

The assigned supplier account submits Signals directly or through a relayer. The contract evaluates hooks and emits replayable events. Chain Services rebuild order, task, identity, and proof views from events only; Store names, tags, recommendations, notifications, and draft workflows are off-chain state.

## Related Pages

- [Protocol Boundaries](protocol-boundaries.md)
- [Contracts and Registries](contracts-and-registries.md)
- [Canonical Hash](artifacts/canonical-hashes.md)
- [State Machine](state-machine/README.md)
