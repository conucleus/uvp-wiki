# Local-to-chain lifecycle

1. Compile Zhixu into hooks, selector bindings, signal capabilities, `hooksHash`, `metadataHash`, and runtime `planHash`.
2. Configure the six StateMachine modules and permanently call `freezeModules()`.
3. The publisher signs the Plan commit; any relayer calls `commitPlan`. The contract derives `planId` from publisher and Plan hash.
4. Selector bindings and signal capabilities are submitted once; `finalizePlan` verifies and freezes metadata.
5. Optionally, Store verifies a real-world subject and registers `subjectId -> account` in its `UVPIdentityRegistry`. This improves display and compliance audit only.
6. A creator signs the trigger for a finalized Plan; any relayer broadcasts it to create the Order.
7. Authorized accounts submit Signals directly or through relayers. Chain Services rebuilds order, task, identity, and proof views from events; Store labels, matching, notifications, and drafts remain off-chain.
