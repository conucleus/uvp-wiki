# Product API

Product API 是普通参与者、Order App、executor-kit 和 agent adapter 消费非可信执行层的主要入口。它把链事件 projection 翻译成 ordinary user language 的订单、任务、时间线、证明和提交容器。

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

| 路由 | 用途 |
| --- | --- |
| `GET /product/zhixus` | 返回可创建订单的 Zhixu catalog projection。 |
| `GET /product/orders`、`GET /product/orders/:orderId` | 查询订单 projection。 |
| `GET /product/orders/:orderId/timeline` | 查询链事件重建的 timeline。 |
| `GET /product/orders/:orderId/proof` | 查询 proof rows、tx/block/event context。 |
| `GET /product/tasks`、`GET /product/tasks/:taskId` | 查询任务 projection。 |
| `GET /product/me`、`GET /product/me/tasks` | 按显式 wallet 查询普通参与者任务。 |
| `POST /product/tasks/:taskId/prepare-submit` | 准备 signal submit typed data。 |
| `POST /product/tasks/:taskId/submit` | 提交 participant-signed signal payload。 |
| `POST /product/evidence` | 写入 evidence metadata / object handle。 |
| `GET /product/staging/readiness` | release evidence gate 的 Product API readiness。 |

`/product/flows` 不应出现。Product object 是 Zhixu order，不是传统线性 flow。

## 语言边界

Product API 应该隐藏 HookPlan、sourceId、signalId、ABI、gas 等底层细节，让普通用户看到“订单、任务、证据、证明、下一步”。但 proof 字段必须保留高级读者需要的 tx hash、block、log index、contract address、chain id 和 event 类型。

## `/product/me`

`/product/me` 必须从显式 wallet 地址过滤任务，可以来自 query、header 或钱包上下文。它不能根据 display name、role label 或 Store metadata 猜 authority。返回的任务仍然要来自 state-machine projection 和 order-level submitter authorization。

## 边界

- Product API 可以 prepare typed data、验证签名、调用 relayer、返回 proof。
- Product API 不能绕过 order-level authorization。
- Product API 不能把 draft、submission status 或 notification state 写成 hook truth。
- Revoked plan/supplier 不能通过 fallback 被包装成 active。
- Staging readiness 是服务实例健康和边界检查，不是生产可用声明。
