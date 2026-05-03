# Product API

The Product API is the main entry point for ordinary participants, the Order App, executor-kit, and agent adapters to consume the non-trusted execution layer. It translates chain-event projections into orders, tasks, timelines, proofs, and submission containers in ordinary user language.

## Code Entry Points

| File | Responsibility |
| --- | --- |
| `src/product/service.ts` | Product order/task/timeline/proof projection service. |
| `src/product/staging-readiness.ts` | staging readiness gate and redacted readiness summary. |
| `src/api/routes/product-read.ts` | Product read routes. |
| `src/api/routes/evidence.ts` | Product evidence route. |
| `src/api/routes/stage-patches.ts` | Product stage patch prepare/submit routes. |
| `src/api/routes/submissions.ts` | Product submission status routes. |

## Core Routes

| Route | Purpose |
| --- | --- |
| `GET /product/zhixus` | returns the Zhixu catalog projection that can be used to create orders. |
| `GET /product/orders`, `GET /product/orders/:orderId` | queries order projections. |
| `GET /product/orders/:orderId/timeline` | queries the timeline rebuilt from chain events. |
| `GET /product/orders/:orderId/proof` | queries proof rows, tx/block/event context. |
| `GET /product/tasks`, `GET /product/tasks/:taskId` | queries task projections. |
| `GET /product/me`, `GET /product/me/tasks` | queries ordinary participant tasks by explicit wallet. |
| `POST /product/tasks/:taskId/prepare-submit` | prepares signal submit typed data. |
| `POST /product/tasks/:taskId/submit` | submits participant-signed signal payload. |
| `POST /product/evidence` | writes evidence metadata / object handle. |
| `GET /product/staging/readiness` | Product API readiness for the release evidence gate. |

The Product object is an Order, meaning one runtime instance of a Zhixu. Do not reintroduce a traditional linear `/product/flows` framing in the docs or route names.

## Language Boundary

The Product API should hide low-level details such as HookPlan, sourceId, signalId, ABI, and gas so ordinary users see “orders, tasks, evidence, proof, next step.” But proof fields must retain the tx hash, block, log index, contract address, chain id, and event type needed by advanced readers.

## `/product/me`

`/product/me` must filter tasks from an explicit wallet address, which can come from a query, header, or wallet context. Display names, role labels, or Store metadata may only assist presentation; authority comes from state-machine projection and order-level submitter authorization.

## Boundary

- The Product API may prepare typed data, verify signatures, call the relayer, and return proof.
- Order-level authorization is still checked by the contract.
- Draft, submission status, and notification state are modeled as workflow/projection state.
- Revoked plan/supplier entries remain shown as revoked/blocked in the Product API.
- Staging readiness is service-instance health and boundary checking; production claims require release evidence.
