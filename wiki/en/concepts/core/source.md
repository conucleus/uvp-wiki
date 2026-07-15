# Source Causal Chain

`source` is the causal lane of a signal. It answers: "which line of business progress does this signal belong to?" Roles, Suppliers, and wallets say who acts; Source says which lane the action enters.

Read it like lanes in one project: sales, solution, supply, payment, logistics, field, and buyer can move in parallel, then converge when one lane waits for proof from another lane. These sources are not departments. A single wallet may be authorized on more than one source, and one Supplier may appear in several sources.

Hook expressions are written as `source::condition`, and the signals inside the condition are interpreted under that source by default.

Engineering note:

```text
sourceId = keccak256(source)
signalId = keccak256(signalName)
signalKey = keccak256(abi.encode(sourceId, signalId))
```

On-chain authorization, signal deduplication, and hook dependency resolution all happen around `signalKey`. Therefore, `seller::pack.cmp` and `buyer::pack.cmp` are different business facts even if the signal name is the same.

## Source in One Cross-Border Order

In a cross-border supply Order, several causal lanes may progress in parallel and converge at specific hooks:

| Source | Real-world lane | Example signal | Typical submitter | Later dependency |
| --- | --- | --- | --- | --- |
| `sales` | Commercial demand and offer. | `master.commercial_offer.cmp` | sales or buyer-facing operator. | Buyer commitment can open. |
| `solution` | Technical scope and solution confirmation. | `master.technical_scope.cmp` | solution engineer. | Supplier sourcing can open. |
| `supply` | Supplier sourcing and procurement preparation. | `master.supplier_sourcing.cmp` | procurement executor. | Logistics or payment tasks can wait on it. |
| `payment` | Payment route, funding, or settlement adapter result. | `master.supplier_usdc_direct.cmp` | payment executor or adapter. | Procurement execution may require payment result. |
| `logistics` | International logistics and customs. | `master.customs_clearance.cmp` | logistics/customs executor. | Delivery or field work can open. |
| `field` | On-site delivery, installation, or commissioning. | `master.site_acceptance.cmp` | field executor or buyer representative. | Final acceptance can open. |
| `buyer` | Buyer commitment and acceptance. | `master.acceptance.cmp` | buyer wallet. | Order closure or after-sales branch. |

The Source is the namespace used by hooks and signals so the state machine can replay the correct causal line.

## Same-Source Chaining

In a supplier-sourcing linked Zhixu, multiple stages can progress under the same `sourcing` source:

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

This describes one sourcing causal chain: intake must complete before market scan, market scan before RFQ, and RFQ before quote comparison.

## Cross-Source Dependency

A stage can belong to one source while waiting on another source. If a procurement stage belongs to `supply` but waits on `payment::...`, it means the supply lane cannot proceed until the payment lane produces the required result:

```yaml
procurement_execution:
  source: supply
  receiveSignals:
    SUPPLIER_FUNDED: payment::master.supplier_usdc_direct.cmp | master.supplier_settlement_exec.cmp
```

This is a convergence point: the procurement stage belongs to the supply source, but it depends on payment proof.

## Advanced Modeling Examples

### Deal Matching and New Fulfillment Source

Before a deal is matched, seller preparation and buyer preparation may be separate sources. After a deal is matched, a new shared fulfillment source or a new Order instance can be created:

```text
seller-prep source
buyer-prep source
  -> deal matched / order registered
  -> fulfillment source
       -> payment
       -> logistics
       -> delivery
       -> acceptance
```

More complex dynamic matching across multiple parties is usually expressed through a new source, a docked linked Order, or Store/Product workflow.

### Oil Fractionation

Oil fractionation is an example of source branching. After crude oil enters a refinery, it can split into gasoline, diesel, naphtha, lubricants, and other paths. They share the upstream input, but their downstream quality metrics, transport, inventory, buyers, and delivery conditions differ.

```text
crude_intake
  -> fractionation
       -> gasoline source
       -> diesel source
       -> naphtha source
       -> lubricant source
```

### Agricultural Procurement

An agricultural buyer may source oranges from many farmers. If the number of farmers is fixed in the Plan, each farmer path can be explicit. If the number is dynamic, each farmer's harvesting and packing is usually better modeled as a docked linked Order or sub-Zhixu.

```text
collector_intake
  -> farmer_a harvest/pack source
  -> farmer_b harvest/pack source
  -> farmer_c harvest/pack source
  -> collector_aggregation source
       -> grading
       -> consolidated logistics
       -> payment settlement
```

## Boundary Checks

- Role slots describe participant roles; Source describes causal chains.
- Executor describes the runtime handler or submitter; Source describes signal context.
- Supplier is the capability subject organized and endorsed by Store and the Identity Registry; Source is the namespace for hooks and signals.
- A completed deal may form a new source or a new Order.
- Source must be compilable, authorizable, and replayable; it cannot be used as an arbitrary dynamic field.
