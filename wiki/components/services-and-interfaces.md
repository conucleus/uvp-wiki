# Protocol Bindings 与公共接口

Protocol Bindings 是 UVP 代码链路中独立的一层。它把合约 ABI、EIP-712 typed data、calldata helpers、hash helpers 和 resource manifest helpers 固定成可复用接口，让 Chain Services、Order App、executor-kit、deploy scripts 和前端调试工具不需要各自手写协议细节。

UVP 的实现可以拆成多个包、服务和前端，但它们必须共享同一组公共接口。公共接口一旦漂移，Store 看到的 Plan、合约接受的 typed data、Order App 准备的 signal、executor-kit 提交的 payload 和 Chain Services 投影出的 proof 就会变成不同事实。

接口地图说明哪些接口需要稳定、由谁生成、谁消费。

## 接口地图

```text
compiler artifacts / canonical hashes
  -> protocol-bindings ABI and typed-data helpers
  -> contracts and registry events
  -> Chain Services projections and HTTP APIs
  -> Product DTO
  -> Store / Order App / executor-kit
```

| 接口 | 主要代码入口 | 消费方 | 稳定性要求 |
| --- | --- | --- | --- |
| ABI 与事件 | `uvp-protocol/contracts/uvp-contracts/src/`、`uvp-protocol/packages/protocol-bindings/src/` | Chain Services、executor-kit、deploy scripts、前端调试工具。 | 事件名、字段、indexed 语义和合约地址上下文不能随意变。 |
| EIP-712 typed data | `uvp-protocol/packages/protocol-bindings/src/`、`uvp-chain-services/service/src/submissions/`、`src/stage-patches/` | Order App、executor-kit、relayer、contracts。 | domain、type name、message 字段、deadline、nonce 和 signer recovery 必须一致。 |
| Canonical hash | `uvp-protocol/packages/compiler/src/canonical.ts`、`hash.ts` | compiler、Identity Registry workflow、Store compile preview、release checks。 | 同一份 Zhixu/manifest 在同一版本下必须得到同一 hash。 |
| Product DTO | `uvp-protocol/packages/product-dto/src/` | Chain Services、zhixu-store、uvp-order-app、executor-kit Product API mode。 | 普通用户语言稳定，低层 sourceId/signalId/ABI 细节不泄漏到普通界面。 |
| Product / Store HTTP API | `uvp-chain-services/service/src/api/routes/` | Store、Order App、executor-kit、operator scripts。 | Route、错误码、proof rows、readiness 和 authz 语义需要和 DTO 同步。 |
| CLI 与运行配置 | `uvp-executor-kit/package/src/cli.ts`、`uvp-deploy/deploy/scripts/`、`uvp-chain-services/service/src/config/` | executor、release owner、staging operator。 | 私钥只从显式 env 读取；staging/profile 配置必须 fail closed。 |

## Protocol Bindings 的位置

`@uvp-eth/protocol-bindings` 是浏览器安全的协议绑定包。它提供 ABI 常量、typed-data builders、calldata builders、地址/bytes32 校验、stage patch helpers 和 resource manifest hash helpers。

它不读环境变量，不保存私钥，不提交交易，也不做业务授权判断。Order App、executor-kit、Chain Services 和 deploy scripts 可以复用它来避免各自手写 ABI、typed data 或 calldata。

## 代码入口

| 文件 | 说明 |
| --- | --- |
| `uvp-protocol/packages/protocol-bindings/src/evm.ts` | EVM ABI、typed data、calldata 和 hash helpers。 |
| `uvp-protocol/packages/protocol-bindings/src/index.ts` | 对外导出边界。 |
| `uvp-protocol/packages/protocol-bindings/src/unsupported-chain-target.ts` | 非当前支持链目标的 fail-closed helper。 |
| `uvp-protocol/packages/protocol-bindings/test/` | 绑定层的消费者一致性测试。 |

## Drift 检查

改这些内容时，需要同时检查消费者：

- 改合约 ABI、event 或 EIP-712 domain：同步 protocol-bindings、Chain Services、executor-kit、deploy scripts 和合约/接口 reference。
- 改 compiler artifact 或 canonical hash：同步 compiler fixtures、Identity Registry publication path、Store compile preview 和 release gate。
- 改 Product DTO 或 Product API：同步 Chain Services route、Store、Order App、executor-kit Product API mode 和浏览器/API 测试。
- 改 stage executor/resource patch：同步 contracts、protocol-bindings、Chain Services stage-patches、Product task action 和 Order App/Executor Kit 消费。

公共接口让各个包围绕同一份链上事实、签名语义和产品 DTO 工作，无需把所有代码放进一个包。
