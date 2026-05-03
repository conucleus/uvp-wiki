# 公共接口

`uvp-eth` 的公共接口不是只有 HTTP API。ABI、event、EIP-712、canonical hash、artifact schema、Product DTO、deployment manifest 和 release evidence 都会被其他模块或外部审计消费。

改这些内容时，应当按协议边界处理，而不是按普通重构处理。

## 接口地图

| 接口 | 主要 owner | 消费方 | 改动要求 |
| --- | --- | --- | --- |
| Solidity ABI / bytecode / function selector | `uvp-protocol/contracts/uvp-contracts` | protocol-bindings、chain-services、executor-kit、deploy scripts、release gates | 更新 fixture、bindings、contract tests、deploy/replay tests 和 release note。 |
| Event name / topic / indexed fields | contracts | indexer、statemachine replay、Product projection、proof verifier | 更新 replay oracle、projection tests、contracts/events reference。 |
| EIP-712 domain / typed data | contracts、protocol-bindings | Product submit、relayer、executor-kit、wallet UI | 更新 digest helpers、signing tests、staging domain check；staging 不能回退到旧 `0.1` domain。 |
| Canonical hash / artifact schema | compiler、hook-core、statemachine | trust registry、registerPlan、release evidence | 更新 golden fixtures、canonical hash docs、compiler/statemachine tests。 |
| Product DTO | product-dto | chain-services、Store、Order App、executor-kit、periphery adapter | 更新 DTO tests、route tests、frontend/API consumers 和 ordinary-user copy。 |
| Product API | chain-services | Store、Order App、executor-kit Product API mode、MCP adapter | 更新 API reference、route tests、browser E2E、failure language。 |
| Deployment manifest | uvp-deploy/deploy | chain-services、staging scripts、release records | 只提交 curated manifest/evidence；local generated address files 默认不提交。 |
| Release evidence schema | uvp-deploy/deploy | release owner、audit、PRD101 evidence pack | 保持 no-secret、redacted、可审计；不要把 raw logs 或 object bytes 当作 release record。 |

## Drift checklist

改公共接口时至少检查：

```text
contracts/tests
fixtures
protocol-bindings
compiler/statemachine replay
chain-services indexer/projection/routes
Product DTO tests
Store / Order App / executor-kit consumers
deploy scripts and release gates
wiki reference pages
release record or PRD trace
```

## 不能伪装成接口的内容

- Store metadata 不是 trust registry attestation。
- Product BFF database 不是 plan/order/signal/hook 的 source of truth。
- Relayer 配置不是业务授权。
- Demo fallback、fixture catalog、mock frontend mode 不是 chain-backed Product claim。
- Funding、USDC、escrow、guarantee、settlement adapter 不是 core protocol state，除非通过明确的 signal/event boundary 被状态机消费。

## 相关参考

- [合约与事件](contracts-and-events.md)
- [Product API](product-api.md)
- [CLI 与配置](cli-and-config.md)
- [模块地图](module-map.md)
- [发布与验证](../operations/release-and-verification.md)
