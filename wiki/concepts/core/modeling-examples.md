---
title: Source 建模例子集
type: explanation
audience: 工程贡献者
preread: source.md
status: prototype
---

# Source 建模例子集

本页收录 Source 因果链的进阶建模示例。status 标为 prototype：这些例子是教学性质的建模思路，尚未逐例对照实现与产品投影审计；协议语义以 [Source 因果链](source.md) 为准。

## 谁使用

工程贡献者和凝结核设计者，在为多线并行业务划分 source 时参考这些例子。

## 产生什么结果

每个例子给出一种 source 拓扑（新增、分叉、动态汇聚），用于指导 Zhixu stage 的 `source` 字段与 Hook 表达式设计，不直接对应任何已注册 Plan。

## 权威来自哪里

例子只是建模建议；协议语义和 `signalKey` 规则以 [Source 因果链](source.md) 与 compiler 实现为准。

## 成交撮合与新的履约 Source

成交前，卖方准备和买方准备可以是两条独立 source。成交后，可以产生新的共同履约 source，或创建一个新的 Order instance：

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

更复杂的动态多方撮合，通常通过新的 source、docked linked Order 或 Store/Product workflow 表达。

## 石油分馏

石油分馏是 source 分叉的例子。原油进入炼厂后，可以分出汽油、柴油、石脑油、润滑油等路径。它们共享上游输入，但下游质量指标、运输、库存、买家和交付条件不同。

```text
crude_intake
  -> fractionation
       -> gasoline source
       -> diesel source
       -> naphtha source
       -> lubricant source
```

## 农产品收购

农产品收购商可能从很多农户采购橘子。如果农户数量在 Plan 里固定，可以显式建多条 farmer source。如果农户数量是运行时动态的，每个农户的采收包装通常更适合建成 docked linked Order 或子 Zhixu。

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
