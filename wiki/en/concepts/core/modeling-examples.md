---
title: Source Modeling Examples
type: explanation
audience: 工程贡献者
preread: source.md
status: prototype
---

# Source Modeling Examples

> Prerequisite reading: [Source Causal Chain](source.md)
This page collects advanced modeling examples for Source causal chains. Status is marked prototype: these examples are teaching-oriented modeling ideas, not yet audited example-by-example against implementations and product projections; for protocol semantics, [Source Causal Chain](source.md) is authoritative.

## Who Uses It

Engineering contributors and nucleus designers, as reference material when dividing sources for multi-lane parallel businesses.

## What It Produces

Each example gives one source topology (addition, forking, dynamic convergence), used to guide the `source` field and Hook expression design of Zhixu stages; none maps directly to any registered Plan.

## Where Authority Comes From

The examples are modeling advice only; protocol semantics and `signalKey` rules follow [Source Causal Chain](source.md) and the compiler implementation.

## Deal Matching and a New Fulfillment Source

Before a deal, seller preparation and buyer preparation can be two independent sources. After the deal, a new joint fulfillment source can emerge, or a new Order instance can be created:

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

More complex dynamic multi-party matching is usually expressed through new sources, docked linked Orders, or Store/Product workflows.

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

## Produce Collection

A produce collector may buy oranges from many farms. If the number of farms is fixed in the Plan, multiple explicit farmer sources can be modeled. If the farm count is dynamic at runtime, each farm's harvest-and-pack flow usually fits better as a docked linked Order or sub-Zhixu.

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
