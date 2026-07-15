# Order App

`uvp-order-app/app` 是普通参与者的订单履约界面。它和 executor-kit 一样是 signal producer，但默认读者是人：参与者打开任务、检查钱包责任、准备证据指纹、确认签名、提交并回看 proof。

它不拥有订单事实。订单、signal、hook 和 proof 来自 `UVPStateMachine` 可重放事件；可选的名称解析来自 `UVPIdentityRegistry`。Order App 消费 Chain Services 暴露的 Product DTO 和 signal container。

```text
Product API /product/me/tasks
  -> task inbox and readiness
  -> evidence fingerprint
  -> prepare-submit typed data
  -> participant wallet signature
  -> submit
  -> proof display
```

## 当前代码边界

| 表面 | 代码入口 | 说明 |
| --- | --- | --- |
| API client | `uvp-order-app/app/src/api/productApi.ts` | 读取 Product DTO、任务、proof，并调用 prepare/submit。 |
| 参与者身份 | `uvp-order-app/app/src/auth/`、`src/wallet/` | 明确 wallet filter 和 browser wallet 交互。 |
| Onboarding | `uvp-order-app/app/src/onboarding/` | invite onboarding 和参与者入口。 |
| 任务房间 | `uvp-order-app/app/src/order-room/`、`src/tasks/` | 展示待办、readiness、blocked reason 和提交动作。 |
| Evidence | `uvp-order-app/app/src/evidence/` | 生成或展示证据指纹，不把业务明文写上链。 |
| Proof | `uvp-order-app/app/src/proof/` | 展示 proof rows、提交状态和链上来源。 |
| Notifications | `uvp-order-app/app/src/notifications/` | 展示协作提醒，不改变链上状态。 |

## 和 Executor Kit 的分工

| 入口 | 适合谁 | 共同边界 |
| --- | --- | --- |
| Order App | 普通参与者、人工确认、浏览器钱包。 | Product API prepare/sign/submit/proof。 |
| Executor Kit Product API mode | 企业脚本、supervised agent、MCP 工具。 | 同一套 signal container 和 participant signature。 |
| Executor Kit chain-native mode | 高级链原生 executor。 | 直接监听 `HookReady` 并提交授权 signal。 |

两者都不能绕过 order-level signal authorization、active executor overlay、EIP-712 business signature 和 first-writer-wins signal 语义。

## 界面语言边界

普通参与者界面使用待办、提交确认、凭证指纹、证明、履约者、执行方和供应商材料审核这类语言。HookPlan、sourceId、signalId、ABI、calldata、gas、registryAddress 等词只出现在工程或高级调试界面。

## 相关页面

- [Order App 与 Executor Kit](../concepts/architecture/components/order-app-executor-kit.md)
- [Product DTO 与用户表面](../product/README.md)
- [Executor Kit](executor-kit.md)
- [Chain Services](../components/chain-services.md)
