# Submissions 与 Stage Patch

Submissions 负责记录已准备、已签名、已广播、失败、确认和可重试的提交状态。Stage Patch 是 selector 授权路径，用来在某个订单里修改目标 stage 的 executor 或 resource manifest；Plan 本身保持静态版本。

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

Submission 状态是 operational state。它可以说明一笔交易是否送出、是否失败、是否确认；订单是否进入下一阶段来自 `SignalSubmitted`、`HookReady` 或 stage patch events。

## Stage Patch 代码入口

| 文件 | 职责 |
| --- | --- |
| `src/stage-patches/service.ts` | prepare/submit executor patch 或 resource patch。 |
| `src/stage-patches/typed-data.ts` | selector-signed EIP-712 typed data。 |
| `src/stage-patches/broadcast-adapter.ts` | patch 广播适配器。 |
| `src/stage-patches/store.ts` | patch workflow storage。 |
| `src/api/routes/stage-patches.ts` | Product task patch routes。 |

## 两类 Stage Patch

| Patch | 改什么 | 边界 |
| --- | --- | --- |
| executor patch | 某个订单里 target stage 的 active executor。 | Plan 和 supplier directory 保持原状，其他 signal 仍按授权检查。 |
| resource patch | 某个订单里 target stage 的 resource handle / manifest。 | 证据明文留在链下，File Resource policy 仍按资源层解释。 |


## 边界

- selector 签名必须来自被授权的 selector，不来自 relayer。
- patch 只影响单个 order 的 overlay，不修改 plan version。
- active executor overlay 影响后续 signal authorization 检查；已经发生的 signal 仍以事件为准。
- resource manifest 是句柄和 hash，证据明文留在链下。
- patch workflow rows 可以被重建或审计；contract event 是链上 proof。
