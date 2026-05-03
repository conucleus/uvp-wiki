# 一个订单故事

这页用一条跨境高价值货物订单串起 UVP 的主路径。先记住一句话：秩序 (Zhixu) 是静态协作设计，订单 (Order) 是这份设计的一次链上运行。故事里的参与者和服务见 [角色地图](actor-map.md)。

## 1. 凝结核设计秩序

凝结核先设计一类可复用的跨境供货秩序：需求确认、供应商寻源、付款路径、物流、清关、现场交付、买方验收。这个静态定义写成 `ZhixuDefinition`：

```text
秩序 (Zhixu)
  -> task patterns
  -> stages
  -> sources
  -> receive/send signals
  -> supplier/executor requirements
  -> file resource handles
```

这里还没有具体订单，也没有任何参与方提交证据。它只是说明“这类协作应该怎样运行”。

## 2. 编译成 Plan

compiler 把秩序编译成 deterministic artifacts：

```text
ZhixuDefinition
  -> HookPlanArtifact
  -> OnchainHookPlanArtifact
  -> registerPlan args
  -> planId / planHash
```

Plan 是秩序的链目标版本。影响语义的字段变化会改变 hash，所以后续审查、注册和订单运行都有稳定边界。

## 3. Trust domain 背书 Plan

官方 trust domain 审查这份 Plan 的材料、hash 和 policy，然后在 `ZhixuTrustRegistry` 发出：

```text
PlanAttested(domainId, planId, planHash, ...)
```

这一步把“可审查材料”变成链上可验证的 plan trust。Store 可以展示申请、审核材料和投影，但 official trusted plan 的依据是 registry 事件。

## 4. 注册订单并写入授权

当某个买方真的要跑一次跨境供货流程时，registrar 在 `UVPStateMachine` 注册订单：

```text
registerOrder(orderId, planId, creator, authorizations)
```

订单绑定一个已注册并被背书的 Plan。`authorizations` 同时写入本订单允许谁提交哪些 source/signal：

```text
SignalSubmitterAuthorized(orderId, sourceId, signalId, submitter, ...)
```

从这一步开始，`orderId` 才代表一次具体运行。

## 5. 参与方提交 signal

被授权的钱包用 EIP-712 签名提交业务 signal，例如物流商提交“清关完成”的证据 hash，买方提交“验收通过”的确认：

```text
submitSignal(orderId, sourceId, signalId, payloadHash, metadataURI, ...)
  -> SignalSubmitted
```

合约按 `(orderId, sourceId, signalId)` first-writer-wins 去重。业务文件留在链下，链上保存 hash、URI、submitter、时间和事件 proof。

## 6. HookReady 生成任务和证明

每个 signal 进入状态机后，合约只评估受影响的 hooks。条件成立时会发出：

```text
HookStatusChanged
HookReady
```

chain-services 从事件重建订单、任务、timeline、proof rows 和 trust projection，再翻译成 `ProductOrderDTO`、`ProductTaskDTO` 给 Store、Order App、executor-kit 使用。

## 可选进阶扩展：另一条秩序承接一个阶段

上面的基础 Order 路径不要求 linked Zhixu。下面是进阶组合模型：一条可独立运行的 Zhixu 为另一条 Zhixu 执行某个阶段。

某些阶段可以交给另一条独立秩序执行，例如清关或付款结算。静态层由 `supplierType=zhixu` 和 `signalMap` 声明：

```text
local stage
  -> peer Zhixu plan
  -> linked order
  -> linked signal proof
  -> mapped local signal
```

当前合约已经提供运行时 docking 事件路径：

```text
DockedOrderLinked
DockedSignalMapped
DockedSignalSubmitted
```

Store/Product 可以先组织 sandbox、contact、operator review 和 proof checklist；一旦进入运行态，两边订单仍各自以 `UVPStateMachine` 事件为事实源。

## 事实来源速查

| 问题 | 事实来源 | 产品展示 |
| --- | --- | --- |
| 这个秩序版本是否可信 | `PlanAttested` / `PlanRevoked` | Store trust badge、Product proof row。 |
| 这个订单是否存在 | `OrderRegistered` | Product order、Store runtime view。 |
| 谁能提交某个动作 | `SignalSubmitterAuthorized`、active executor overlay | task assignment、canSubmit、blocked reason。 |
| 某个动作是否发生 | `SignalSubmitted` | task submitted、timeline、proof row。 |
| 下一步是否 ready | `HookReady` | task inbox、executor-kit watcher。 |
| peer 秩序是否已对接 | `DockedOrderLinked`、`DockedSignalMapped`、`DockedSignalSubmitted` | docking proof、linked runtime view。 |
