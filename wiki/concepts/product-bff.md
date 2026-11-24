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
- 解析出生阶段的 assigned supplier account 与 plan artifact，准备出生 payload 与 `UVPStateMachineSignalSubmission` typed data。
- 不生成提交者授权表：发信权由链上 assigned supplier 状态决定。
- 跟踪出生提交与 retry。

工作流：

```text
create order draft
  -> invite participants
  -> participants accept with wallet
  -> prepare birth payload + signal-submission typed data
  -> wallet signs; direct submit or relay
  -> chain events: OrderRegistered / OrderTriggered / StageMaterialized
```

BFF 的数据库保存 draft 与 workflow 状态。真正让订单存在的是 `UVPStateMachine` 的出生事件；真正让任务推进的是后续 `SignalSubmitted`、`HookReady` 等事件。链读侧由 `@uvp-eth/chain-services` 的 `/chain/*` 提供可重建投影。

## Signal 提交入口

订单出生之后，参与者或 executor 通过 Product task 提交业务 signal：产品面先准备可读 summary 与 EIP-712 typed data，再由 assigned supplier account 签名；链上事实只看 `submitSignal`（空 signature 时 `msg.sender` 必须等于 submitter，非空 signature 时 `msg.sender` 仅作 relayer）与 `SignalSubmitted`。产品侧不替参与方签名，也不从角色文案猜授权。

## Stage patch 提交入口

订单级 patch 分两类，签名面与校验面不同：

- stage supplier patch：`UVPStagePatchModule` 的 `StageSupplierPatch` typed data（域 `stageSupplierPatch` 1，以 `previousSupplierId` 区分 assign/handoff），signed 入口 `applyStageSupplierPatchFor` 携带 selector 与 previous supplier 签名、`bindingProof` 与 `candidateProof`；patch 生效只改 `stage -> supplierId`，不写任何授权集。
- 阶段文件写入：没有独立 typed data；它随 `submitSignal` 的 `files: StageFile[]` 提交（`signalId == 0` 为纯文件写入），由 `UVPFileResourceModule.applyStageFiles` 同 key 覆盖，写入方授权来自 target/writer 阶段的 assigned supplier account 与 `fileWriters` allowlist。

产品侧的 typed data 准备与提交编排由应用仓 backend 维护；协议侧字段与事件见 [合约与事件](../reference/contracts-and-events.md) 与 [Stage Overlay](state-machine/stage-overlay.md)。

## 边界

- 不替参与方签名。
- 不绕过 plan publication 和 supplier identity 检查。
- 不把 draft、invite、出生提交尝试当成链上订单。
- 不把 submission row 当成链上 `SignalSubmitted`。
- 产品对象是 Zhixu order；Store review 不等于 trust publication。
- draft、邀请、evidence 元数据与 review 记录是应用层事实；订单、阶段、信号与 hook 状态来自链上和链上投影。
