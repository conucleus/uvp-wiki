# Protocol Mainline

This page is the leftover protocol mainline entry from the previous navigation. The new main navigation has already split the content into [Core Concepts](../core/README.md), [Core Components](../components/README.md), [Store](../store/README.md), and [Executors and Integrations](../execution/README.md). It stays here as a short-path index from DSL to the on-chain state machine.

The protocol mainline answers one question: how does a Zhixu coordination rulebook become a verifiable, replayable, and authorizable on-chain state machine?

```text
Zhixu DSL
  -> nucleation id and design boundary
  -> deterministic HookPlan / OnchainHookPlan artifacts
  -> publisher-signed Plan publication
  -> UVPStateMachine plan/order registration
  -> order-level signal authorization
  -> wallet-bound signal submission
  -> HookReady / HookStatusChanged events
  -> replayable Product projection
```

## Reading Path

| Page | Purpose |
| --- | --- |
| [Core Concepts](../concepts/overview.md) | system glossary and shortest protocol path. |
| [Zhixu DSL](../concepts/core/zhixu.md) | static Zhixu definition and compilable fields. |
| [Nucleus / Nucleation](../concepts/core/nucleation.md) | the initiating kernel, designer, and organizer of Zhixu; `nucleation` remains the field/context name. |
| [Plan](../concepts/core/plan.md) | the static, publishable, registerable compilation artifact. |
| [Order](../concepts/core/order.md) | the runtime instance of a Plan and its replayable event stream. |
| [Source Causal Chain](../concepts/core/source.md) | how signals branch, chain, and intersect in causal context. |
| [Signal](../concepts/core/signal.md) | the smallest business input accepted by the state machine. |
| [Hook](../concepts/core/hook.md) | the conditional expression for readiness and state changes. |
| [Trigger](../concepts/core/trigger.md) | which hook opens the execution entry point after becoming Ready. |
| [File Resources](../concepts/core/file-resources.md) | stage resource handles and off-chain object boundaries. |

## Three Protocol Lines

| Main line | Pages |
| --- | --- |
| Runtime semantics | [State Machine](../concepts/state-machine.md), [Hook Evaluation](../concepts/state-machine/evaluation.md), [Timers and Status](../concepts/state-machine/timers-and-status.md), [Stage Overlay](../concepts/state-machine/stage-overlay.md), [Docked Zhixu Runtime](../concepts/state-machine/docking.md), [Event Replay](../concepts/state-machine/replay.md) |
| Deterministic artifacts | [Artifacts and Hashes](../concepts/artifacts-and-hashes.md), [Compiler Input](../concepts/artifacts/compiler-input.md), [Canonical Hash](../concepts/artifacts/canonical-hashes.md), [Solidity Registration Arguments](../concepts/artifacts/solidity-registration.md) |
| Trust and authorization | [Trust and Authorization](../concepts/trust-and-authorization.md), [Store or external institution](../concepts/trust/domains.md), [Signal Authorization](../concepts/trust/signal-authorization.md), [EIP-712 and Relayer](../concepts/trust/eip712-relayer.md), [Stage Patch Authorization](../concepts/trust/stage-patch.md) |

## Protocol Boundary

- Contracts and chain events determine the actual state of plan, order, signal, hook, publication, and deployment cutover.
- Backend services, Store, Order App, executor-kit, and periphery adapters may only consume, project, display, relay, or extend core state.
- Business documents, invoices, logistics records, vehicle evidence, and object bytes are not stored on chain; they only become hashes, metadata URIs, or private storage.
- The relayer may submit transactions and pay gas, but it cannot generate the participant’s business signature.
- Funding, USDC, escrow, guarantee, settlement, and AI/MCP agents all belong to adapter/periphery context, not to the state-machine core.
- `supplierType=zhixu` is a composed execution mode; local and linked orders must always resolve back to their own state-machine events and proof.
- Store platform workflow cannot replace internal Nucleus governance, and it cannot replace Store or external institution endorsement.
