# Signal 授权

订单级 signal 授权回答一个非常具体的问题：在这个订单里，哪个钱包可以提交哪个 source/signal。授权有两条合约路径：Order 创建时写入的显式授权，以及 Executor patch 在 Plan 能力范围内创建的动态委任。

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
_signalAuthorizations[orderId][signalKey][submitter]
```

提交 signal 时，合约检查 `orderId + signalKey + submitter` 是否存在有效显式授权或动态 executor 委任。

## Executor Patch 动态委任

编译器会把 stage 的 `sendSignals` 编译成 Plan `signalCapabilities`。当一个有效 Executor patch 为目标 stage 选择钱包时，合约只对这些预声明的 current-order `(sourceId, signalId)` 自动创建委任：

- 新 executor 可以是 Order 创建后才出现的钱包，无需预先列入候选授权。
- selector 的权力来自 `StageSelectorBinding`、内部 patch signal 授权和签名／mode 约束。
- executor 的 signal 权力来自已经注册的 Plan capability 与本次有效 patch 的结合。
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

`externalSignals` 是 backend/executor 的直接输入契约，不是一个固定的链上 `OUTSIDE` signal。backend 先完成验签、去重、落库和规范化；如果 EVM adapter 需要把规范化事实提交到状态机，授权必须绑定到实际的 `entry.source` 与 `entry.signalName`：

```text
sourceId = keccak256(entry.source)
signalId = keccak256(entry.signalName)
submitter = participant/business submitter address
```

业务提交者签署对应的 trigger 或 signal typed data；registrar/relayer 只负责广播。广播地址不会因此获得业务提交权限。

docked Zhixu 的跨源入口必须使用显式的空标头 wrapper（`::OUTSIDE@(...)`、`::MERGE@(...)` 或 `::ANCHOR@(task.stage.signal)`），并对实际的 source/signal 建立同样的订单级授权。linked order 后续的 `str/cmp/err` 映射仍按 `signalMap`、docking link 和 mapped signal 授权检查。

## 授权和任务展示

Projection 会根据显式授权或 executor 委任给任务分配 assignee，但这只是产品视图。合约真正接受提交时仍重新检查授权，所以服务层展示错误不会突破协议边界。
