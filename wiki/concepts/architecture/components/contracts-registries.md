# Contracts 与 Registries

链上事实层由三个主要合约组成：`UVPStateMachine`、`ZhixuTrustRegistry`、`UVPDeploymentRegistry`。它们共同决定协议状态，不依赖后端数据库。

## UVPStateMachine

状态机合约负责：

- 注册 plan。
- 注册 order。
- 写入订单级 signal 授权。
- 接受直接或 relayed signal 提交。
- 评估 hook。
- 发出 `HookStatusChanged`、`HookReady`、`TimerPoked`。
- 处理 stage executor/resource overlay。

它不保存业务文件明文，不调用 executor，不托管资金，不读取 Store 数据库。

## ZhixuTrustRegistry

Trust registry 负责：

- 注册 trust domain。
- 认证或撤销 plan。
- 认证或撤销 supplier。
- 为 Product projection 提供 trust proof。

`UVPStateMachine.registerPlan()` 会检查官方域里 `(planId, planHash)` 是否 active。

## UVPDeploymentRegistry

Deployment registry 记录部署状态：

```text
Candidate -> Canary -> Active -> Deprecated -> Retired
```

激活新部署时，旧 active 可以被标为 deprecated。它是部署 cutover 的链上记录，不是订单状态机。

## 公共接口

这些合约的 ABI、事件名、event topic、EIP-712 domain version 和 typed data 字段都属于公共协议接口。修改它们需要更新 bindings、fixtures、release gate 和文档。
