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
| [秩序 / Zhixu](../concepts/core/zhixu.md) | 描述“一类订单应该怎么运行”的可复用协作规则书。 | `ZhixuDefinition`、`kind: "Zhixu"`、compiler input。 |
| [Plan](../concepts/core/plan.md) / 秩序版本 | 某个 Zhixu 编译后的确定性链上版本。 | `OnchainHookPlanArtifact`、`commitPlan()` + `finalizePlan()` 两步注册定稿、`PlanRegistered`。 |
| [Order](../concepts/core/order.md) / 订单 | 某个 Plan 的一次具体运行。 | `UVPStateMachine.Order`、`submitSignal(orderId=0)`（唯一出生入口）、`OrderRegistered`、`OrderTriggered`。 |
| [Dock](../concepts/state-machine/docking.md) | B 侧发布的静态 A→B 时间窗订阅：声明“B 的哪个阶段的哪条输出信号，在 A 的哪条 source 上满足什么事实条件时发射”。Dock 不创建订单。 | `kind: "Dock"`、`spec.from` / `spec.to` / `spec.signalMap`、`uvp.dock.v1`、`UVPDockRegistry.registerDock`。 |
| dkid | Dock 的内容派生身份：同一内容跨环境得到同一身份；链上按右补零的 32-byte word 使用。 | `zd-<32hex>`（`dkid`）、`dkid = bytes32(bytes16(docHash))`、`getDock(dkid)`。 |
| [凝结核 / Nucleus](../concepts/core/nucleation.md) | 发起、设计并维护某类 Zhixu 的组织核心。它让一类协作规则成形、获得边界并持续维护；可以是团队、组织、项目 owner 或 workflow owner。 | `spec.nucleation.id`、Store 凝结核工作台。 |
| nucleation / 成核上下文 | 成核过程、上下文或字段名，不是主体名。现有 DSL/API 保留这个拼写以避免 public interface 漂移。 | `spec.nucleation.id`、`nucleationId`。 |
| Stage / 阶段 | 秩序 (Zhixu) 里的一个步骤或执行段，stage 名在秩序内全局唯一。 | `spec.stages[]`、`stageIdentifier`、`stageId`。 |
| [Supplier](../concepts/core/supplier.md) | Store 组织的现实或数字主体；能力资料是 Store 链下判断。 | Store metadata、`UVPIdentityRegistry` supplier 命名空间的 SID/account/status。 |
| [Executor](../concepts/core/executor.md) | 处理当前 Order 阶段或提交该阶段 signal 的角色；链上不实体化。 | `stage -> supplierId` 指派、`accountOf(supplierId)`、EIP-712 submitter。 |
| dock 执行者 | 承接 B 侧 dock 阶段订单执行的主体；订单在挂接 stage 经 stage patch 一次性选定后固定。 | `HOOK_FLAG_DOCK_EXECUTOR`、`selectStageDockSupplier` / `selectStageDockSupplierFor`、`StageDockSupplierSelected`。 |
| [Source](../concepts/core/source.md) | signal 所属的因果命名空间，回答“这个动作进入哪条业务推进线”。 | `source`、`sourceId`、`signalKey`。 |
| [Signal](../concepts/core/signal.md) | 状态机为某个 Order 接受的最小业务事实。 | `submitSignal()`、`SignalSubmitted`、`SignalRecord`。 |
| [Hook](../concepts/core/hook.md) | 状态机条件；不是 HTTP webhook，也不是回调。 | `CompiledHook`、`HookStatusChanged`。 |
| [Trigger](../concepts/core/trigger.md) | 订单入口语义：stage 的出生信号合成 order-trigger hook；`orderTriggerKind` 闭集为 `none`/`trigger`，`emitReady` 独立控制是否发出可执行任务的 `HookReady`。 | `sendSignals[].trigger`、`orderTriggerKind`、`triggers[]`、`emitReady`、`HookReady`。 |
| Trigger signal / 出生信号 | stage 出生信号集合中的 sendSignal；以空 `orderId` 提交并过 admission 后创建订单、写入首事实。 | `trigger: true`、`SignalAdmissionRejected`、`NotTriggerSignal`。 |
| [File Resource](../concepts/core/file-resources.md) | 阶段协议、证据模板、资源清单等链下材料的声明，不是明文文件存储。 | `fileResources`、`StageFile{key,payload}`、`StageFileWritten`。 |
| OnchainHookPlan | 面向 EVM 注册和材料审核的紧凑链上产物。 | `OnchainHookPlanArtifact`、compact hooks、dependency indexes、selector bindings、派生 `triggers[]`。 |
| HookPlan IR | 编译器内部中间形态，不是 Store/import/deploy 的公开流程。 | `compileZhixuOnchainHookPlan()` 内部使用。 |

## 动作与事件

| 术语 | 普通解释 | 代码或链上对应物 |
| --- | --- | --- |
| [Identity Binding](../concepts/contracts-and-registries.md) / 身份绑定 | Store Registry 对现实主体与钱包对应关系作出的可撤销登记，不包含 Plan 或能力材料审核。 | `IdentityBindingRegistered`、`IdentityBindingRevoked`。 |
| Execution Authority / 发信权 | 某个 supplier account 可以为某个 Order 的特定阶段提交 signal，或执行受控 stage supplier patch。 | `stage -> supplierId`、`UVPIdentityRegistry.accountOf`、`StageSupplierPatchApplied`。 |
| [Publisher](../concepts/lifecycle.md) | 以自有密钥签署 Plan commit 的账户或机制：协议层不设 publisher 白名单，发布面 permissionless（谁能作为 publisher 对外发布属 Store/治理域的准入判断）。 | `commitPlan()` 提交 + `finalizePlan()` 定稿（仅 finalized Plan 可创建 Order）。 |
| [Registrar](../concepts/lifecycle.md) | 创建 trigger order 的账户或机制：出生阶段当前生效的 assigned supplier account 以 `UVPStateMachineSignalSubmission` 签名提交；合约不设 registrar allowlist，按 `(submitter, idempotencyKey)` 去重。 | `submitSignal(orderId=0)`（`UVPStateMachine`）、`DuplicateTriggerKey`。 |
| [Registry Boundary](../concepts/contracts-and-registries.md) | 一个 `UVPIdentityRegistry` 就是 StateMachine 接线的唯一链上身份边界，含 subject 与 supplier 两个命名空间；supplier 命名空间是发信权来源。 | `identityRegistry` 模块槽、`bindingId`、`UVPIdentityRegistry.owner()`。 |
| [HookReady](../concepts/state-machine/README.md) | 带有 `emitReady=true` 的 receive hook ready 后发出的事件，表示 Product task 可以打开。 | `HookReady(planId, orderId, hookId, stageId, hookName)`。 |
| [Stage Overlay](../concepts/state-machine/stage-overlay.md) | Order 运行时对 stage supplier 或阶段文件映射的订单级改写，不改变 Plan。 | stage supplier patch / 阶段文件写入事件。 |
| [Stage Patch](../concepts/state-machine/stage-overlay.md) | 受控的订单动作，用来改写 stage supplier 或阶段文件映射；这里的 patch 不是代码补丁。 | `StageSupplierPatchApplied`、`StageFileWritten`。 |
| [Selector Binding](../concepts/state-machine/stage-overlay.md) | Plan 里声明“某个 stage 可以 patch 哪个目标 stage”的规则。 | selector stage id、target stage id、binding key。 |
| dock 执行者选择 | 订单级一次性决定：在挂接 stage 上选定 dock 执行者，选中后固定；换选响亮拒绝。 | `selectStageDockSupplier` / `selectStageDockSupplierFor`、`StageDockSupplierSelected`、`StageDockSupplierAlreadySelected`。 |
| binding / `dock_link` | binding 是 A→B 的运行期关系，由挂接 stage 的文件项 `dock_link` 确定；`dock_link` 的值是 canonical A 单号，写入即建立、改写即切换。 | `dock_link`（key = `keccak("dock_link")`）、`bindingId`（7 个 32-byte word）。 |
| pokeDockBinding | permissionless 求值入口：认证 `dock_link` 载荷、按 `block.timestamp` 求 A 窗口、复核 B 窗口，逐 output first-win 发射 B 信号。 | `pokeDockBinding`、`DockBindingPoked`、`DockOutputSubmitted`、`DockBindingContentHashMismatch`。 |
| 窗口 (Window) | A 窗口是 A 侧 `validWhen` 时间窗程序（`~` 在事实到达时关闭、`+T` 延迟锚点）；B 窗口是 B 侧 `sendSignals.validWhen` 发射适格；A/B 交集才发射。历史窗口时间不上链。 | `uvp.dock.v1` output window、`dockOutputWindow`、`uvp.dockBinding.v1`、`dueInSeconds`。 |
| [Replay](../concepts/state-machine/replay.md) / 重放 | 从链事件重建或校验订单状态。 | statemachine reducer、chain-services projections。 |

## 证据、Proof 与产品术语

| 术语 | 普通解释 | 代码或产品对应物 |
| --- | --- | --- |
| [Evidence / 证据](../concepts/services/evidence-proof.md) | 支持某个 signal 的链下业务材料或 metadata。 | Product evidence route、object handle、evidence metadata。 |
| Payload Hash | 被提交业务 payload 或 evidence bundle 的指纹。 | signal submission 里的 `payloadHash`。 |
| Metadata URI | 指向链下 metadata、manifest 或 storage reference 的引用。 | `metadataURI`。 |
| [Proof](../concepts/services/evidence-proof.md) | 一条声明如何对应链事件、签名或 hash 的可追踪记录。Product proof row 应包含 tx、block、log、contract、chain id、event 和 payload context。 | Product proof row、event provenance。 |
| [Projection](../concepts/services/indexer-projections.md) / 投影 | 从链事件重建出来、用于展示的读模型。 | chain-services indexer、Product DTO。 |
| [Product DTO](../concepts/product/dto.md) | 把链上事实翻译成普通用户能读懂的订单、任务、proof 和 trust 视图的数据格式。 | `ZhixuDetailDTO`、`ProductOrderDTO`、`ProductTaskDTO`。 |
| [Product BFF](../concepts/product-bff.md) | Product Backend-for-Frontend，处理 draft、invite、participant confirmation、authorization building 和 order registration 的产品工作流服务。 | used-car 应用仓 backend。 |
| [Signal Container](../concepts/product/signal-container.md) | Product 层对 task、evidence、typed data、signature、submission 和 proof 的包装。 | Product API prepare/submit/proof flow。 |
| [Store](../concepts/store/README.md) | 面向凝结核、Supplier、Identity Registry、operator 和 proof 视图的产品工作台。 | used-car 应用仓 Store 表面、`zhixu-store/registry` 数据层库。 |
| [Chain Services](../concepts/services/chain-services.md) | 可重建服务层，负责 indexing、投影、proof、链读路由与运维路由。 | `@uvp-eth/chain-services`。 |

## 进阶与环境术语

| 术语 | 普通解释 | 代码或运行对应物 |
| --- | --- | --- |
| `signalMap` | Dock 文档里的发射条件声明：key 是 B 侧输出信号名，value 是 A 侧 `validWhen` 表达式。 | `Dock.spec.signalMap`、`uvp.dock.v1` output。 |
| [Relayer](../concepts/services/relayer.md) | 广播已签名交易、可能代付 gas 的参与方角色或钱包。它不是业务签名者。 | 应用仓提交编排、`submitSignal()`（合约 executor 可由 relayer 代付）。 |
| [EIP-712](../concepts/trust/eip712-relayer.md) | 钱包签结构化业务动作的格式。 | typed data builders、`UVPStateMachineSignalSubmission`、`UVPStagePatchModuleStageSupplierPatch`。 |
| Anvil | 本地开发和协议闭环使用的 EVM 链。 | local Anvil scripts。 |
| Base Sepolia | 公共 EVM 测试网目标，用于 staging/rehearsal claim。 | chain id `84532`。 |

## 关键概念对

| 概念对 | 正确读法 |
| --- | --- |
| Zhixu / Order | Zhixu 是静态设计；Order 是这份设计的一次运行。 |
| Plan / Order | Plan 是被材料审核的版本；Order 是这个 Plan 下的具体运行。 |
| Dock / Order | Dock 是静态 A→B 订阅声明；两侧 Order 各自独立创建与执行，Dock 只把 A 事实映射成 B 输出信号的发射条件。 |
| Binding / `dock_link` | binding 是运行期关系身份；`dock_link` 文件项是确定它的链上依据，值即 A 单号。 |
| Nucleus / Store operator | 凝结核拥有内部 Zhixu 设计；Store operator 管平台 workflow。 |
| Store or external institution / Authorization | publication 是材料审核；authorization 是提交订单动作的权限。 |
| Supplier / Executor | Supplier 是能力和 trust 身份；Executor 是运行时提交者或处理者。 |
| Evidence / Proof | Evidence 是链下材料或 metadata；proof 是 hash、签名、事件到 Product 展示的追踪记录。 |
| File Resource / Business File | File Resource 是句柄或要求；私有业务文件留在链下。 |
| Relayer / Submitter | Relayer 广播交易；submitter 签业务声明。 |
| Store metadata / 链上事实 | Store metadata 组织材料和 workflow；链上事实来自 registry 和 state-machine 事件。 |
