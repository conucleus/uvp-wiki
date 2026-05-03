# Plan and Order

This page exists only as a compatibility entry for old links and no longer appears in `SUMMARY.md`. Please read [Plan](plan.md) and [Order](order.md) separately.

Plan is “the executable version compiled from a Zhixu definition.” Order is “one on-chain instance of a Plan.” These two concepts must stay separate: Plan is responsible for static versioning, hash, and trust attestation; Order is responsible for runtime signals, hooks, executor/resource overlays, docking links, and proof.

## Plan

`registerPlan()` registers the compiled Plan in `UVPStateMachine`. Before registration, the contract checks:

- the caller is an allowed plan publisher;
- `planId` is not zero;
- hooks are not empty;
- the same `planId` has not already been registered;
- the official trust domain attestation on `(planId, planHash)` in `ZhixuTrustRegistry` is still valid.

The `Plan` stored by the contract contains:

```solidity
struct Plan {
    bytes32 planHash;
    address publisher;
    bytes32[] hookIds;
    bytes32[] selectorBindingKeys;
    mapping(bytes32 hookId => StoredHook hook) hooks;
    mapping(bytes32 signalKey => bytes32[] hookIds) dependencyIndex;
    mapping(bytes32 bindingKey => StageSelectorBinding binding) selectorBindings;
    bool exists;
}
```

`dependencyIndex` determines which hooks are evaluated when a signal arrives. The contract does not scan the whole Plan.

## Order

`registerOrder()` binds an Order to a registered Plan:

```solidity
struct Order {
    bytes32 planId;
    address creator;
    bool exists;
    mapping(bytes32 hookId => HookRuntime runtime) hookRuntime;
}
```

After registration succeeds, the contract initializes the runtime for each hook in the Plan, with the initial state set to `Init`.

## Authorization at Registration Time

The product path should use the `registerOrder` overload that accepts `SignalAuthorization[]`. This overload writes the allowed source/signal/submitter combinations when the Order is created.

The overload without authorization exists for compatibility. It can create an Order, but submission rights must be authorized later; the real product flow should use the overload with `SignalAuthorization[]`.

## Version Relationship

Plan version changes should be reflected in `planId` or `planHash`. Once an Order is bound to a `planId`, later state must be interpreted under that Plan. A new workflow version should register a new Plan, and old Orders should continue to be interpreted under the original Plan.
