---
title: Source Causal Chain
type: explanation
audience: 协议读者
preread: ../README.md
status: verified
---

# Source Causal Chain

> Prerequisite reading: [Core Concepts](../README.md)
`source` is a signal's causal progression line. It answers: "which line of progress does this business action belong to?" Roles, Suppliers, and wallets say who is acting; Source says which business line the action enters.

Think of sources as lanes in one project: sales, solution, supply, payment, logistics, field, and buyer can advance in parallel, or wait at some stage for another lane's proof before converging. These sources are not departments. One wallet, once authorized, can submit signals on multiple sources; one Supplier may also participate in several sources.

## Who Uses It

Nuclei declare sources in stage `source` fields and Hook expressions; the compiler builds them into dependency indexes; authorized submitters write signals onto their own sources, and the state machine replays causal lines isolated by source.

## What It Produces

Every source participates in `signalKey` construction: same-named signals under different sources are different on-chain facts. Sources let hooks depend on the correct causal lane, and let one Order carry multiple parallel lines that converge at hooks.

## Where Authority Comes From

Source is only a namespace and compiler input; authoritative facts remain the on-chain signal/proof events after authorized submission. The lane division on this page is modeling advice, not a protocol-enforced enumeration.

Hook expressions are written as `source::condition`, and signals inside the condition are interpreted under that source by default.

Engineering detail:

```text
sourceId = keccak256(source)
signalId = keccak256(signalName)
signalKey = keccak256(abi.encode(sourceId, signalId))
```

On-chain authorization, signal deduplication, and hook dependencies all revolve around `signalKey`. Therefore `seller::pack.cmp` and `buyer::pack.cmp` are two different business facts even with identical signal names.

## Sources in a Cross-border Order

In a cross-border supply Order, multiple causal lanes can advance in parallel and converge at specific hooks:

| Source | Real-world line | Example signal | Common submitter | Downstream dependency |
| --- | --- | --- | --- | --- |
| `sales` | Business requirements, quotations, buyer communication. | `master.commercial_offer.cmp` | Sales or buyer-side operator. | Buyer commitment task can open. |
| `solution` | Technical scope and solution confirmation. | `master.technical_scope.cmp` | Solution engineer. | Supplier sourcing can open. |
| `supply` | Supplier sourcing and procurement preparation. | `master.supplier_sourcing.cmp` | Procurement executor. | Logistics or payment tasks may wait for it. |
| `payment` | Payment path, funding preparation, or settlement adapter results. | `master.supplier_usdc_direct.cmp` | Payment executor or adapter. | Procurement execution may require payment proof. |
| `logistics` | International logistics and customs clearance. | `master.customs_clearance.cmp` | Logistics/customs executor. | Delivery or field work can open. |
| `field` | On-site delivery, installation, or commissioning. | `master.site_acceptance.cmp` | Field executor or buyer representative. | Final acceptance can open. |
| `buyer` | Buyer commitment and acceptance. | `master.acceptance.cmp` | Buyer wallet. | Order closure or after-sales branch. |

Source is the namespace used by hooks and signals so the state machine replays the right causal lanes.

## Same-source Chaining

In a supplier-sourcing linked Zhixu, several stages can advance under the same `sourcing` source:

```yaml
market_scan:
  source: sourcing
  receiveSignals:
    INTAKE_READY: sourcing::source.start.cmp

rfq:
  source: sourcing
  receiveSignals:
    LONG_LIST_READY: sourcing::source.market_scan.cmp

quote_compare:
  source: sourcing
  receiveSignals:
    RFQ_SENT: sourcing::source.rfq.cmp
```

This expresses one sourcing causal chain: intake completes before market scan, market scan before RFQ, RFQ before quote comparison.

## Cross-source Dependency

A stage can belong to one source while waiting for another source's result. If a procurement stage belongs to `supply` but waits on `payment::...`, it means the supply lane must wait until the payment lane produces what it needs:

```yaml
procurement_execution:
  source: supply
  receiveSignals:
    SUPPLIER_FUNDED: payment::master.supplier_usdc_direct.cmp | master.supplier_settlement_exec.cmp
```

This is a convergence point: the procurement execution stage belongs to the supply source but depends on payment proof.

## Advanced Modeling Examples

The three advanced modeling cases — deal matching, petroleum fractionation, produce collection — have moved to [Source Modeling Examples](modeling-examples.md).

## Boundary Checklist

- Role slots describe participating roles; Source describes causal chains.
- Executor describes the runtime handler or submitter; Source describes the signal context.
- Supplier is a participant subject organized by the nucleus with capability profiles maintained by Store; Source is a hook/signal namespace.
- Fulfillment after deal-closing can form new sources or a new Order.
- Sources must be compilable, authorizable, and replayable, and must not be treated as arbitrary dynamic fields; for site-wide invariants — on-chain source of truth, read models, no plaintext on chain — see [Protocol Boundaries](../protocol-boundaries.md).
