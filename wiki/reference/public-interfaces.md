---
title: 公共接口
type: reference
audience: 工程贡献者
status: verified
---

# 公共接口

`uvp-eth` 的公共接口包括 ABI、event、EIP-712、canonical hash、artifact schema、Product DTO、deployment manifest、HTTP API 和 release evidence。这些接口都会被其他模块或外部审计消费。

改这些内容时，应当按协议边界处理，并同步 fixture、消费者、参考文档和 release 口径。

## Protocol Bindings 的位置

`@uvp-eth/protocol-bindings` 是浏览器安全的协议绑定包。它提供 ABI 常量、typed-data builders、calldata builders、地址/bytes32 校验、stage patch helpers 和 resource manifest hash helpers。

它不读环境变量，不保存私钥，不提交交易，也不做业务授权判断。Order App、executor-kit、Chain Services 和 deploy scripts 可以复用它来避免各自手写 ABI、typed data 或 calldata。

## 接口地图

| 接口 | 主要 owner | 消费方 | 改动要求 |
| --- | --- | --- | --- |
| Solidity ABI / bytecode / function selector | `uvp-protocol/contracts/uvp-contracts` | protocol-bindings、chain-services、executor-kit、deploy scripts、release gates | 更新 fixture、bindings、contract tests、deploy/replay tests 和 release note。 |
| Event name / topic / indexed fields | contracts | indexer、statemachine replay、Product projection、proof verifier | 更新 replay oracle、projection tests、contracts/events reference。 |
| EIP-712 domain / typed data | contracts、protocol-bindings | Product submit、relayer、executor-kit、wallet UI | 更新 digest helpers、signing tests、staging domain check；staging 不能回退到旧 `0.1` domain。 |
| Canonical hash / artifact schema | compiler、hook-core、statemachine | Plan publication、commitPlan/finalizePlan、release evidence | 更新 golden fixtures、canonical hash docs、compiler/statemachine tests。 |
| Product DTO | product-dto | chain-services、Store、Order App、executor-kit、periphery adapter | 更新 DTO tests、route tests、frontend/API consumers 和 ordinary-user copy。 |
| Product API | chain-services | Store、Order App、executor-kit Product API mode、MCP adapter | 更新 API reference、route tests、browser E2E、failure language。 |
| Deployment manifest | uvp-deploy/deploy | chain-services、staging scripts、release records | 只提交 curated manifest/evidence；local generated address files 默认不提交。 |
| Release evidence schema | uvp-deploy/deploy | release owner、audit、PRD101 evidence pack <!-- TODO(confirm): PRD101 现指哪个 PRD？docs/product 下无 prd-101 --> | 保持 no-secret、redacted、可审计；不要把 raw logs 或 object bytes 当作 release record。 |
| Store Console HTTP API | chain-services（`uvp-chain-services/service/src/api/routes/`） | Store workbench、operator scripts | route、错误码、proof rows 和 authz 语义需要和 DTO 同步；更新 Store 前端消费者与 route tests。 |
| CLI 与运行配置 | executor-kit、chain-services config、deploy scripts | executor、release owner、staging operator | 私钥只从显式 env 读取；staging/profile 配置必须 fail closed；更新 CLI reference 与 profile tests。 |

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

## 非接口状态

- Store metadata 是平台 workflow 和材料状态，Identity Registry binding 是主体与钱包的链上对应记录；详见 [读模型边界](../concepts/protocol-boundaries.md#读模型边界)。
- Product BFF database 是可重建读模型，plan/order/signal/hook 的 source of truth 是链上事件；详见 [事实源](../concepts/protocol-boundaries.md#事实源)。
- Relayer 配置是广播配置，业务授权来自 order authorization 和签名；详见 [授权与签名](../concepts/protocol-boundaries.md#授权与签名)。
- Demo fallback、fixture catalog、mock frontend mode 只能支撑 demo 或测试口径；完整边界见 [协议边界](../concepts/protocol-boundaries.md)。
- Funding、USDC、escrow、guarantee、settlement adapter 属于 adapter/periphery；详见 [外围适配](../concepts/protocol-boundaries.md#外围适配)。

## 相关参考

- [合约与事件](contracts-and-events.md)
- [Product API](product-api.md)
- [CLI 与配置](cli-and-config.md)
- [模块地图](module-map.md)
- [发布与验证](../operations/release-and-verification.md)
