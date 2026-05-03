# Zhixu 作为 Executor

一条 Zhixu 可以作为另一条 Zhixu 的 stage executor。这里的 executor 是执行接口：它接收本地秩序开放的阶段任务，按自己的规则运行，并把约定信号映射回本地秩序。

## 核心模型

```text
local Zhixu / local order
  -> stage.executor.supplierType = zhixu
  -> signalMap declares linked signal mapping
  -> local trigger opens execution
  -> linked Zhixu / linked order runs with its own plan and authorization
  -> linked proof is checked
  -> authorized mapped signal is submitted to local order
```

local order 和 linked order 都是独立的 `UVPStateMachine` order。它们各自有自己的 plan、授权、事件、proof 和生命周期。Docking relation 说明两条秩序之间哪些 signal 可以对接；运行态关系由 docking link 和 mapped signal 事件记录。

## 为什么要这样设计

真实履约经常由多个独立秩序协作完成。跨境供货的本地秩序可以把寻源、清关、结算、物流、现场交付分别交给不同 Zhixu 执行。local order 不需要展开 linked Zhixu 的全部内部流程，只需要知道它暴露的 signal 接口、proof 和 trust 状态。

这样带来几个好处：

- linked Zhixu 可以复用：同一条 `customs-clearance` 可以服务很多 local order。
- linked Zhixu 可以独立治理：自己的 plan hash、trust attestation、supplier network 可审计。
- linked Zhixu 可以独立演进：local order 通过 Store 配置选择某个 active peer Zhixu 版本。
- linked Zhixu 可以保留内部上下文：local order 只消费可验证 proof 和映射 signal。

## YAML 形态

一个结算 stage 可以这样把另一条 Zhixu 作为执行接口：

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

本地 stage 的 source 是 `settlement`。它选择一条 linked Zhixu 作为 executor，并声明 linked Zhixu 输出的 `str/cmp/err` 如何映射成本地秩序可消费的信号。

如果这个对接阶段由订单外部的 Product/registrar workflow 直接打开，而不是等待上一条业务 signal，可以把 link stage entrance 写成 `::OUTSIDE`：

```yaml
- name: dock_customs_clearance
  source: customs
  trigger:
    - LINK_READY
  receiveSignals:
    LINK_READY: ::OUTSIDE
  executor:
    supplierType: zhixu
    supplierID: "{{ .customs_clearance_zhixu_uid }}"
    zhixuExecutorConfig:
      signalMap:
        str: customs_peer::clearance.start.str
        cmp: customs_peer::clearance.close.cmp
        err: customs_peer::clearance.close.err
```

`LINK_READY` 只是打开本地对接 workflow 的 trigger。linked order 的开始、完成或失败仍然通过 `signalMap`、docking link、proof 校验和授权 mapped signal 回填到本地 order。

## 运行时证明

一个完整的 docked Zhixu proof 至少覆盖：

| 问题 | 证明来源 |
| --- | --- |
| local stage 为什么开放执行 | local order 的 `HookReady`。 |
| link stage 的外部入口是谁打开的 | `::OUTSIDE` signal 的订单级授权和提交事件，或上一条业务 signal 的 proof。 |
| linked Zhixu 使用哪个计划 | linked order 的 `OrderRegistered` 和 linked plan projection。 |
| linked Zhixu 是否被背书 | linked plan 的 `PlanAttested` projection。 |
| linked order 如何推进 | linked order 的 `SignalSubmitted` / hook proof。 |
| local order 如何继续 | local order 上的 mapped signal，来源可以是授权 submitter 或 `DockedSignalSubmitted`。 |

Store 可以把这些 proof 拼成一张履约卡片；状态真相仍来自两边各自的链上事件。

## Store Docking 工作流

Store 应把 docked Zhixu 管成一个可审核 workflow：

```text
选择 local stage
  -> 搜索可用 peer Zhixu / supplierType=zhixu subject
  -> 检查 linked plan attestation 和 active version
  -> 校验 signalMap 与 source/signal 是否匹配
  -> 保存 docking session draft
  -> operator review
  -> 发布或绑定到 local order workflow
  -> linkDockedOrder 记录 local/linked relation
  -> submitDockedSignal 或授权 submitter 映射 local signal
```

Sandbox validation 是试拼和审核材料。正式运行需要 plan attestation、order registration、signal authorization、docking link 和 proof。
