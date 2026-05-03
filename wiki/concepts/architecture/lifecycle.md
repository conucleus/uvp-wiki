# 本地到链上路径

这一页按一次完整发布和订单执行路径串起各模块。

## 1. 编写 Zhixu

Store 或开发者准备 Zhixu 定义。定义里描述 task pattern、stage、executor、receive signal、selected stage 和资源要求。此时还没有链上事实。

## 2. 编译计划

`uvp-protocol/packages/compiler` 生成：

| 产物 | 用途 |
| --- | --- |
| `HookPlanArtifact` | 给审计、Store、测试和人类阅读。 |
| `OnchainHookPlanArtifact` | 给 EVM 注册和哈希认证。 |
| `registerPlan` args | 给 `UVPStateMachine.registerPlan()`。 |

编译器会同时做结构校验，例如 signal 引用、executor reachability、selected stage binding。

## 3. 认证计划

官方 trust domain 的 owner 在 `ZhixuTrustRegistry` 里认证：

```text
domainId + planId + planHash
```

如果计划没有被认证，或者已经被撤销，`UVPStateMachine` 不应接受它作为有效计划。

## 4. 注册计划

授权 publisher 调用 `registerPlan()`。合约保存紧凑 hook、依赖索引和 selector binding，并发出 `PlanRegistered`。

## 5. 注册订单和授权

授权 registrar 调用 `registerOrder()`，绑定某个 `planId`，同时写入订单级 signal 授权。每条授权说明某个 submitter 可以为该订单提交哪个 source/signal。

## 6. 提交业务动作

参与方钱包签 EIP-712 typed data。Relayer 可以拿签名代为广播，但签名主体必须是被授权的 submitter。合约接受后写入 `SignalRecord`，发出 `SignalSubmitted`，并评估受影响 hook。

## 7. 生成产品视图

`chain-services` 从链事件重建 projection，再映射成 `ProductOrderDTO` 和 `ProductTaskDTO`。Store、Order App、executor-kit 都消费这些 DTO 或直接监听链事件。
