---
title: Product API
type: explanation
audience: 应用开发者
status: verified
---

# Product API

Product API 是普通参与者、Order App、executor-kit 和 agent adapter 消费可重建服务层的主要入口。它把链事件 projection 翻译成 ordinary user language 的订单、任务、时间线、证明和提交容器。

## 代码入口

| 文件 | 职责 |
| --- | --- |
| `src/product/service.ts` | Product order/task/timeline/proof projection service。 |
| `src/product/staging-readiness.ts` | staging readiness gate 和 redacted readiness summary。 |
| `src/api/routes/product-read.ts` | Product read routes。 |
| `src/api/routes/evidence.ts` | Product evidence route。 |
| `src/api/routes/stage-patches.ts` | Product stage patch prepare/submit routes。 |
| `src/api/routes/submissions.ts` | Product submission status routes。 |

## 核心路由

完整路由清单见 [Product API 端点速查](../../reference/product-api-endpoints.md)。

Product object 是订单 (Order)，即某个秩序 (Zhixu) 的一次运行；route 命名保持 order/task/proof 口径，不引入 `/product/flows` 这类传统线性 flow 语义。

## 语言边界

Product API 对普通用户隐藏 HookPlan、sourceId、signalId、ABI、gas 等底层细节，把链上状态翻译成“订单、任务、证据、证明、下一步”。proof 字段仍保留高级读者需要的 tx hash、block、log index、contract address、chain id 和 event 类型。

## `/product/me`

`/product/me` 必须从显式 wallet 地址过滤任务，可以来自 query、header 或钱包上下文。display name、role label 或 Store metadata 只能辅助展示，authority 来自 state-machine projection 和 order-level submitter authorization。

## 边界

- Product API 可以 prepare typed data、验证签名、调用 relayer、返回 proof。
- order-level authorization 仍由合约检查。
- draft、submission status 或 notification state 标注为 workflow/projection 状态。
- revoked plan/supplier 在 Product API 中保持 revoked/blocked 展示。
- Staging readiness 是服务实例健康和边界检查；production claim 需要 release evidence。
