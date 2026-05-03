# Zhixu 作为 Executor

一条 Zhixu 可以作为另一条秩序的 Executor。这不是附属功能，而是 UVP 最重要的组合能力：复杂履约不需要被压成一个巨大的单体订单，可以由多个可认证、可重放的秩序互相 dock。

## 核心模型

```text
parent Zhixu / parent order
  -> stage.executor.supplierType = zhixu
  -> signalMap declares child output mapping
  -> parent trigger opens execution
  -> child Zhixu / child order runs independently
  -> child proof is checked
  -> authorized mapped signal is submitted to parent order
```

父订单和子订单都是独立的 `UVPStateMachine` order。Store/Product 可以保存它们的 docking relation，但不能让 relation metadata 替代任意一边的链事件。

## 为什么要这样设计

真实履约天然分层。矿山 MRO 的主订单不应该内置每一种获客、采购、清关、结算、物流、现场服务细节；这些都可以是独立 Zhixu。父订单只关心“这条子秩序是否开始、完成或失败”，子订单自己关心内部阶段、执行者和证据。

这样带来几个好处：

- 子秩序可以复用：同一条 `customs-clearance` 可以服务很多主订单。
- 子秩序可以治理：自己的 plan hash、trust attestation、supplier network 独立可审计。
- 子秩序可以替换：父订单通过 Store 配置选择某个 active peer Zhixu 版本。
- 子秩序可以保密：父订单不需要看到全部内部文件，只需要可验证 proof 和映射 signal。

## YAML 形态

来自 Africa MRO `payment-settlement` 的 `fiat_bridge` stage：

```yaml
- name: fiat_bridge
  source: settlement
  trigger:
    - ROUTE_FIAT
  receiveSignals:
    ROUTE_FIAT: settlement::payment.route.use_fiat_bridge
  executor:
    supplierType: zhixu
    supplierID: "{{ .fiat_payout_bridge_zhixu_uid }}"
    zhixuExecutorConfig:
      signalMap:
        str: fiat_bridge::payout.start.str
        cmp: fiat_bridge::payout.close.cmp
        err: fiat_bridge::payout.close.err
```

父 stage 的 source 是 `settlement`，但它声明 child Zhixu 输出来自 `fiat_bridge` source。`ROUTE_FIAT` 是父 stage 的 Trigger；`signalMap` 是子秩序输出的解释契约。

## 编译后的语义

compiler 做三件事：

1. 把 `receiveSignals.ROUTE_FIAT` 编译成 `kind=receive` hook，并因为它在 `trigger` 数组里而设为 `trigger=true`。
2. 把 `signalMap.str/cmp/err` 编译成 `kind=signalMap` hooks，当前这些 hooks 的 `trigger=false`。
3. 校验 `signalMap` 必须包含 `str` 和 `cmp`，并且同一个 signalMap 引用一个 source。

compiler 不做三件事：

- 不自动注册 child order。
- 不自动授权 child executor 提交父订单 signal。
- 不自动从 child order 事件读取状态并修改 parent order。

这些是 Product/Store/adapter 的工作，但最终必须回到链上授权 signal。

## Store Docking 工作流

Store 应把 docked Zhixu 管成一个可审核 workflow：

```text
选择 parent stage
  -> 搜索可用 peer Zhixu / supplierType=zhixu subject
  -> 检查 peer plan attestation 和 active version
  -> 校验 signalMap 与 source/signal 是否匹配
  -> 保存 docking session draft
  -> operator review
  -> 发布或绑定到 parent order workflow
  -> 运行时观察 child proof 并桥接 parent signal
```

Sandbox validation 只是试拼，不是发布。正式使用仍需要 plan attestation、order registration、signal authorization 和 proof。

## 父子订单证明

一个好的 docking proof 至少应能回答：

| 问题 | 证明来源 |
| --- | --- |
| 父 stage 为什么开始 | 父 order 的 `HookReady`。 |
| 子秩序是否可信 | 子 plan 的 `PlanAttested` projection。 |
| 子 order 是否注册 | 子 order 的 `OrderRegistered`。 |
| 子执行者是否有权提交 | 子 order authorization 和 active executor overlay。 |
| 子结果是否发生 | 子 order 的 `SignalSubmitted` / hook proof。 |
| 父 order 为什么继续 | 父 order 上被授权 submitter 提交的 mapped signal。 |

Store 可以把这些证明拼成一张履约卡片，但卡片本身不是事实源。

## 常见错误模型

- 错误：父订单直接读 Store 的 child status 字段就继续。
- 正确：child proof 被校验后，授权 submitter 向父订单提交映射 signal。

- 错误：`supplierID` 指到某个 Zhixu 名称就认为可信。
- 正确：Store 显示 peer Zhixu metadata，但 official trust 要看 `ZhixuTrustRegistry` plan/supplier attestation。

- 错误：把子 orderId 当成父 orderId 的 stage 编号。
- 正确：父子订单身份独立，Product/Store 只保存 relation 和 proof reference。
