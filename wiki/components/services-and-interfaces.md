# 服务与接口

服务与接口组件回答“公开接口长什么样、谁消费谁”。真正承载 indexer、relayer、proof、Product/Store API runtime 的链下软件归到平级页面 [非可信执行层：Chain Services](chain-services.md)；本页只保留接口关系和 drift 边界。

## 组件链路

```text
ABI / EIP-712 / calldata helpers
  -> non-trusted execution layer / chain-services
  -> Product DTO / Product API
  -> Store / Order App / executor-kit / adapters
```

## 组件职责

| 组件 | 拥有的接口 | 不应承担 |
| --- | --- | --- |
| protocol-bindings | ABI、typed data、hash helpers、calldata helpers、ResourceManifest/StagePatch helpers。 | 网络请求、私钥、数据库、业务授权决策。 |
| 非可信执行层 / chain-services | Product API、Store API、submission API、evidence/proof API、notification ops、runtime diagnostics。 | 成为 plan/order/signal/hook/trust 的事实源，或替参与方签名。 |
| product-dto | ordinary user language 的 order/task/proof/trust DTO。 | HookPlan 原文、低层 sourceId/signalId、gas/ABI 细节。 |
| Store API | nucleation workspace、draft、review、supplier metadata、contact、audit、governance workflow。 | 伪造 trust attestation、替凝结核治理内部秩序或伪造业务完成。 |
| Executor Kit | signal producer CLI/SDK/MCP。 | 创建授权、托管默认私钥、替业务方签名。 |

## 先读这些

| 页面 | 作用 |
| --- | --- |
| [公共接口](../reference/public-interfaces.md) | ABI、event、EIP-712、canonical hash、DTO、API、release evidence 的 drift checklist。 |
| [非可信执行层：Chain Services](chain-services.md) | `uvp-chain-services/service` 的 indexer、relayer、proof verifier、Product API、Store API 和 runtime profile 总览。 |
| [Product BFF](../concepts/architecture/components/chain-services-bff.md) | order draft、invite、participant confirmation、authorization 和 registration workflow。 |
| [Product DTO](../concepts/product/dto.md) | 普通用户可读的 order/task/proof/trust DTO。 |
| [Product API](../reference/product-api.md) | Product 和 Store route 参考。 |
| [CLI 与配置](../reference/cli-and-config.md) | executor-kit、chain-services、frontend config 和 root scripts。 |

## 服务边界

- Protocol bindings 只提供 browser-safe ABI、typed data、calldata、hash helpers，不读 env、不持有私钥、不提交交易。
- 非可信执行层可以索引、投影、验证、转发和记录 workflow 状态，但数据库必须可重建。
- Product API 可以 prepare typed data、验证 participant signature、调用 relayer、返回 proof；它不能绕过 order-level authorization。
- Store API 可以管理 nucleation workspace、drafts、supplier metadata、audit 和 review，但不能把 metadata 写成 trust truth，也不能替凝结核治理内部秩序。
- Docking、contact、notification、resource availability 都是 workflow/projection；任何 public claim 必须回到 registry/state-machine events。
