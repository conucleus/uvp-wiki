# Stage Patch Authorization

Stage patch is a controlled runtime change action for an order, used to choose an executor or resource manifest. It reuses order-level authorization, so it still follows the same source / signal / submitter permission model.

## Internal Signal

The Product BFF automatically generates internal authorization based on the add-on manifest:

| Action | Internal signal |
| --- | --- |
| `stage_executor_patch` | `EXECUTOR_PATCH_SIGNAL_ID` |
| `stage_resource_patch` | `RESOURCE_PATCH_SIGNAL_ID` |

The source usually comes from the stage that initiated the patch:

```text
sourceId = keccak256(stageId)
```

If `stageId` is already `bytes32`, the implementation treats it as bytes32.

## Selector Binding

The patch is controlled by stage-to-target binding in the plan
(the wire / API field name is still selector binding):

```text
selectorStageId -> targetStageId
```

The contract uses the binding to decide whether the stage may patch the target stage.

## Executor Patch

An executor patch can perform assign, handoff, or replacement actions. The contract checks the nonce, order-level authorization, and stage-to-target binding, and then checks the previous executor or approval signal according to the mode.

After activation, the target stage’s business signals must be submitted by the active executor.

## Resource Patch

A resource patch stores hashes and URIs for the resource manifest, policy, and patch. Plaintext files stay off-chain; once the target business signal has already been submitted, the contract should reject the resource override.

## Why It Belongs to Authorization

A stage patch changes the order execution path. Without order-level authorization, Store or the backend could bypass participant permissions and alter executors or resources. Modeling the patch as a controlled signal lets the contract and the projection recover state from the same event stream.
