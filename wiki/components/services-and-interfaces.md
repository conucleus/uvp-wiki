# 服务与接口

服务与接口组件回答“公开接口长什么样、谁消费谁”。真正承载 indexer、relayer、proof、Product/Store API runtime 的链下软件归到平级页面 [可重建服务层：Chain Services](chain-services.md)；本页只保留接口关系和 drift 边界。

## 组件链路

```text
ABI / EIP-712 / calldata helpers
  -> rebuildable Chain Services projection
  -> Product DTO / Product API
  -> Store / Order App / executor-kit / adapters
```

## 组件职责

| 组件 | 拥有的接口 | 职责边界 |
| --- | --- | --- |
| protocol-bindings | ABI、typed data、hash helpers、calldata helpers、ResourceManifest/StagePatch helpers。 | 网络请求、私钥、数据库、业务授权决策。 |
| 可重建服务层 / chain-services | Product API、Store API、submission API、evidence/proof API、notification ops、runtime diagnostics。 | 事实源来自链事件，业务签名来自参与方。 |
| product-dto | ordinary user language 的 order/task/proof/trust DTO。 | HookPlan 原文、低层 sourceId/signalId、gas/ABI 细节。 |
| Store API | nucleation workspace、draft、review、supplier metadata、contact、audit、governance workflow。 | trust attestation、凝结核内部治理和业务完成分别由 registry、凝结核、state-machine proof 表达。 |
| Executor Kit | signal producer CLI/SDK/MCP。 | 授权创建、默认私钥托管和业务签名分别由 Product/registrar、密钥系统和业务方钱包处理。 |

## 先读这些

| 页面 | 作用 |
| --- | --- |
| [公共接口](../reference/public-interfaces.md) | ABI、event、EIP-712、canonical hash、DTO、API、release evidence 的 drift checklist。 |
| [可重建服务层：Chain Services](chain-services.md) | `uvp-chain-services/service` 的 indexer、relayer、proof verifier、Product API、Store API 和 runtime profile 总览。 |
| [Product BFF](../concepts/architecture/components/chain-services-bff.md) | Backend-for-Frontend workflow，处理 order draft、invite、participant confirmation、authorization 和 registration。 |
| [Product DTO](../concepts/product/dto.md) | 普通用户可读的 order/task/proof/trust DTO。 |
| [Product API](../reference/product-api.md) | Product 和 Store route 参考。 |
| [CLI 与配置](../reference/cli-and-config.md) | executor-kit、chain-services、frontend config 和 root scripts。 |

## 服务边界

- Protocol bindings 只提供 browser-safe ABI、typed data、calldata、hash helpers，不读 env、不持有私钥、不提交交易。
- Chain Services 可以索引、投影、验证、转发和记录 workflow 状态，但数据库必须可重建。
- Product API 可以 prepare typed data、验证 participant signature、调用 relayer、返回 proof；order-level authorization 仍由合约检查。
- Store API 可以管理 nucleation workspace、drafts、supplier metadata、audit 和 review；metadata 写成 workflow/material，trust truth 看 registry projection，内部秩序治理归凝结核。
- Docking、contact、notification、resource availability 都是 workflow/projection；任何 public claim 必须回到 registry/state-machine events。
