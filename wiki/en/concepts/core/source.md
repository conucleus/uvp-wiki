# Source Causal Chain

`source` is the causal context of a signal, meaning the traceable causal chain in which a sequence of signals lives. Hook expressions are written as `source::condition`, and the signals inside the condition are interpreted under that source by default.

The core value of Source is to express three things:

- Same-source chaining: actions in the same business chain move forward in sequence.
- Branching: one input or decision splits into multiple downstream paths.
- Convergence: originally independent paths form a new shared path after a certain event.

## What Source Answers

Source answers “which causal line does this signal belong to.” The same wallet can submit signals on multiple sources; the same Supplier can participate in multiple sources; a single Order can also contain multiple sources.

```text
sourceId = keccak256(source)
signalId = keccak256(signalName)
signalKey = keccak256(abi.encode(sourceId, signalId))
```

On-chain authorization, signal deduplication, and hook dependency resolution all happen around `signalKey`. Therefore, `seller::pack.cmp` and `buyer::pack.cmp` belong to two different business facts even if the signal name is the same.

## Same-Source Chaining

In a supplier-sourcing linked Zhixu, multiple stages progress under the `sourcing` source:

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

## Cross-Source Convergence: A New Source After a Deal

Before a deal is matched, seller orders and buyer orders are two separate sources.

The seller source may already have done substantial preparation:

- stock preparation, quality inspection, packaging, and labeling;
- uploading hashes for inventory proof or packaging photos;
- preparing quotes, lead time, and sellable conditions.

The buyer source may also have done its own preparation:

- budget approval, withdrawal, FX conversion, or stablecoin readiness;
- delivery address, acceptance criteria, and procurement request;
- logistics preference or payment path selection.

Before the deal is matched, the seller and buyer each prepare independently, forming two real causal chains. After the deal is matched, a new shared fulfillment source or a new Order instance appears.

After the deal, a new source or Order instance should be created, such as `trade`, `deal`, or `fulfillment`:

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

After convergence, the Order enters a new shared fulfillment causal chain, which can continue to include logistics, delivery, acceptance, after-sales, or dispute handling.

The current hook DSL expression is a single `source::condition`. If a stage’s `source` is `supply` but it waits on `payment::...`, that means the stage in the supply chain depends on the result of the payment chain:

```yaml
procurement_execution:
  source: supply
  receiveSignals:
    SUPPLIER_FUNDED: payment::master.supplier_usdc_direct.cmp | master.supplier_settlement_exec.cmp
```

This is a convergence point: the procurement execution stage belongs to the supply source, but it must wait for the payment result from the payment source. More complex dynamic matching across multiple parties is usually expressed through a new source, a docked linked Order, or Store/Product workflow.

## Branching: Oil Fractionation

Oil fractionation is the most intuitive example of source branching. After crude oil enters a refinery, it splits into gasoline, diesel, naphtha, lubricants, and other paths. They share the upstream input, but their downstream quality metrics, transport, inventory, buyers, and delivery conditions differ.

```text
crude_intake
  -> fractionation
       -> gasoline source
       -> diesel source
       -> naphtha source
       -> lubricant source
```

In Zhixu, `fractionation` can be a selection or branching stage, and each product line can become a separate source. Each source has its own signals and hooks, and if there is a unified settlement or unified dispatch, they can converge again into a new source.

## Branching Then Rejoining: Agricultural Procurement

An agricultural buyer needs to source oranges from many farmers. Each farmer harvests, inspects, packs, and weighs the fruit, and everything is then gathered back to the buyer for grading, loading, or settlement.

Conceptually:

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

If the number of farmers is fixed in the Plan, it can be written explicitly as multiple branch sources. If the number of farmers is dynamic at runtime, it is more appropriate to model each farmer’s harvesting and packing as a docked linked Order or sub-Zhixu, and then let the collector Order gather them through proof and `signalMap`.

## Source in Cross-Border Supply

In a cross-border supply Zhixu, the main Order may include these sources:

| Source | Causal chain |
| --- | --- |
| `growth` | Acquisition and lead generation. |
| `sales` | Demand confirmation and commercial progress. |
| `solution` | Technical scope and solution confirmation. |
| `supply` | Supplier sourcing, procurement, and delivery preparation. |
| `payment` | Payment-path selection, direct USDC payment, or linked settlement Zhixu. |
| `logistics` | International logistics, customs clearance, and delivery. |
| `field` | On-site installation, commissioning, and acceptance. |
| `buyer` | Buyer commitment and final acceptance. |
| `coordinator` | Exception coordination and closure. |

These sources are namespaces for different causal chains within the same main Order. Some stages make them converge, such as procurement waiting on payment, logistics waiting on procurement, or site installation waiting on logistics.

## Boundary Checks

- Role slots describe participant roles; Source describes causal chains.
- Executor describes the runtime executor or submitter of an Order; Source describes the signal context.
- Supplier is the capability subject organized and endorsed by Store and the trust registry; Source is the namespace for hooks and signals.
- A completed deal may form a new source or a new Order.
- Source must be compilable, authorizable, and replayable; it cannot be used as an arbitrary dynamic field.
