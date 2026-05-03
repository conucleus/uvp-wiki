# Trust and Authorization

`uvp-eth` separates “who attests the plan” from “who may submit a given order action”. Plan trust comes from trust-domain attestation in `ZhixuTrustRegistry`; order-action permission comes from order-level signal authorization in `UVPStateMachine` and participant EIP-712 signatures.

## Subpages

| Subpage | Description |
| --- | --- |
| [Trust Domain](trust/domains.md) | Official domains, plan attestation, supplier attestation, revocation, and projection. |
| [Signal Authorization](trust/signal-authorization.md) | How source / signal / submitter permissions are bound at order registration time. |
| [EIP-712 and Relayer](trust/eip712-relayer.md) | How relayers submit signed transactions, and why the business signature must come from the authorized wallet. |
| [Stage Patch Authorization](trust/stage-patch.md) | How executor / resource patches reuse order-level authorization with selector binding. |

## Three Layers of Checks

| Layer | Problem It Solves |
| --- | --- |
| Trust domain | Whether a plan or supplier is endorsed by some trust domain. |
| Publisher / registrar allowlist | Who can register plans, and who can register orders. |
| Order-level signal authorization | For a given order, which wallet may submit which source / signal. |

These three layers check different questions: plan attestation solves plan / supplier trust, allowlists solve who can register, and order-level signal authorization solves who can submit the current order action.

## Supplier Trust and Signal Authorization

Supplier trust states that a trust domain endorses a supplier subject. It can affect Store recommendations, Product warnings, admission checks during BFF authorization building, and whether executor-kit fails closed. `submitSignal()` permission still belongs to order-level authorization.

The actual submission permission always lives at the order level:

```text
orderId + sourceId + signalId + submitter
```

This boundary avoids the mistake of thinking “because a supplier got a customs tag in Store, it can submit every customs order”.
