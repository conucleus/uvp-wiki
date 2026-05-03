# Submissions 与 Stage Patch

Submissions 负责记录已准备、已签名、已广播、失败、确认和可重试的提交状态。Stage Patch 是 selector 授权路径，用来在某个订单里修改目标 stage 的 executor 或 resource manifest，而不是改 Plan 本身。

## Submissions 代码入口

| 文件 | 职责 |
| --- | --- |
| `src/submissions/service.ts` | submission 创建、状态变更、retry、查询。 |
| `src/submissions/store.ts` | storage contract。 |
| `src/submissions/sqlite-store.ts`、`postgres-store.ts` | durable submission store。 |
| `src/submissions/typed-data.ts` | 提交相关 typed data 和签名校验辅助。 |
| `src/submissions/broadcast-adapter.ts` | broadcast adapter interface。 |
| `src/submissions/safe-broadcast-adapter.ts` | 保护广播边界。 |
| `src/api/routes/submissions.ts` | HTTP submission route。 |

## Submission 生命周期

```text
prepare typed data
  -> participant signs
  -> submit signed payload
  -> verify signer and payload structure
  -> broadcast or record broadcast_disabled
  -> track tx hash / failure / retry
  -> indexer confirms chain event
```

Submission 状态是 operational state，不是业务 truth。它可以说明一笔交易是否送出、是否失败、是否确认；不能说明订单已经进入下一阶段。下一阶段必须来自 `SignalSubmitted`、`HookReady` 或 stage patch events。

## Stage Patch 代码入口

| 文件 | 职责 |
| --- | --- |
| `src/stage-patches/service.ts` | prepare/submit executor patch 或 resource patch。 |
| `src/stage-patches/typed-data.ts` | selector-signed EIP-712 typed data。 |
| `src/stage-patches/broadcast-adapter.ts` | patch 广播适配器。 |
| `src/stage-patches/store.ts` | patch workflow storage。 |
| `src/api/routes/stage-patches.ts` | Product task patch routes。 |

## 两类 Stage Patch

| Patch | 改什么 | 不改什么 |
| --- | --- | --- |
| executor patch | 某个订单里 target stage 的 active executor。 | 不改 Plan，不改 supplier registry，不自动授权其他 signal。 |
| resource patch | 某个订单里 target stage 的 resource handle / manifest。 | 不塞入证据明文，不替代 File Resource policy。 |

Executor patch 绑定 selector 签名和 target stage。Resource patch 绑定 `resourceKey`、`manifestHash`、`policyHash`、`manifestURI`。两类 patch 不能混用字段；生产 profile 应拒绝 legacy `http`、`txcloud`、`plain_text` resource handle。

## 边界

- selector 签名必须来自被授权的 selector，不来自 relayer。
- patch 只影响单个 order 的 overlay，不修改 plan version。
- active executor overlay 影响后续 signal authorization 检查，但不能伪造已经发生的 signal。
- resource manifest 是句柄和 hash，不是证据明文。
- patch workflow rows 可以被重建或审计，但不替代 contract event。
