---
title: Source 建模例子集
type: explanation
audience: 工程贡献者
preread: source.md
status: prototype
---

# Source 建模例子集

> 前置阅读：[Source 因果链](source.md)
本页收录 Source 因果链的进阶建模示例。status 标为 prototype：这些例子是教学性质的建模思路，尚未逐例对照实现与产品投影审计；协议语义以 [Source 因果链](source.md) 与语言层正本 `uvp-core/docs/zhixu-dsl-grammar.md` 为准。

## 谁使用

工程贡献者和凝结核设计者，在为多线并行业务划分 source 时参考这些例子。

## 产生什么结果

每个例子给出一种 source 拓扑（新增、分叉、动态汇聚），用于指导 Zhixu stage 的 `source` 字段与 Hook 表达式设计，不直接对应任何已注册 Plan。

## 权威来自哪里

例子只是建模建议；协议语义和 `signalKey` 规则以 [Source 因果链](source.md) 与 compiler 实现为准。

## 成交撮合与新的履约 Source

成交前，卖方准备和买方准备可以是两条独立 source。成交后，可以产生新的共同履约 source，或经出生信号（`sendSignals[].trigger: true`）以空订单号派生一单新的 Order：

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

更复杂的动态多方撮合，通常通过新的 source、订单内同单 hook、或“独立订单 + 静态 Dock 订阅”组合表达。

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

分馏的建模范式是逐事实开单：每条进入的出生事实在对应阶段声明为出生信号，以空订单号提交即派生一单（见语言层正本 §6）。

## 农产品收购

农产品收购商可能从很多农户采购橘子。如果农户数量在 Plan 里固定，可以显式建多条 farmer source。如果农户数量是运行时动态的，每个农户的采收包装更适合建成独立订单，再由 B 侧发布静态 Dock 声明把农户完成事实回传到收购订单（`executor.supplierType: dock` + 运行期 binding）。

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

跨秩序回传的发射条件由独立 `kind: Dock` 文档的 `signalMap` 声明，Dock 不创建订单；收齐没满是锚定执行器的私有判断，见 [Executor](executor.md)。
