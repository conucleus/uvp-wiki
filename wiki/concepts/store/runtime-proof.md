---
title: 履约状态、Proof 与 Trust 校验
type: reference
audience: Store operator、indexer/proof 维护者
preread: README.md
status: verified
---

Store 的履约视图把订单、任务、供应商参与、证据 hash 和链上 proof 组织给 operator 看。它是围绕链事件重建的视图，事实来源是 registry/state-machine events。

<!-- StageExecutorPatchApplied 经 module patch 路径发出，非 v0.8 主 ABI fixture 直接列出 -->

## 视图来源

| 视图 | 来源 |
| --- | --- |
| 订单是否注册 | `OrderRegistered` projection。 |
| 任务是否 ready | `HookReady` 和 hook status projection。 |
| Signal 是否提交 | `SignalSubmitted` proof row。 |
| Executor 是否 active | `StageExecutorPatchApplied` / `StageExecutorActivated` projection。 |
| Evidence 绑定 | Product evidence metadata、content hash、metadata hash、payload hash。 |
| Supplier 历史参与 | order/task projection + supplier metadata/identity projection。 |
| Plan 与身份 | `UVPStateMachine` Plan finalization + `UVPIdentityRegistry` identity binding projection。 |
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

> 本表是 UI 最低要求，具体以 [Product DTO](../product/dto.md) 为准。

| 字段 | 说明 |
| --- | --- |
| event | `OrderRegistered`、`SignalSubmitted`、`HookReady`、`IdentityBindingRegistered` 等。 |
| contract | state-machine、identity-registry 或 deployment-registry address。 |
| deployment | deployment id / chain id / release evidence reference。 |
| tx/block/log | tx hash、block number、log index。 |
| subject | orderId、planId、supplier subject、stageId、hookId。 |
| payload | payload hash、metadata hash、manifest hash，不含明文。 |
| projection | Product task/order row 由哪个 event replay 得出。 |

## 展示边界

- proof row 缺失要结合 indexer 同步高度解释。
- notification delivered 是联系状态；signal submitted 看 `SignalSubmitted`。
- Store note 或 operator review 是运营记录；业务完成看 signal/proof（contact 不等于履约，见 [../protocol-boundaries.md](../protocol-boundaries.md)）。
- local DB row 是可重建读模型，读模型与权威来源的对应关系见 [README.md](README.md)「信息对象与权威来源」表。
- linked order complete 要通过 local order 上的授权 mapped signal 或 `DockedSignalSubmitted` 才能推动 local order。
