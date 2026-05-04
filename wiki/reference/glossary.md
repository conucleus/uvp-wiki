# 核心术语表

本页先用普通语言解释项目术语，再给出代码和链上名字。`Zhixu` 是“秩序”的拼音；代码、ABI、DTO、事件和类型名保留英文。

## 核心对象

| 术语 | 普通解释 | 代码或链上对应物 |
| --- | --- | --- |
| UVP / 通用价值协议 | Universal Value Protocol，一套协作协议和产品语言，用来记录被授权的业务信号，以及这些信号带来的状态后果。 | `uvp-eth` 是 EVM/Web3 实现轨道。 |
| 秩序 / Zhixu | 描述“一类订单应该怎么运行”的静态协作定义。 | `ZhixuDefinition`、`kind: "Zhixu"`、compiler input。 |
| Plan / 秩序版本 | 某个 Zhixu 编译后的确定性版本，再降到具体链目标。 | `HookPlanArtifact`、`EvmHookPlanArtifact`、`OnchainHookPlanArtifact`、`registerPlan()`、`PlanRegistered`。 |
| Order / 订单 | 某个 Plan 的一次具体运行。 | `UVPStateMachine.Order`、`registerOrder()`、`OrderRegistered`。 |
| 凝结核 / Nucleation | 发起、设计并维护某类 Zhixu 的组织主体。例如采购团队可以拥有跨境采购 Zhixu。 | `spec.nucleation.id`、Store 凝结核工作台。 |
| Stage / 阶段 | task pattern 里的一个步骤或执行段。 | `taskPatterns[].stages[]`、`stageIdentifier`、`stageId`。 |
| Task Pattern | Zhixu 里一组可复用阶段。 | `taskPatterns[].name`。 |
| Supplier | 具备现实履约能力的主体，可以被 Store 组织并被 trust domain 背书。 | `SupplierDefinition`、`SupplierAttested`、`SupplierRevoked`。 |
| Executor | 当前 Order 某个阶段的实际处理者，或提交该阶段 signal 的主体。 | order authorization、stage executor overlay、EIP-712 submitter。 |
| Source | signal 所属的因果命名空间，回答“这个动作进入哪条业务推进线”。 | `source`、`sourceId`、`signalKey`。 |
| Signal | 状态机为某个 Order 接受的最小业务事实。 | `submitSignal()`、`SignalSubmitted`、`SignalRecord`。 |
| Hook | 状态机条件；不是 HTTP webhook，也不是回调。 | `CompiledHook`、`HookStatusChanged`。 |
| Trigger | 会通过 `HookReady` 打开可执行任务的 hook 标记。 | stage `trigger`、`HookReady`。 |
| File Resource | 阶段协议、证据模板、资源清单等链下材料的句柄，不是明文文件存储。 | `fileResources`、resource patch、metadata URI/hash。 |
| HookPlan | 编译后的人类可读产物，包含 hooks、dependencies、routes 和审计标签。 | `HookPlanArtifact`。 |
| OnchainHookPlan | 面向 EVM 注册和背书的紧凑链上产物旧名。 | `EvmHookPlanArtifact`、`OnchainHookPlanArtifact`、compact hooks、dependency indexes。 |
| Solana target | 预留的未来链目标边界；在 Solana programs、adapters、signer support 和 release evidence 完成前不可运行。 | `SolanaHookPlanArtifact`、`chainTarget: "solana"`、TODO errors。 |

## 动作与事件

| 术语 | 普通解释 | 代码或链上对应物 |
| --- | --- | --- |
| Attestation / 背书 | trust domain 对 plan 或 supplier 作出的可信声明。 | `PlanAttested`、`SupplierAttested`。 |
| Authorization / 授权 | 某个钱包可以为某个 Order 提交特定 source/signal，或执行受控 stage patch。 | `SignalSubmitterAuthorized`、stage patch authorization。 |
| Publisher | 被允许注册 Plan 的主体。 | plan publisher allowlist、`registerPlan()`。 |
| Registrar | 被允许注册 Order，并写入初始 signal authorization 的主体。 | order registrar allowlist、`registerOrder()`。 |
| Official Domain | 用于 plan registration 检查的 trust domain。其他 domain 可以展示，但这个 domain 决定 `registerPlan()` 是否通过。 | `officialDomainId`、`ZhixuTrustRegistry`。 |
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
| Product BFF | 处理 draft、invite、participant confirmation、authorization building 和 order registration 的产品工作流服务。 | `uvp-chain-services/service/src/product/bff/`。 |
| Signal Container | Product 层对 task、evidence、typed data、signature、submission 和 proof 的包装。 | Product API prepare/submit/proof flow。 |
| Store | 面向凝结核、Supplier、trust domain、operator 和 proof 视图的产品工作台。 | `zhixu-store/app`、Store Console API。 |
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

## 不要混淆

| 概念对 | 正确读法 |
| --- | --- |
| Zhixu / Order | Zhixu 是静态设计；Order 是这份设计的一次运行。 |
| Plan / Order | Plan 是被背书的版本；Order 是这个 Plan 下的具体运行。 |
| Nucleation / Store operator | Nucleation 拥有内部 Zhixu 设计；Store operator 管平台 workflow。 |
| Trust Domain / Authorization | Attestation 是背书；authorization 是提交订单动作的权限。 |
| Supplier / Executor | Supplier 是能力和 trust 身份；Executor 是运行时提交者或处理者。 |
| Evidence / Proof | Evidence 是链下材料或 metadata；proof 是 hash、签名、事件到 Product 展示的追踪记录。 |
| File Resource / Business File | File Resource 是句柄或要求；私有业务文件留在链下。 |
| Relayer / Submitter | Relayer 广播交易；submitter 签业务声明。 |
| Store metadata / 链上事实 | Store metadata 组织材料和 workflow；链上事实来自 registry 和 state-machine 事件。 |
