# Plan 与 Order

本页只作为旧链接兼容入口，不再出现在 `SUMMARY.md`。请分别阅读 [Plan](plan.md) 和 [Order](order.md)。

Plan 是“某个秩序 (Zhixu) 定义编译出的可执行版本”。Order 是“某个 Plan 的一次链上实例”。这两个概念必须分开：Plan 负责静态版本、hash 和 trust attestation；Order 负责运行时 signal、hook、executor/resource overlay、docking link 和 proof。

## Plan

`registerPlan()` 把编译后的计划注册到 `UVPStateMachine`。注册前合约会检查：

- 调用者是允许的 plan publisher。
- `planId` 非零。
- hooks 非空。
- 同一个 `planId` 还没有注册。
- `ZhixuTrustRegistry` 中官方 trust domain 对 `(planId, planHash)` 的认证仍然有效。

合约保存的 `Plan` 包含：

```solidity
struct Plan {
    bytes32 planHash;
    address publisher;
    bytes32[] hookIds;
    bytes32[] selectorBindingKeys;
    mapping(bytes32 hookId => StoredHook hook) hooks;
    mapping(bytes32 signalKey => bytes32[] hookIds) dependencyIndex;
    mapping(bytes32 bindingKey => StageSelectorBinding binding) selectorBindings;
    bool exists;
}
```

`dependencyIndex` 决定 signal 来了以后要评估哪些 hook。合约不会扫描整份计划。

## Order

`registerOrder()` 把订单绑定到某个已注册计划：

```solidity
struct Order {
    bytes32 planId;
    address creator;
    bool exists;
    mapping(bytes32 hookId => HookRuntime runtime) hookRuntime;
}
```

注册成功后，合约会为计划里的每个 hook 初始化 runtime，初始状态是 `Init`。

## 注册时授权

产品路径应该使用带 `SignalAuthorization[]` 的订单注册重载。这个重载会在订单创建时写入允许提交的 source/signal/submitter 组合。

不带授权的重载是兼容路径。它能创建订单，业务提交权需要后续授权；真实产品流程应使用带 `SignalAuthorization[]` 的重载。

## 版本关系

Plan 版本变化应体现在 `planId` 或 `planHash` 上。Order 一旦绑定某个 `planId`，后续状态必须按该计划解释。新的流程版本应注册新的 Plan，旧订单继续按原 Plan 解释。
