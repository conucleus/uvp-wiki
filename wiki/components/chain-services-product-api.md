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

Product object 是订单 (Order)，即某个秩序 (Zhixu) 的一次运行；文档和 route 命名不要再引入 `/product/flows` 这种传统线性 flow 口径。

## 语言边界

Product API 应该隐藏 HookPlan、sourceId、signalId、ABI、gas 等底层细节，让普通用户看到“订单、任务、证据、证明、下一步”。但 proof 字段必须保留高级读者需要的 tx hash、block、log index、contract address、chain id 和 event 类型。

## `/product/me`

`/product/me` 必须从显式 wallet 地址过滤任务，可以来自 query、header 或钱包上下文。display name、role label 或 Store metadata 只能辅助展示，authority 来自 state-machine projection 和 order-level submitter authorization。

## 边界

- Product API 可以 prepare typed data、验证签名、调用 relayer、返回 proof。
- order-level authorization 仍由合约检查。
- draft、submission status 或 notification state 写成 workflow/projection 状态。
- revoked plan/supplier 在 Product API 中保持 revoked/blocked 展示。
- Staging readiness 是服务实例健康和边界检查；production claim 需要 release evidence。
