# Store and Order App

Store, Order App, and executor-kit consume the same on-chain facts from different user perspectives. Store is the centralized governance and cataloging tool; Order App is the ordinary participant task tool; executor-kit is the integration tool for executors, enterprise systems, and AI / MCP adapters.

## Store

`zhixu-store/app` is for the Store / workbench. It can handle:

- Order creation and participant configuration.
- Task review and workflow viewing.
- Chain proof display.
- Plan attestation and supplier trust display.
- Metadata, catalog, review, and audit support workflows.

Store may not:

- Let metadata replace `PlanRegistered`.
- Let a review draft replace `SignalSubmitted`.
- Let the Store database replace the trust registry.
- Sign business actions on behalf of participants.

Store’s centralized authority can influence recommendations, review, tagging, and governance entry points, but it cannot directly change order runtime facts.

## Order App

`uvp-order-app/app` is for ordinary participants. It should use plain language to show:

- Pending tasks.
- Submission confirmation.
- Evidence fingerprints.
- On-chain proofs.
- Fulfillment or execution party.
- Resource requirements.
- Readiness checks.

The ordinary task UI should not require users to understand `HookPlan`, `sourceId`, `signalId`, ABI, or gas details. Advanced proof / debug views can show those fields.

## Executor Kit

`uvp-executor-kit` has two paths:

| Path | Purpose |
| --- | --- |
| Product API mode | Find tasks through Product DTOs, read proofs, and prepare submissions. |
| Chain watcher mode | Watch chain events and contract state directly, for executors or adapters. |

Both paths are ultimately signal producers. They do not own order state; the business action comes from the authorized wallet signature.

## Periphery Adapter

Funding, guarantee, AI / MCP, and demo executors can live in `uvp-periphery`. They should consume `UVPStateMachine`, `ZhixuTrustRegistry`, Product DTOs, or executor-kit, rather than defining new core order truth.
