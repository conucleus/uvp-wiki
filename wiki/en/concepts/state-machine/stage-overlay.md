---
title: Stage Overlay: Executor Patch and Resource Patch
type: explanation
audience: 工程贡献者
status: verified
---

# Stage Overlay: Executor Patch and Resource Patch

Stage overlay is an order-level patch. It allows a specific order to assign a new executor or resource for a target stage without modifying the Plan itself. This mechanism is used for runtime supplier selection, executor handoff, resource manifest replacement, and similar scenarios. This page is an index; for the contract checks and code entry points of the two kinds, see [Executor Patch](executor-patch.md) and [Resource Patch](resource-patch.md).

## Executor Patch

`StageExecutorPatchApplied` / `StageExecutorActivated` change only the target stage executor of a single order, not the Plan. An executor patch changes the execution constraint of a target stage. The contract requires:

- A `StageSelectorBinding` exists between the stage that initiates the patch and the target stage.
- The submitter of the patch has order-level authorization for the internal `EXECUTOR_PATCH_SIGNAL_ID`.
- The nonce must increase, so older patches cannot overwrite newer ones.
- Different modes such as assign, handoff, and replacement have different signature or approval requirements.

After activation, the contract automatically delegates to the active executor the target stage's current-order signal capabilities declared by Plan `sendSignals`. The selected wallet need not be preauthorized when the Order is created, but it can submit only those Plan-declared signals; a patch cannot expand Plan capabilities.

For details see [Executor Patch](executor-patch.md).

## Resource Patch

`StageResourcePatchApplied` changes only the resource reference of a single order, not the Plan. It is a different action from the executor patch; their fields and signature payloads should not be mixed (see the boundaries in [Resource Patch](resource-patch.md)). A resource patch is used for order-level resource overrides, such as a file manifest, policy, or resource bundle hash required by a stage. The contract requires:

- A stage-to-target binding exists.
- The submitter of the patch has order-level authorization for the internal `RESOURCE_PATCH_SIGNAL_ID`.
- The target stage has not yet submitted the target business signal.
- `resourceKey`, `manifestHash`, `policyHash`, and `patchHash` are non-zero.
- The nonce must increase.

The chain stores only hashes and URIs, not plaintext business files.

For details see [Resource Patch](resource-patch.md).

## Why the Plan Is Not Modified

The Plan is a publisher-signed workflow version. Runtime supplier selection, executor handoff, and resource replacement are execution facts of a specific order and do not modify plan semantics in reverse. Stage overlay gives the order flexibility while keeping the Plan auditable.
