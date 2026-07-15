# Plan

A Plan is the deterministic, immutable on-chain rule artifact compiled from Zhixu. It contains compiled hooks plus the metadata needed to interpret signals and stages.

```text
Zhixu DSL -> compiled hooks + metadata -> publisher signature -> commitPlan -> finalizePlan
```

The commit binds `hooksHash` and `metadataHash`; the contract derives the runtime `planHash` and a publisher-scoped `planId`. Metadata is submitted and verified once during finalization. Only a finalized Plan may create Orders.

Plan publication is authenticated by the publisher's EIP-712 signature. Any relayer may broadcast that signature. `UVPIdentityRegistry` does not publish, approve, revoke, or filter Plans.

A Plan remains static. Runtime executor selection, resources, evidence, docking, and Signal submissions belong to each Order's event history. A new rule version means a new Plan, not mutation of an existing one.
