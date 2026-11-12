---
title: Signal 授权
type: explanation
audience: 工程贡献者
status: verified
---

# Signal 授权

订单级 signal 授权回答一个非常具体的问题：在这个订单里，哪个钱包可以提交哪个 source/signal。授权最终都落在订单级显式授权记录上，写入路径有两条：Order 创建时写入，以及 stage patch 在 Plan 能力范围内写入。

## 合约授权结构

注册订单时可以传入 `SignalAuthorization[]`：

```solidity
struct SignalAuthorization {
    bytes32 sourceId;
    bytes32 signalId;
    address submitter;
    bytes32 role;
    bytes32 metadataHash;
}
```

合约存储成：

```text
_signalAuthorizations[planId][orderId][signalKey][submitter]
```

提交 signal 时，合约检查 `planId + orderId + signalKey + submitter` 是否存在有效订单级显式授权。

## Stage Patch 写入的授权集

编译器会把 stage 的 `sendSignals` 编译成 Plan `signalCapabilities`（链上折叠进 `capabilitiesRoot`）。当一个有效 stage patch 为目标 stage 选择钱包时，patch 的 EIP-712 签名携带 `authorizationsHash`，合约把这些预声明的 current-order `(sourceId, signalId)` 授权写成订单级显式授权；资格核验由提交方携 capability proof 自证（全零表示不声明）：

- 新 executor 可以是 Order 创建后才出现的钱包，无需预先列入候选授权。
- selector 的权力来自 `StageSelectorBinding`、内部 patch signal 授权和 EIP-712 签名／mode 约束。
- executor 的 signal 权力来自能力树已承诺的 Plan capability 与本次有效 patch 写入的授权集的结合。
- patch 只能改变执行者，不能新增 Plan 未声明的 signal。
- first-writer-wins 仍然适用；已经存在的 Signal 不会因换人而改变。

## Product Authorization Builder

Product BFF 里的 `ProductAuthorizationBuilder` 会把产品侧的 `orderPermissionTable` 和参与方列表转换成合约授权。它会校验：

- permission table 形状正确。
- required participant 存在。
- 参与方 ID 不重复。
- role slot 和 stage 存在。
- 参与方已接受并有钱包地址。
- initial trigger permission 存在。

常见哈希：

```text
sourceId = keccak256(entry.source)
signalId = keccak256(entry.signalName)
role = keccak256("role:" + roleSlotId)
metadataHash = keccak256("uvp:product-bff:authorization:v3:...")
```

## Initial Trigger

订单由签名过的 `triggerOrderFromOutsideFor()`（`UVPStateMachine` 开放出生入口）或 `triggerOrderFromSignalFor()`（order-link 模块合约 `UVPOrderLinkModule` 的派生建单入口）创建：合约把订单绑定到 finalized `planId`，记录 trigger fact 或 trigger-origin link，并可同时写入上述 order-level signal authorizations。`triggerOrderFromOutsideFor` 尾部可携带 `birthFactAttribution`（sourceId、signalId、stageId、capabilityProof），声明出生事实的属主 stage；全零表示不声明——plan 声明了能力词表时，词表外事实未携证即必拒（revert `InvalidSignalCapability`），仅零词表 plan 放行词表外事实。

外部事实由 backend/executor 规范化为具体的 `source`/`signal` 后，再按当前 Plan 的 `receiveSignals` 或 trigger 入口处理；它不是一个固定的链上 `OUTSIDE` signal。backend 先完成验签、去重、落库和规范化；如果 EVM adapter 需要把规范化事实提交到状态机，授权必须绑定到实际的 `entry.source` 与 `entry.signalName`：

```text
sourceId = keccak256(entry.source)
signalId = keccak256(entry.signalName)
submitter = participant/business submitter address
```

业务提交者签署对应的 trigger 或 signal typed data；registrar/relayer 只负责广播。广播地址不会因此获得业务提交权限。授权键和事件都必须保留 `(planId, orderId)`，不能仅按裸 `orderId` 归属事实。

dock 阶段的执行者选择走同一 stage patch 路径：`selectStageDockExecutor` / `selectStageDockExecutorFor` 由 selector 以 EIP-712 签名提交选择，签名携带的授权集必须覆盖该 Dock 的全部 output 信号（否则 revert `DockExecutorAuthorizationMissing`），并写成订单级显式授权。`dock_link` 文件项、binding 与 `pokeDockBinding` 只按既有订单级授权与 A/B 窗口发射 output，不新增订单级授权；A 侧窗口由 `spec.signalMap` 表达式求值，B 侧 output 的发射适格由 `sendSignals.validWhen` 复核。

## 授权和任务展示

Projection 会根据显式授权或 executor 委任给任务分配 assignee，但这只是产品视图；合约在真正接受提交时会重新检查授权，服务层展示错误不会突破协议边界（见 [协议边界](../protocol-boundaries.md)）。
