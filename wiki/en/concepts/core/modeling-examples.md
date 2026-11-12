---
title: Source Modeling Examples
type: explanation
audience: 工程贡献者
preread: source.md
status: prototype
---

# Source Modeling Examples

> Prerequisite reading: [Source Causal Chain](source.md)
This page collects advanced modeling examples for Source causal chains. Status is marked prototype: these examples are teaching-oriented modeling ideas, not yet audited example-by-example against implementations and product projections; for protocol semantics, [Source Causal Chain](source.md) and the language-layer manual `uvp-core/docs/zhixu-dsl-grammar.md` are authoritative.

## Who Uses It

Engineering contributors and nucleus designers, as reference material when dividing sources for multi-lane parallel businesses.

## What It Produces

Each example gives one source topology (addition, forking, dynamic convergence), used to guide the `source` field and Hook expression design of Zhixu stages; none maps directly to any registered Plan.

## Where Authority Comes From

The examples are modeling advice only; protocol semantics and `signalKey` rules follow [Source Causal Chain](source.md) and the compiler implementation.

## Deal Matching and a New Fulfillment Source

Before a deal, seller preparation and buyer preparation can be two independent sources. After the deal, a new joint fulfillment source can emerge, or a birth signal (`sendSignals[].trigger: true`) can derive a new Order with an empty order id:

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

More complex dynamic multi-party matching is usually expressed through new sources, in-order hooks, or the combination of "independent orders + static Dock subscription".

## Petroleum Fractionation

Petroleum fractionation is an example of source forking. After crude oil enters a refinery, it splits into gasoline, diesel, naphtha, lubricant, and other paths. They share upstream inputs but differ in downstream quality metrics, transport, inventory, buyers, and delivery terms.

```text
crude_intake
  -> fractionation
       -> gasoline source
       -> diesel source
       -> naphtha source
       -> lubricant source
```

The fractionation modeling pattern is per-fact order birth: each incoming birth fact is declared as a birth signal on its stage, and submitting it with an empty order id derives one order (language manual §6).

## Produce Collection

A produce collector may buy oranges from many farms. If the number of farms is fixed in the Plan, multiple explicit farmer sources can be modeled. If the farm count is dynamic at runtime, each farm's harvest-and-pack flow fits better as an independent order, with the B side publishing a static Dock that reports farmer completion facts back to the collector order (`executor.supplierType: dock` + runtime binding).

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

Cross-order emission conditions are declared by the separate `kind: Dock` document's `signalMap`; Dock does not create orders, and "all collected or not" is the anchoring executor's private judgment — see [Executor](executor.md).
