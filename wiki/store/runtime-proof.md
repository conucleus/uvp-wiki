# 履约状态、Proof 与 Trust 校验

Store 的履约视图把订单、任务、供应商参与、证据 hash 和链上 proof 组织给 operator 看。它是视图，不是事实源。

## 履约视图来源

| 视图 | 来源 |
| --- | --- |
| 订单是否注册 | `OrderRegistered` projection。 |
| 任务是否 ready | `HookReady` 和 hook status projection。 |
| Signal 是否提交 | `SignalSubmitted` proof row。 |
| Executor 是否 active | `StageExecutorPatchApplied` / `StageExecutorActivated` projection。 |
| Evidence 绑定 | Product evidence metadata、content hash、metadata hash、payload hash。 |
| Supplier 历史参与 | order/task projection + supplier metadata/trust projection。 |
| Plan/Supplier trust | `ZhixuTrustRegistry` plan/supplier attestation projection。 |
| Docked linked order | local/linked relation metadata + 两边 state-machine proof + mapped local signal。 |

## Store 应展示什么

- timeline、proof rows、tx hash、block、event、state-machine address；
- supplier participation、open task、recent order count；
- revoked plan/supplier 的 historical proof；
- indexer syncing/rebuild 状态；
- evidence hash 和 metadata URI，不展示业务文件明文。
- trigger hook、ready time、assigned executor、blocked reason；
- local/linked order proof chain，当 stage 由 peer Zhixu 执行时。

## Proof 卡片最低字段

| 字段 | 说明 |
| --- | --- |
| event | `OrderRegistered`、`SignalSubmitted`、`HookReady`、`SupplierAttested` 等。 |
| contract | state-machine 或 trust-registry address。 |
| deployment | deployment id / chain id / release evidence reference。 |
| tx/block/log | tx hash、block number、log index。 |
| subject | orderId、planId、supplier subject、stageId、hookId。 |
| payload | payload hash、metadata hash、manifest hash，不含明文。 |
| projection | Product task/order row 由哪个 event replay 得出。 |

## Store 不能做什么

- 不把 proof row 缺失解释成业务未发生，除非 indexer 已同步到足够高度。
- 不把 notification delivered 当成 signal submitted。
- 不把 Store note 或 operator review 当成业务完成。
- 不把 local DB row 当成不可重建的权威记录。
- 不把 linked order complete 当成 local order complete，除非local order上已有授权 mapped signal。
