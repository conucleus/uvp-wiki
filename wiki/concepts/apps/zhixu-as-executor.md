---
title: Zhixu 作为 Executor
type: explanation
audience: 协议读者、集成工程师
preread: ../core/executor.md
status: verified
---

# Zhixu 作为 Executor

> 前置阅读：[Executor](../core/executor.md)
一条 Zhixu 可以作为另一条 Zhixu 的 stage executor。这里的 executor 是执行接口：它接收本地秩序开放的阶段任务，按自己的规则运行，并把约定信号映射回本地秩序。

## 核心模型

```text
local Zhixu / local order
  -> stage.executor.supplierType = zhixu
  -> zhixuExecutorConfig.target selects an immutable peer UID/version
  -> inputMap/signalMap bind local hooks/signals to target port names
  -> local receive hook becomes ready and opens execution
  -> linked Zhixu / linked order runs with its own plan and authorization
  -> linked proof is checked
  -> authorized mapped signal is submitted to local order
```

local order 和 linked order 都是独立的 `UVPStateMachine` order。它们各自有自己的 plan、授权、事件和 proof，不共享也不需要聚合生命周期状态。Docking relation 说明两条秩序之间哪些 signal 可以对接；运行态关系由 docking link 和 mapped signal 事件记录。

## 为什么要这样设计

真实履约经常由多个独立秩序协作完成。跨境供货的本地秩序可以把寻源、清关、结算、物流、现场交付分别交给不同 Zhixu 执行；嵌套也允许：本地结算 stage 可以选择 `payment-settlement` 这条 Zhixu 作为 executor，而 `payment-settlement` 内部的 `fiat_bridge` stage 又可以选择 `fiat-payout-bridge` 作为 executor。local order 不需要展开 linked Zhixu 的全部内部流程，只需要知道它暴露的 signal 接口、proof 和 trust 状态。

这样带来几个好处：

- linked Zhixu 可以复用：同一条 `customs-clearance` 可以服务很多 local order。
- linked Zhixu 可以独立治理：自己的 plan hash、trust publication、supplier network 可审计。
- linked Zhixu 可以独立演进：local order 通过 Store 配置选择某个 active peer Zhixu 版本。
- linked Zhixu 可以保留内部上下文：local order 只消费可验证 proof 和映射 signal。

## YAML 形态

一个结算 stage 可以这样把另一条 Zhixu 作为执行接口：

```yaml
- name: fiat_bridge
  source: settlement
  receiveSignals:
    ROUTE_FIAT: settlement::payment.route.use_fiat_bridge
  executor:
    supplierType: zhixu
    zhixuExecutorConfig:
      schemaVersion: uvp.dock.v1
      target:
        zhixu: fiat-payout-bridge
        version: "1"
      order:
        idPolicy: derived-v1
      inputMap:
        ROUTE_FIAT: payout
      signalMap:
        str: payout_started
        cmp: payout_completed
        err: payout_failed
```

本地 stage 的 source 是 `settlement`；`str/cmp/err` 各字段的确切语义见下文 [signalMap 的协议含义](#signalmap-的协议含义)。

对接阶段的入口仍然必须是本地 `receiveSignals` hook；如果它订阅另一个域的事实，使用 `::ANCHOR(@source::task.stage.signal)`。不存在独立的 `trigger` 或 `externalSignals` 入口字段：

```yaml
- name: dock_customs_clearance
  source: customs
  receiveSignals:
    LINK_READY: "::ANCHOR(@customs::clearance.entry.ready)"
  executor:
    supplierType: zhixu
    zhixuExecutorConfig:
      schemaVersion: uvp.dock.v1
      target:
        zhixu: customs-clearance
        version: "1"
      order:
        idPolicy: derived-v1
      inputMap:
        LINK_READY: entrance
      signalMap:
        str: started
        cmp: completed
        err: failed
```

`LINK_READY` 是本地订阅 hook 的名称；linked order 的开始、完成或失败仍然通过 `signalMap`、docking link、proof 校验和授权 mapped signal 回填到本地 order。

## signalMap 的协议含义

`signalMap` 是 local stage 接受 linked Zhixu 输出的语义契约。

| 本地 signal key | 语义 |
| --- | --- |
| `str` | linked Zhixu 开始或已接收委托的信号。当前 compiler 要求必须存在。 |
| `cmp` | linked Zhixu 完成的信号。当前 compiler 要求必须存在。 |
| `err` | linked Zhixu 失败、拒绝或异常的信号。可选但大多数真实 workflow 应配置。 |

`signalMap` 的 key 必须是本地 stage 的 `sendSignals`，value 必须是目标端口名；`inputMap` 的 key 必须是本地 `receiveSignals` hook，value 必须是目标入口端口名。编译器会校验 target UID/version、端口方向、恰好一个 entrance、端口名字符集及接口/route roots；`signalMap` 不再承载 Hook DSL。`str` 和 `cmp` 是必填映射，`err` 可选。

## Docked 运行时路径

```text
local order 某个 receive hook Ready
  -> Product/Store 创建 local stage task
  -> Store 选择或确认 peer Zhixu 版本
  -> Product/adapter 注册或定位 linked order
  -> linked order 按自己的 Plan、授权、executor 执行
  -> linked order 产生 str/cmp/err proof
  -> adapter 或 Product workflow 校验 proof 和 signalMap
  -> openDockedOrder / submitDockedInput / submitDockedSignal 或授权 submitter 映射 local signal
  -> local order 对应 hook Ready / Cancelled / next stage
```

编号体系可以并存：链上 local/linked `orderId` 由各自的 trigger order 入口创建；Product task、Store docking session、adapter job 可以有自己的执行编号，运行态 proof 仍回到链上 order/signal/docking events。

## 运行时证明

一个完整的 docked Zhixu proof 至少覆盖：

| 问题 | 证明来源 |
| --- | --- |
| local stage 为什么开放执行 | local order 的 `HookReady`。 |
| link stage 的入口为何有效 | local `HookReady` / `DockOpened` proof，以及目标 entrance port 的 interface/route membership proof。 |
| linked Zhixu 使用哪个计划 | linked order 的 `OrderRegistered` 和 linked plan projection。 |
| linked Zhixu 的 Plan 是否可用 | linked StateMachine 的 `PlanCommitted/PlanFinalized` projection。 |
| linked order 如何推进 | linked order 的 `SignalSubmitted` / hook proof。 |
| local order 如何继续 | local order 上的 mapped signal，来源可以是授权 submitter 或 `DockOutputSubmitted`。 |

Store 可以把这些 proof 拼成一张履约卡片；状态真相仍来自两边各自的链上事件。

## Store Docking 工作流

Store 应把 docked Zhixu 管成一个可审核 workflow：

```text
选择 local stage
  -> 搜索可用 peer Zhixu UID/version
  -> 检查 linked plan publication 和 active version
  -> 校验 inputMap/signalMap 与目标端口及 interface/route roots 是否匹配
  -> 保存 docking session draft
  -> operator review
  -> 发布或绑定到 local order workflow
  -> openDockedOrder 记录 local/linked relation
  -> submitDockedSignal 或授权 submitter 映射 local signal
```

Sandbox validation 是试拼和审核材料。正式运行需要 plan publication、order registration、signal authorization、docking link 和 proof。
