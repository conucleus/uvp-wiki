# Source 因果链

`source` 是 signal 的因果推进线。它回答：“这个业务动作属于哪条推进线？”角色、Supplier 和钱包说明谁在行动；Source 说明这个动作进入哪条业务推进线。

可以先把 source 当作一笔项目里的多条 lane：sales、solution、supply、payment、logistics、field、buyer 可以并行推进，也可以在某个阶段等待另一条 lane 的 proof 后交汇。这些 source 不是部门。一个钱包只要被授权，可以在多个 source 上提交 signal；同一个 Supplier 也可以参与多个 source。

Hook 表达式写成 `source::condition`，condition 里的 signal 默认都在这个 source 下解释。

工程细节：

```text
sourceId = keccak256(source)
signalId = keccak256(signalName)
signalKey = keccak256(abi.encode(sourceId, signalId))
```

链上授权、signal 去重和 hook dependency 都围绕 `signalKey` 发生。因此 `seller::pack.cmp` 和 `buyer::pack.cmp` 即使 signal 名字相同，也属于两个不同的业务事实。

## 一条跨境订单里的 Source

一条跨境供货 Order 里，多条因果线可以并行推进，并在特定 hook 上交汇：

| Source | 现实推进线 | 示例 signal | 常见提交者 | 后续依赖 |
| --- | --- | --- | --- | --- |
| `sales` | 商务需求、报价和买方沟通。 | `master.commercial_offer.cmp` | sales 或买方侧 operator。 | 买方承诺任务可以打开。 |
| `solution` | 技术范围和方案确认。 | `master.technical_scope.cmp` | solution engineer。 | 供应商寻源可以打开。 |
| `supply` | supplier sourcing 和采购准备。 | `master.supplier_sourcing.cmp` | procurement executor。 | logistics 或 payment 任务可能等待它。 |
| `payment` | 付款路径、资金准备或 settlement adapter 结果。 | `master.supplier_usdc_direct.cmp` | payment executor 或 adapter。 | 采购执行可能要求付款 proof。 |
| `logistics` | 国际物流和清关。 | `master.customs_clearance.cmp` | logistics/customs executor。 | delivery 或 field work 可以打开。 |
| `field` | 现场交付、安装或调试。 | `master.site_acceptance.cmp` | field executor 或买方代表。 | 最终验收可以打开。 |
| `buyer` | 买方承诺和验收。 | `master.acceptance.cmp` | buyer wallet。 | 订单关闭或售后分支。 |

Source 是 hooks 和 signals 使用的命名空间，让状态机能重放正确的因果线。

## 同源串联

供应商寻源 linked Zhixu 里，多个阶段可以都在 `sourcing` source 下推进：

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

这里表达一条寻源因果链：intake 完成后才能 market scan，market scan 完成后才能 RFQ，RFQ 完成后才能 quote comparison。

## 跨 Source 依赖

一个 stage 可以属于某个 source，同时等待另一个 source 的结果。如果采购阶段属于 `supply`，但等待 `payment::...`，意思是 supply 这条线必须等 payment 这条线产生所需结果：

```yaml
procurement_execution:
  source: supply
  receiveSignals:
    SUPPLIER_FUNDED: payment::master.supplier_usdc_direct.cmp | master.supplier_settlement_exec.cmp
```

这是一个交汇点：采购执行阶段属于 supply source，但它依赖 payment proof。

## 进阶建模例子

### 成交撮合与新的履约 Source

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

### 石油分馏

石油分馏是 source 分叉的例子。原油进入炼厂后，可以分出汽油、柴油、石脑油、润滑油等路径。它们共享上游输入，但下游质量指标、运输、库存、买家和交付条件不同。

```text
crude_intake
  -> fractionation
       -> gasoline source
       -> diesel source
       -> naphtha source
       -> lubricant source
```

### 农产品收购

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

## 边界检查

- Role slot 描述参与角色；Source 描述因果链。
- Executor 描述运行时处理者或提交者；Source 描述 signal 语境。
- Supplier 是被凝结核组织、由 Store 维护能力资料的参与主体；Source 是 hook/signal 命名空间。
- 成交后的履约可以形成新的 source 或新的 Order。
- Source 必须可编译、可授权、可重放，不能当作任意动态字段使用。
