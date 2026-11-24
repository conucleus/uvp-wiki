---
title: 可重建服务层：Chain Services
type: meta
audience: 工程贡献者
status: verified
---

# 可重建服务层：Chain Services

`uvp-chain-services/service` 是 UVP EVM 轨道的可重建服务层。它不是协议事实源；合约和链事件才是协议事实源，Chain Services 提供可重建的 replay、projection、verification 与 HTTP 链读。compiler 负责把 Zhixu 与 Dock 变成确定性产物，state machine 与冻结模块负责链上事实，Chain Services 负责链下投影与通用链读。

它是可 fork 的链下服务包。任何参与者、凝结核、审计方或第三方集成都可以下载、fork、编译并运行自己的实例；只要遵守 ABI、event、EIP-712、canonical hash 和 generic read API 边界，不同实例可以从同一组链事件重建同一类事实视图。

本包边界：chain indexer、projection、generic read API、proof verifier 与 chain health；业务行、钱包会话、证据/治理写路径与提交编排由产品侧应用（used-car/backend）持有，chain 进程只持链投影、不广播交易、不生成业务签名。

```text
UVPDeploymentRegistry / UVPStateMachine / UVPIdentityRegistry events
  -> chain-services indexer and replayed projections
  -> plan_artifacts / dock_artifacts read projections
  -> generic chain read API / uvp-client integration / ops views
```

## 为什么可重建

可重建的意思是事实源仍在链上。Chain Services 把事件变成订单/任务/阶段投影、把证明变成 DTO、把 plan/Dock 编译产物组织成读投影、把 Dock binding 的当前窗口读成 live 值。它所有公开结论都必须能回到链上事件、签名、公证哈希或可重放投影。

| 问题 | 事实源 | Chain Services 的角色 |
| --- | --- | --- |
| plan 是否提交并 finalized | `UVPStateMachine` event | 索引、查询、展示 plan projection。 |
| order 是否开始、signal 是否提交 | `OrderRegistered`、`SignalSubmitted`、`HookReady` 等事件 | 重放成订单、任务、timeline 和 proof rows。 |
| stage supplier 与 Dock binding | `StageSupplierPatchApplied`、`StageSupplierAssigned`、`StageDockSupplierSelected`、`DockBindingPoked`、`DockOutputSubmitted` | 投影 supplier 指派、binding 与 output 发射；A/B 窗口读时从 `dockOutputWindow` 取 live 值。 |
| 阶段文件映射 | `StageFileWritten` | 按同一事务内日志序重放 `key -> payload`。 |
| 线下主体对应哪个钱包 | `UVPIdentityRegistry` event | 重建 identity binding projection，供展示名称。 |
| 用户是否签过某个业务动作 | EIP-712 signer recovery 和链上 authorization | 校验 payload；不替用户签名。 |
| Store 工作流与业务行 | 产品侧应用 workflow storage | 不在链上；链上 proof 或 trust publication 另行展示。 |

## 可 fork 的运行形态

Chain Services 是普通 Node 服务包：`@uvp-eth/chain-services`。它可以作为官方测试网服务运行，也可以被外部团队下载到自己的机器、CI、私有云或集成环境中运行。dev/rebuild 等运行命令见[运行服务和前端](../../how-to/run-services-and-apps.md)。

fork 或自部署时必须守住这些接口约束：

- 从 deployment block、chain id、contract address 和 event log 重建投影。
- 保留 `stateMachineAddress` / `deploymentId` 等 contract context；bare order id 只能在唯一时解析。
- 保持 ABI、event name、EIP-712 typed data、canonical hash 或 Product DTO 语义。
- 本地数据库、object storage、notification state、Store review 结果标注为 projection/workflow。
- 用户私钥留在用户侧；广播由 uvp-client 或应用侧承担，广播 key 不生成业务签名。

## 下属页

| 子系统 | 代码入口 | 说明 |
| --- | --- | --- |
| [Indexer 与投影](indexer-projections.md) | `src/indexer/`、`src/storage/` projection rows | 从 deployment registry、state-machine、identity registry 事件重建 order/task/proof/identity/dock 视图。 |
| [Submissions 与 Stage Patch](submissions-stage-patch.md) | `src/indexer/projections/stage*.ts`、`src/indexer/projections/dock.ts`；应用侧提交 | 提交签名与广播在 uvp-client/应用侧；stage patch 的链上入口与投影事件口径。 |
| [Evidence、Proof 与 File Resource](evidence-proof.md) | 应用侧对象存储、`src/proof-verifier/` | evidence hash、metadata hash、object handle、proof mismatch report。 |
| [Product API](product-api.md) | 产品侧应用、`src/api/routes/chain-read.ts` | ordinary user order/task/timeline/proof DTO 由产品侧应用持有；通用链读见 `chain-read.ts`。 |
| [Store Console、Supplier 与 Governance API](store-api.md) | 产品侧应用 | Store 工作台与治理 workflow；chain-services 只提供链投影与通用链读。 |
| [Relayer](relayer.md) | uvp-client / 应用侧 | gas payer 与广播**角色**；不生成业务签名。 |
| [Notifications 与 Reconcile](notifications-reconcile.md) | 产品侧应用 | delivery intent 与 reconciliation 属运营 workflow。 |
| [Storage、Migration 与 Runtime Profile](storage-runtime.md) | `src/storage/`、`src/config/`、`migrations/` | Postgres-only 存储、migration、testnet fail-closed profile。 |
| [API Routes](api-routes.md) | `src/api/routes/` | 链读、身份绑定、诊断、运维与业务面迁移响应 route module 归属。 |

## 子系统地图

| 子系统 | 输入 | 输出 |
| --- | --- | --- |
| Indexer | deployment registry、state-machine、Identity Registry logs。 | `OrderRegistered`、`SignalSubmitted`、`HookStatusChanged`、`HookReady`、`StageSupplierPatchApplied`、`StageDockSupplierSelected`、`DockBindingPoked`、`DockOutputSubmitted`、`StageFileWritten` 等事件的归一化投影与 sync status。 |
| Projection storage | replayed events、projection snapshot。 | Postgres store；可擦除重建的查询状态。 |
| Plan/Dock artifacts | uvp-core 编译产物记录 CLI。 | `plan_artifacts` / `dock_artifacts` 行级不可变读投影；缺失或身份不一致 fail-closed。 |
| Chain read API | 投影快照、plan artifacts、dock binding window reader。 | `/chain/*`、`/identity/bindings` 通用链读与 A/B 窗口 live enrichment。 |
| Proof verifier | metadata hash、evidence hash、Zhixu hash、object handle。 | proof mismatch report 与 evidence metadata。 |
| Diagnostics/ops | readiness、sync status、admin 操作。 | redacted diagnostics 与运维路由。 |
| Config/security/shared | env、runtime profile、audit/redaction rules。 | fail-closed runtime checks、redacted diagnostics、shared types。 |

## 边界检查

- 合约和链事件是唯一事实源；Chain Services 只做投影与展示，全部协议边界以[协议边界总纲](../protocol-boundaries.md)为准。
- Chain Services 是可替换、可 fork 的链下投影软件。
- 广播与签名由 uvp-client 或应用侧承担；广播 key 不生成业务签名。
- Product DTO、Store DTO、notification state、audit trail 都是 projection/workflow。
- Store metadata、联系信息、review、打标与 Dock 声明/试配记录明确标为链下 workflow；身份绑定链接到 `UVPIdentityRegistry`，Order/Signal proof 链接到 `UVPStateMachine`。
- Proof verifier 可以发现 hash mismatch；履约完成、内部公平或 Identity Registry 结论分别由 signal/proof、凝结核材料和 registry publication 表达。
- Off-chain storage 只保存对象句柄、metadata、hash 和 workflow state；合同、发票、物流、车辆等明文证据不上链。
- Indexer database 必须能从合约事件擦除重建；任何 fork 都要保留 replay 和 redaction 规则。
