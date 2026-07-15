# Stage Overlay

Stage overlay is an order-level patch. It allows a specific order to assign a new executor or resource for a target stage without modifying the Plan itself. This mechanism is used for runtime supplier selection, executor handoff, resource manifest replacement, and similar scenarios.

## Executor Patch

An executor patch changes the execution constraint of a target stage. The contract requires:

- A `StageSelectorBinding` exists between the stage that initiates the patch and the target stage.
- The submitter of the patch has order-level authorization for the internal `EXECUTOR_PATCH_SIGNAL_ID`.
- The nonce must increase, so older patches cannot overwrite newer ones.
- Different modes such as assign, handoff, and replacement have different signature or approval requirements.

After activation, the contract automatically delegates the target stage’s current-order signal capabilities declared by Plan `sendSignals` to the active executor. The selected wallet need not be preauthorized when the Order is created, but it can submit only those Plan-declared signals; a patch cannot expand Plan capabilities.

See [Executor Patch](executor-patch.md) for the dedicated page.

## Resource Patch

A resource patch is used for order-level resource overrides, such as a file manifest, policy, or resource bundle hash required by a stage. The contract requires:

- Stage-to-target binding exists.
- The submitter of the patch has order-level authorization for the internal `RESOURCE_PATCH_SIGNAL_ID`.
- The target stage has not yet submitted the target business signal.
- `resourceKey`, `manifestHash`, `policyHash`, and `patchHash` are non-zero.
- The nonce must increase.

The chain stores only hashes and URIs, not plaintext business files.

See [Resource Patch](resource-patch.md) for the dedicated page.

## Why the Plan Is Not Modified

The Plan is a publisher-signed workflow version. Runtime supplier selection, executor handoff, and resource replacement are execution facts for a specific Order and do not modify Plan semantics. Stage overlay gives the Order flexibility while keeping the Plan auditable.
