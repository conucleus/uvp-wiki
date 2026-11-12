---
title: Product BFF 与提交入口
type: explanation
audience: 应用开发者
status: verified
---

# Product BFF 与提交入口

Product BFF 指 Product Backend-for-Frontend，是 UVP 产品写入链路的应用层边界：把用户可理解的 draft、invite、task action 和 evidence 指纹转换成可验证的出生提交、typed data、签名提交与 submission 状态。本仓的 `@uvp-eth/chain-services` 已成为只读链投影与运维面；Product BFF 由 used-car 应用仓 backend 维护。

> 待确认：应用仓 backend 的模块路径与端点名不在本仓核验范围；引用前以应用仓实现与 API 契约为准。

## 应用层职责

Order BFF 处理“把一个可创建订单的 Zhixu 变成一笔待出生订单”的产品过程：

- 创建 order draft。
- 生成并管理参与方 invite。
- 记录参与方 accept/reject。
- 校验 Zhixu 是否有 active Store version。
- 校验 plan 是否 published、是否 revoked。
- 校验 supplier wallet 是否被 revoked。
- 从订单权限表与参与方列表生成 `SignalAuthorization[]`。
- 准备出生 payload、`triggerHookId` 与初始 trigger typed data。
- 跟踪出生提交与 retry。

工作流：

```text
create order draft
  -> invite participants
  -> participants accept with wallet
  -> build SignalAuthorization[]
  -> prepare birth payload + trigger typed data
  -> wallet signs; direct submit or relay
  -> chain events: OrderRegistered / OrderTriggered / StageMaterialized
```

BFF 的数据库保存 draft 与 workflow 状态。真正让订单存在的是 `UVPStateMachine` 的出生事件；真正让任务推进的是后续 `SignalSubmitted`、`HookReady` 等事件。链读侧由 `@uvp-eth/chain-services` 的 `/chain/*` 提供可重建投影。

## Signal 提交入口

订单出生之后，参与者或 executor 通过 Product task 提交业务 signal：产品面先准备可读 summary 与 EIP-712 typed data，再由授权钱包签名；链上事实只看 direct `submitSignal`（身份固定 `msg.sender`，合约 executor 可由 relayer 代付）与 `SignalSubmitted`。产品侧不替参与方签名，也不从角色文案猜授权。

## Stage patch 提交入口

订单级 patch 分两类，签名面与校验面不同：

- executor patch：`UVPStagePatchModule` 的 `StageExecutorPatch` typed data（域 `stageExecutorPatch` 0.4，mode 闭集 `assign`/`handoff`），signed 入口 `applyStageExecutorPatchFor` 携带 selector 与 previous executor 签名、`bindingProof`、`candidateProof` 与 `executorAuthorizations`；patch 生效后把 Plan 预声明能力写为该订单的显式授权集。
- 阶段文件 patch：没有独立的 patch typed data；它随 direct `submitSignal` 尾部 `bytes32 filesDigest` + `FilePatch` 提交（`signalId == 0` 为纯文件 patch），由 `UVPFileResourceModule.applyStageFilePatch` 落 `add` / `replace` / `remove`，写入方授权来自 stage 级 `fileWriters` capability 叶与订单级授权行。

产品侧的 typed data 准备与提交编排由应用仓 backend 维护；协议侧字段与事件见 [合约与事件](../reference/contracts-and-events.md) 与 [Stage Overlay](state-machine/stage-overlay.md)。

## 边界

- 不替参与方签名。
- 不绕过 plan publication 和 supplier identity 检查。
- 不把 draft、invite、出生提交尝试当成链上订单。
- 不把 submission row 当成链上 `SignalSubmitted`。
- 产品对象是 Zhixu order；Store review 不等于 trust publication。
- draft、邀请、evidence 元数据与 review 记录是应用层事实；订单、阶段、信号与 hook 状态来自链上和链上投影。
