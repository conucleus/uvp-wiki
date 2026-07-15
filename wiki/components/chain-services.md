# 可重建服务层：Chain Services

`uvp-chain-services/service` 是 UVP EVM 轨道的可重建服务层。它不是协议事实源；合约和链事件才是协议事实源，Chain Services 提供可重建的 replay、projection、relaying、verification 和 HTTP API。compiler 负责把 Zhixu 变成确定性产物，state machine 负责链上事实，Chain Services 负责链下投影和服务运行。

它是可 fork 的链下服务包。任何参与者、凝结核、供应商、审计方或第三方集成都可以下载、fork、编译并运行自己的实例；只要遵守 ABI、event、EIP-712、canonical hash、Product DTO 和 Store/Product API 边界，不同实例可以从同一组链事件重建同一类事实视图。

```text
UVPDeploymentRegistry / UVPStateMachine / UVPIdentityRegistry events
  -> chain-services indexer and replayed projections
  -> proof verifier / relayer boundary / workflow stores
  -> Product API / Store Console API / executor-kit integration / ops views
```

## 为什么可重建

可重建的意思是事实源仍在链上。Chain Services 仍然很重要：把事件变成任务列表、把证明变成 DTO、把签名 payload 交给 relayer、把 Store draft 和 audit workflow 留痕、把通知变成可重试 delivery intents。它所有公开结论都必须能回到链上事件、签名、公证哈希或可重放投影。

| 问题 | 事实源 | Chain Services 的角色 |
| --- | --- | --- |
| plan 是否提交并 finalized | `UVPStateMachine` event | 索引、查询、展示 plan projection。 |
| order 是否开始、signal 是否提交 | `OrderRegistered`、`SignalSubmitted`、`HookReady` 等事件 | 重放成订单、任务、timeline 和 proof rows。 |
| 线下主体对应哪个钱包 | `UVPIdentityRegistry` event | 重建 identity binding projection，供 Store 显示名称。 |
| 用户是否签过某个业务动作 | EIP-712 signer recovery 和链上 authorization | 校验 payload，转交 relayer；不替用户签名。 |
| Store draft、联系、通知、审核材料 | Store workflow storage | 组织工作流和 audit；链上 proof 或 trust publication 另行展示。 |

## 可 fork 的运行形态

Chain Services 是普通 Node 服务包：`@uvp-eth/chain-services`。它可以作为官方测试网服务运行，也可以被外部团队下载到自己的机器、CI、私有云或集成环境中运行。

```text
pnpm --filter @uvp-eth/chain-services dev:api
pnpm --filter @uvp-eth/chain-services dev:indexer
pnpm --filter @uvp-eth/chain-services rebuild:indexer
pnpm --filter @uvp-eth/chain-services dev:relayer
```

fork 或自部署时必须守住这些接口约束：

- 从 deployment block、chain id、contract address 和 event log 重建投影。
- 保留 `stateMachineAddress` / `deploymentId` 等 contract context；bare order id 只能在唯一时解析。
- 保持 ABI、event name、EIP-712 typed data、canonical hash 或 Product DTO 语义。
- 本地数据库、object storage、notification state、Store review 结果标注为 projection/workflow。
- 用户私钥留在用户侧；relayer key 只负责广播。

## 下属页

| 子系统 | 代码入口 | 说明 |
| --- | --- | --- |
| [Indexer 与投影](chain-services-indexer-projections.md) | `src/indexer/`、`src/storage/` projection rows | 从 deployment registry、state-machine、identity registry 事件重建 order/task/proof/identity 视图。 |
| [Relayer](chain-services-relayer.md) | `src/relayer/` | gas payer、广播、confirmation、retry；不生成业务签名。 |
| [Evidence、Proof 与 File Resource](chain-services-evidence-proof.md) | `src/evidence/`、`src/proof-verifier/` | evidence hash、metadata hash、object handle、proof mismatch report。 |
| [Product API](chain-services-product-api.md) | `src/product/`、`src/api/routes/product-read.ts` | ordinary user order/task/timeline/proof DTO 和 Product staging readiness。 |
| [Store Console、Supplier 与 Governance API](chain-services-store-api.md) | `src/store-console/`、`src/store-suppliers/`、`src/governance/` | 凝结核工作台、supplier directory、review、identity binding register/revoke request。 |
| [Notifications 与 Reconcile](chain-services-notifications-reconcile.md) | `src/notifications/`、`src/reconcile/` | delivery intent、retry/dead-letter、submission/projection reconciliation。 |
| [Storage、Migration 与 Runtime Profile](chain-services-storage-runtime.md) | `src/storage/`、`src/config/`、`migrations/` | memory/SQLite/PostgreSQL、migration、testnet fail-closed profile。 |
| [API Routes](chain-services-api-routes.md) | `src/api/routes/` | Product、Store、governance、notification、evidence、diagnostics route module 归属。 |

## 子系统地图

| 子系统 | 输入 | 输出 |
| --- | --- | --- |
| Indexer | deployment registry、state-machine、Identity Registry logs。 | 归一化事件、sync status、order/task/proof/identity projection。 |
| Projection storage | replayed events、workflow rows、submission rows。 | memory/SQLite/PostgreSQL stores；可擦除重建的查询状态。 |
| Relayer boundary | participant-signed EIP-712 payload。 | tx submission、retry、confirmation、failure 状态。 |
| Stage patches | selector-signed executor/resource patch typed data。 | active executor patch、resource manifest patch submit path。 |
| Proof verifier | metadata hash、evidence hash、Zhixu hash、object handle。 | proof mismatch report、evidence metadata、object storage adapter。 |
| Product projection | chain projection、identity projection、evidence metadata。 | Product order/task/timeline/proof DTO、staging readiness。 |
| Product BFF | order draft、invite、participant wallet、plan publication。 | Backend-for-Frontend registration draft、authorization table 和 order submit workflow。 |
| Store Console | Store draft、version、docking、audit、runtime metadata。 | 凝结核工作台、Zhixu catalog、review material、docking session。 |
| Store Supplier | supplier metadata、capability tags、contact material。 | 链下 supplier directory、review 与匹配记录；身份登记请求另行处理。 |
| Identity workflow | Store identity review、admin action。 | identity binding register/revoke tx intent 与 audit。 |
| Notifications | `HookReady`、submitter authorization、supplier identity、profile。 | delivery intents、retry/dead-letter operational state。 |
| Reconcile | submission state、chain confirmation、projection lag。 | background reconciliation status and repair loop。 |
| API shell | route context、stores、services、authz headers。 | Product、Store、governance、notification、diagnostic HTTP routes。 |
| Config/security/shared | env、runtime profile、audit/redaction rules。 | fail-closed runtime checks、redacted diagnostics、shared types。 |

## 边界检查

- Contracts and chain events remain source of truth.
- Chain Services 是可替换、可 fork 的链下执行软件，负责投影和中继。
- Relayer can pay gas and submit transactions, but cannot create business signatures.
- Product DTO、Store DTO、notification state、audit trail 都是 projection/workflow。
- Store metadata、联系信息、review、打标和 docking session 明确标为链下 workflow；身份绑定链接到 `UVPIdentityRegistry`，Order/Signal proof 链接到 `UVPStateMachine`。
- Proof verifier 可以发现 hash mismatch；履约完成、内部公平或 Identity Registry 结论分别由 signal/proof、凝结核材料和 registry publication 表达。
- Off-chain storage 只保存对象句柄、metadata、hash 和 workflow state；合同、发票、物流、车辆等明文证据不上链。
- Indexer database 必须能从合约事件擦除重建；任何 fork 都要保留 replay 和 redaction 规则。
