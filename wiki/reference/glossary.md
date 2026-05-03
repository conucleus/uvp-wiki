# 核心术语表

本页先用中文解释对象，再给出代码和链上名字。`Zhixu` 是“秩序”的拼音；文档正文优先写“秩序 (Zhixu)”，代码、ABI、DTO、事件和类型名保留英文。

| 中文名 | 代码名 | 一句话定义 | 代码或链上对应物 |
| --- | --- | --- | --- |
| 秩序 | `Zhixu` | 凝结核设计出的静态协作定义，描述一类订单怎样运行。 | `ZhixuDefinition`、`kind: "Zhixu"`、compiler input。 |
| 计划 / 秩序版本 | `Plan` | 某个秩序针对 EVM 编译出的确定性链上版本。 | `HookPlanArtifact`、`OnchainHookPlanArtifact`、`registerPlan()`、`PlanRegistered`。 |
| 订单 | `Order` | 某个 Plan 的一次运行实例，保存本次运行的 signal、hook runtime、overlay 和 proof。 | `UVPStateMachine.Order`、`registerOrder()`、`OrderRegistered`。 |
| 凝结核 | `Nucleation` | 发起、设计、维护某类秩序的组织核。 | `spec.nucleation.id`、Store 凝结核工作台。 |
| 供应商 | `Supplier` | 具备某类现实履约能力的主体，可以被 Store 组织并被 trust domain 背书。 | `SupplierDefinition`、`SupplierAttested`、`SupplierRevoked`。 |
| 执行者 | `Executor` | 某个订单、某个阶段实际承接任务或提交 signal 的主体。 | order-level authorization、stage executor overlay、EIP-712 submitter。 |
| 因果链 | `Source` | signal 所属的因果命名空间，用来表达同源串联、分叉和交汇。 | `source`、`sourceId`、`signalKey`。 |
| 信号 | `Signal` | 被授权钱包对某个订单提交的最小业务事实。 | `submitSignal()`、`SignalSubmitted`、`SignalRecord`。 |
| 条件规则 | `Hook` | 从 signal 条件求出阶段是否 ready、wait 或 cancelled 的规则。 | `CompiledHook`、`HookStatusChanged`。 |
| 触发器 | `Trigger` | 被标记为任务入口的 hook，Ready 后发出 `HookReady`。 | stage `trigger`、`HookReady`。 |
| 文件资源 | `File Resources` | 阶段协议、证据模板、资源清单等链下材料的句柄。 | `fileResources`、resource patch、metadata URI/hash。 |
| 信任域 | `Trust Domain` | 对 plan 或 supplier 作出外部背书的治理主体。 | `ZhixuTrustRegistry` domain、`PlanAttested`、`SupplierAttested`。 |
| 授权 | `Authorization` | 某个钱包在某个订单中可以提交哪些 source/signal。 | `SignalSubmitterAuthorized`、stage patch authorization。 |
| 投影 | `Projection` | 从链事件重建出来的读模型，供 Product API、Store、Order App 展示。 | chain-services indexer、Product DTO。 |
| 秩序商店 | `Store` | 凝结核、supplier、trust domain 和 operator 的产品工作台。 | `zhixu-store/app`、Store Console API。 |
| 产品 DTO | `Product DTO` | 把链上事实翻译成普通用户能读懂的订单、任务、proof 和 trust 视图。 | `ZhixuDetailDTO`、`ProductOrderDTO`、`ProductTaskDTO`。 |
| 对接秩序 | `Docked Zhixu` | 一条秩序把某个阶段交给另一条可独立运行的秩序承接。 | `supplierType=zhixu`、`signalMap`、`DockedOrderLinked`、`DockedSignalMapped`、`DockedSignalSubmitted`。 |
| 外围适配器 | `Periphery Adapter` | 围绕核心状态机消费 signal/proof 的资金、担保、agent 或业务系统适配层。 | `uvp-periphery/`、adapter contracts/services。 |

## 最容易混淆的三组词

| 组合 | 正确读法 |
| --- | --- |
| 秩序 (Zhixu) / 订单 (Order) | 秩序是静态设计；订单是这份设计的一次运行。 |
| Supplier / Executor | Supplier 是能力和信任主体；Executor 是当前订单、当前阶段的运行时提交主体。 |
| Store metadata / 链上事实 | Store metadata 组织材料和 workflow；链上事实来自 registry 和 state-machine 事件。 |

## 读代码时的对应关系

```text
静态设计
ZhixuDefinition
  -> HookPlanArtifact
  -> OnchainHookPlanArtifact
  -> PlanRegistered

动态运行
registerOrder
  -> SignalSubmitterAuthorized
  -> SignalSubmitted
  -> HookStatusChanged / HookReady
  -> ProductOrderDTO / ProductTaskDTO
```
