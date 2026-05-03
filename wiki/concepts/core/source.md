# Source 因果链

`source` 是 signal 的因果语境。它不是“谁点了按钮”，也不是“谁付款”，而是把一串 signal 放进同一条可追踪的因果链里。Hook 表达式写成 `source::condition`，condition 里的 signal 默认都在这个 source 下解释。

Source 的核心价值是表达三件事：

- 同源串联：同一条业务链里的动作按顺序推进。
- 分叉：一个输入或决策拆成多条后续链路。
- 交汇：原本独立的链路在某个事件之后形成新的共同链路。

## 不是角色，也不是订单归属

Source 不回答“这是谁的订单”。它回答“这个 signal 属于哪条因果线”。同一个钱包可以在多个 source 上提交 signal；同一个 supplier 也可以参与多个 source；一个 Order 内也可以有多个 source。

```text
sourceId = keccak256(source)
signalId = keccak256(signalName)
signalKey = keccak256(abi.encode(sourceId, signalId))
```

链上授权、signal 去重和 hook dependency 都围绕 `signalKey` 发生。因此 `seller::pack.cmp` 和 `buyer::pack.cmp` 即使 signalName 相同，也不是同一个业务事实。

## 同源串联

供应商寻源linked Zhixu里，多个阶段都在 `sourcing` source 下推进：

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

这里不是三个数据库状态，而是一条寻源因果链：intake 完成后才能 market scan，market scan 完成后才能 RFQ，RFQ 完成后才能 quote compare。

## 异源交汇：成交后产生新的 Source

卖方订单和买方订单在成交前是两个独立 source。

卖方 source 可能已经做了很多准备：

- 备货、质检、包装、贴标；
- 上传库存证明或包装照片的 hash；
- 准备报价、交期和可售条件。

买方 source 也可能已经做了自己的准备：

- 预算审批、取款、换汇或稳定币准备；
- 收货地址、验收标准、采购申请；
- 选择物流偏好或付款路径。

在成交前，卖方不一定要卖给这个买方，买方也不一定必须买这个卖方。两边的准备都是真实因果链，但不能把它们提前写成同一个订单的共同状态。

成交发生后，应该产生新的 source 或新的 order instance，例如 `trade` / `deal` / `fulfillment`：

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

交汇后的订单不能再说“属于卖方 source”或“属于买方 source”。它是一个新的共同履约因果链，里面可以继续包含物流、派送、验收、售后或争议处理。

当前 hook DSL 的表达式是单个 `source::condition`。如果某个 stage 的 `source` 是 `supply`，但它等待 `payment::...`，这表示 supply 链上的阶段依赖 payment 链的结果：

```yaml
procurement_execution:
  source: supply
  receiveSignals:
    SUPPLIER_FUNDED: payment::master.supplier_usdc_direct.cmp | master.supplier_settlement_exec.cmp
```

这是一种交汇点：采购执行阶段属于 supply source，但它必须等 payment source 的付款结果。更复杂的动态多方撮合，应该通过新的 source、docked linked order 或 Store/Product workflow 来表达，不要把成交后的共同履约强塞回卖方或买方 source。

## 分叉：石油分馏

石油分馏是分叉 source 的直观例子。原油进入炼厂后，分出汽油、柴油、石脑油、润滑油等链路。它们共享上游输入，但下游质量指标、运输、库存、买家和交付条件不同。

```text
crude_intake
  -> fractionation
       -> gasoline source
       -> diesel source
       -> naphtha source
       -> lubricant source
```

在 Zhixu 里，可以把 `fractionation` 作为选择或分叉 stage，把不同产物线建成不同 source。每条 source 有自己的 signal 和 hook，最后如果有统一结算或统一出库，也可以再交汇到新的 source。

## 分叉再归拢：农产品收购

农产品收购商要找很多农户采橘子。每个农户都要采收、初检、包装、称重，最后归拢到收购商这里统一分级、装车或结算。

概念上是：

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

如果农户数量在 Plan 里是固定的，可以显式写成多个 branch source。如果农户数量是运行时动态的，更适合把每个农户采收包装建成 docked linked order 或子 Zhixu，再由收购商 order 通过 proof 和 signalMap 归拢。不要为了动态农户列表在一个静态 Plan 里制造不可审计的任意 source。

## 跨境供货里的 Source

一个跨境供货秩序里，主订单可以包含这些 source：

| Source | 因果链 |
| --- | --- |
| `growth` | 获客和线索生成。 |
| `sales` | 需求确认和商业推进。 |
| `solution` | 技术范围和方案确认。 |
| `supply` | 供应商寻源、采购和交付准备。 |
| `payment` | 付款路径选择、USDC 直付或结算linked Zhixu。 |
| `logistics` | 国际物流、清关、派送。 |
| `field` | 现场安装、调试和验收。 |
| `buyer` | 买方承诺和最终接受。 |
| `coordinator` | 异常协调和关闭。 |

这些 source 不是部门表，而是同一个主订单里不同因果链的命名空间。某些 stage 会让它们交汇，例如采购等支付、物流等采购、现场安装等物流。

## 常见误解

- Source 不是 role slot。买家、卖家、物流商都可以在不同 source 中提交 signal。
- Source 不是 executor。executor 是订单运行时的执行者或 submitter。
- Source 不是 supplier。supplier 是被 Store 和 trust registry 组织、背书的能力主体。
- Source 不是“订单归属”。成交后的履约可以形成新的 source 或新的 order。
- Source 不是任意动态字段。需要可编译、可授权、可重放。
