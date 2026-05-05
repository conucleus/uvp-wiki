# 执行者与集成

执行者与集成目录说明谁来执行、怎么接进来、怎么提交 signal。它连接核心概念中的 [Executor](../concepts/core/executor.md)、[Product DTO 与用户表面](../product/README.md) 暴露的 signal container、executor-kit、Order App、periphery adapter 和 docked Zhixu。

```text
HookReady / Product task
  -> executor-kit / Order App / enterprise script / AI-MCP adapter
  -> evidence hash or metadata
  -> EIP-712 business signature
  -> Product API or direct submitSignal
  -> chain proof
```

## 阅读路径

| 页面 | 解决的问题 |
| --- | --- |
| [Order App](order-app.md) | 普通参与者如何看待办、证据指纹、钱包签名、proof 和 blocked reason。 |
| [Executor Kit](executor-kit.md) | CLI/SDK 如何监听任务、准备 signal container、签名、提交和读取 proof。 |
| [Zhixu 作为 Executor](zhixu-as-executor.md) | 一条 Zhixu 如何 dock 进另一条秩序，local/linked order如何通过 signalMap 和 proof 衔接。 |
| [Executor 核心概念](../concepts/core/executor.md) | Supplier、Executor、active executor、selector patch、signal submitter 的对象边界。 |
| [Order App 与 Executor Kit](../concepts/architecture/components/order-app-executor-kit.md) | 普通参与者界面和自动化执行者工具的分工。 |
| [CLI 与配置](../reference/cli-and-config.md) | 当前 executor-kit 命令、chain-services 配置和 frontend config。 |
| [Chain Services](../components/chain-services.md) | Product API mode、relayer boundary、proof/status 查询所依赖的非可信服务层。 |

## 执行面的事实边界

Executor Kit、Order App、enterprise script、AI/MCP adapter 都是 signal producer。它们帮助参与者发现任务、准备证据、签名和提交；合约仍检查：

- `UVPStateMachine` 的 order-level signal authorization；
- active executor overlay；
- EIP-712 business signature；
- first-writer-wins signal 语义；
- chain event proof。

Relayer 可以代付或转发交易；业务签名来自被授权参与方。Store 可以联系 executor、保存通知状态、展示履约记录；业务完成看 state-machine signal/proof。

## 和产品语言的分工

| 层 | 负责什么 |
| --- | --- |
| Product DTO 与用户表面 | 把链上事件投影成订单、任务、proof、trust 状态和 signal container。 |
| 执行者与集成 | 消费任务和 signal container，完成证据准备、EIP-712 签名、提交和 proof 回读。 |
| Store | 管理 Zhixu/Supplier、docking session、operator review 和平台 workflow。 |

## 三种执行入口

| 入口 | 适合谁 | 事实边界 |
| --- | --- | --- |
| Order App | 普通参与者、人工任务处理。 | 只消费 Product DTO 和 signal container。 |
| Executor Kit Product API mode | 企业系统、supervised agent、脚本、未来 MCP 工具。 | 通过 prepare/sign/submit/proof 边界提交。 |
| Executor Kit chain-native mode | 高级链原生 executor、executor。 | 直接监听 `HookReady` 并提交授权 `submitSignal`。 |

多数真实集成优先走 Product API mode。chain-native mode 保留给需要低层 HookReady 和直接合约交互的执行者。
