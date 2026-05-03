# Signal 授权

订单级 signal 授权回答一个非常具体的问题：在这个订单里，哪个钱包可以提交哪个 source/signal。

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

提交 signal 时，合约检查 `orderId + signalKey + submitter` 是否存在授权。

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

Product BFF 会为订单启动准备系统授权：

```text
sourceId = keccak256("")
signalId = keccak256("OUTSIDE")
submitter = registrar address
```

这条授权用于 registrar 触发订单初始路径。它不是让后端拥有所有业务动作权限。

docked Zhixu 的 link stage 如果使用 `::OUTSIDE` 作为入口，也必须走同样的订单级授权边界：只有被授权的钱包能提交这个空 source 上的 `OUTSIDE` signal。linked order 后续的 `str/cmp/err` 映射仍按 `signalMap`、docking link 和 mapped signal 授权检查。

## 授权和任务展示

Projection 会根据授权给任务分配 assignee，但这只是产品视图。合约真正接受提交时仍重新检查授权，所以服务层展示错误不会突破协议边界。
