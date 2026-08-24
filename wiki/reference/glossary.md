---
title: 核心术语表
type: reference
audience: 全部读者
status: verified
---

# 核心术语表

本页先用普通语言解释项目术语，再给出代码和链上名字。`Zhixu` 是“秩序”的拼音；代码、ABI、DTO、事件和类型名保留英文。

## 核心对象

| 术语 | 普通解释 | 代码或链上对应物 |
| --- | --- | --- |
| UVP / 通用价值协议 | Universal Value Protocol，一套协作协议和产品语言，用来记录被授权的业务信号，以及这些信号带来的状态后果。 | `uvp-eth` 是 EVM/Web3 实现轨道。 |
| 秩序 / Zhixu | 描述“一类订单应该怎么运行”的可复用协作规则书。 | `ZhixuDefinition`、`kind: "Zhixu"`、compiler input。 |
| Plan / 秩序版本 | 某个 Zhixu 编译后的确定性链上版本。 | `OnchainHookPlanArtifact`、`commitPlan()` + `finalizePlan()` 两步注册定稿、`PlanRegistered`。 |
| Order / 订单 | 某个 Plan 的一次具体运行。 | `UVPStateMachine.Order`、`triggerOrderFromOutsideFor()` / `triggerOrderFromSignalFor()`、`OrderRegistered`、`OrderTriggered`。 |
| 凝结核 / Nucleus | 发起、设计并维护某类 Zhixu 的组织核心。它让一类协作规则成形、获得边界并持续维护；可以是团队、组织、项目 owner 或 workflow owner。 | `spec.nucleation.id`、Store 凝结核工作台。 |
| nucleation / 成核上下文 | 成核过程、上下文或字段名，不是主体名。现有 DSL/API 保留这个拼写以避免 public interface 漂移。 | `spec.nucleation.id`、`nucleationId`。 |
| Stage / 阶段 | task pattern 里的一个步骤或执行段。 | `taskPatterns[].stages[]`、`stageIdentifier`、`stageId`。 |
| Task Pattern | Zhixu 里一组可复用阶段。很多例子用 `master` 表示主 task pattern。 | `taskPatterns[].name`。 |
| Supplier | Store 组织的现实或数字主体；能力资料是 Store 链下判断。 | Store metadata、Identity Binding。 |
| Executor | 被选中或当选来处理当前 Order 阶段或提交该阶段 signal 的 Supplier 或 submitter。 | order authorization、stage executor overlay、EIP-712 submitter。 |
| Source | signal 所属的因果命名空间，回答“这个动作进入哪条业务推进线”。 | `source`、`sourceId`、`signalKey`。 |
| Signal | 状态机为某个 Order 接受的最小业务事实。 | `submitSignal()`、`SignalSubmitted`、`SignalRecord`。 |
| Hook | 状态机条件；不是 HTTP webhook，也不是回调。 | `CompiledHook`、`HookStatusChanged`。 |
| Trigger | 会通过 `HookReady` 打开可执行任务的 hook 标记。 | stage `trigger`、`HookReady`。 |
| File Resource | 阶段协议、证据模板、资源清单等链下材料的句柄，不是明文文件存储。 | `fileResources`、resource patch、metadata URI/hash。 |
| OnchainHookPlan | 面向 EVM 注册和材料审核的紧凑链上产物。 | `OnchainHookPlanArtifact`、compact hooks、dependency indexes、selector bindings。 |
| HookPlan IR | 编译器内部中间形态，不再是 Store/import/deploy 的公开流程。 | `compileZhixuOnchainHookPlan()` 内部使用。 |

## 动作与事件

| 术语 | 普通解释 | 代码或链上对应物 |
| --- | --- | --- |
| Identity Binding / 身份绑定 | Store Registry 对现实主体与钱包对应关系作出的可撤销登记，不包含 Plan 或能力材料审核。 | `IdentityBindingRegistered`、`IdentityBindingRevoked`。 |
| Authorization / 授权 | 某个钱包可以为某个 Order 提交特定 source/signal，或执行受控 stage patch。 | `SignalSubmitterAuthorized`、stage patch authorization。 |
| Publisher | 被允许注册 Plan 的注册账户或机制。 | plan publisher allowlist、`commitPlan()` 提交 + `finalizePlan()` 定稿（仅 finalized Plan 可创建 Order）。 |
| Registrar | 创建 trigger order 的账户或机制：订单创建者签名 trigger typed data 创建 Order（现行合约没有 registrar allowlist）。 | `triggerOrderFromOutsideFor()` / `triggerOrderFromSignalFor()`。 <!-- TODO(confirm): Registrar 词条已按现行合约改写，请人工复核对外沟通口径 --> |
| Registry Boundary | 一个 `UVPIdentityRegistry` 地址就是一个身份解析域。首期由 Store 运营一个，未来可配置多个独立合规主体。StateMachine 不读取它。 | `registryAddress`、`bindingId`、`UVPIdentityRegistry.owner()`。 |
| HookReady | trigger hook ready 后发出的事件，表示 Product task 可以打开。 | `HookReady(orderId, hookId, stageId, hookName)`。 |
| Stage Overlay | Order 运行时对 executor 或 resource 的订单级覆盖，不改变 Plan。 | executor/resource patch events。 |
| Stage Patch | 受控的订单动作，用来应用 executor 或 resource overlay；这里的 patch 不是代码补丁。 | `StageExecutorPatchApplied`、`StageResourcePatchApplied`。 |
| Selector Binding | Plan 里声明“某个 stage 可以 patch 哪个目标 stage”的规则。 | selector stage id、target stage id、binding key。 |
| Replay / 重放 | 从链事件重建或校验订单状态。 | statemachine reducer、chain-services projections。 |

## 证据、Proof 与产品术语

| 术语 | 普通解释 | 代码或产品对应物 |
| --- | --- | --- |
| Evidence / 证据 | 支持某个 signal 的链下业务材料或 metadata。 | Product evidence route、object handle、evidence metadata。 |
| Payload Hash | 被提交业务 payload 或 evidence bundle 的指纹。 | signal submission 里的 `payloadHash`。 |
| Metadata URI | 指向链下 metadata、manifest 或 storage reference 的引用。 | `metadataURI`。 |
| Proof | 一条声明如何对应链事件、签名或 hash 的可追踪记录。Product proof row 应包含 tx、block、log、contract、chain id、event 和 payload context。 | Product proof row、event provenance。 |
| Projection / 投影 | 从链事件重建出来、用于展示的读模型。 | chain-services indexer、Product DTO。 |
| Product DTO | 把链上事实翻译成普通用户能读懂的订单、任务、proof 和 trust 视图的数据格式。 | `ZhixuDetailDTO`、`ProductOrderDTO`、`ProductTaskDTO`。 |
| Product BFF | Product Backend-for-Frontend，处理 draft、invite、participant confirmation、authorization building 和 order registration 的产品工作流服务。 | `uvp-chain-services/service/src/product/bff/`。 |
| Signal Container | Product 层对 task、evidence、typed data、signature、submission 和 proof 的包装。 | Product API prepare/submit/proof flow。 |
| Store | 面向凝结核、Supplier、Identity Registry、operator 和 proof 视图的产品工作台。 | `zhixu-store/app`、Store Console API。 |
| Chain Services | 可重建服务层，负责 indexing、projection、proof、relaying、Product API 和 Store API。 | `@uvp-eth/chain-services`。 |

## 进阶与环境术语

| 术语 | 普通解释 | 代码或运行对应物 |
| --- | --- | --- |
| Docked Zhixu / 对接秩序 | 一条 Zhixu 把某个阶段交给另一条可独立运行的 Zhixu。 | `supplierType=zhixu`、`signalMap`、docking events。 |
| `signalMap` | 把 linked Zhixu 的 `str/cmp/err` 输出映射回本地 stage interface。 | `zhixuExecutorConfig.signalMap`。 |
| Periphery Adapter | 围绕核心状态机的资金、担保、付款、agent 或业务系统适配层。 | `uvp-periphery/`。 |
| Relayer | 广播已签名交易、可能代付 gas 的服务或钱包。它不是业务签名者。 | chain-services relayer、`submitSignalFor()`。 |
| EIP-712 | 钱包签结构化业务动作的格式。 | typed data builders、`UVPStateMachineSignal`。 |
| Anvil | 本地开发和协议闭环使用的 EVM 链。 | local Anvil scripts。 |
| Base Sepolia | 公共 EVM 测试网目标，用于 staging/rehearsal claim。 | chain id `84532`。 |

## 关键概念对

| 概念对 | 正确读法 |
| --- | --- |
| Zhixu / Order | Zhixu 是静态设计；Order 是这份设计的一次运行。 |
| Plan / Order | Plan 是被材料审核的版本；Order 是这个 Plan 下的具体运行。 |
| Nucleus / Store operator | 凝结核拥有内部 Zhixu 设计；Store operator 管平台 workflow。 |
| Store or external institution / Authorization | publication 是材料审核；authorization 是提交订单动作的权限。 |
| Supplier / Executor | Supplier 是能力和 trust 身份；Executor 是运行时提交者或处理者。 |
| Evidence / Proof | Evidence 是链下材料或 metadata；proof 是 hash、签名、事件到 Product 展示的追踪记录。 |
| File Resource / Business File | File Resource 是句柄或要求；私有业务文件留在链下。 |
| Relayer / Submitter | Relayer 广播交易；submitter 签业务声明。 |
| Store metadata / 链上事实 | Store metadata 组织材料和 workflow；链上事实来自 registry 和 state-machine 事件。 |
