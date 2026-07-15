# Notifications 与 Reconcile

Notifications 和 Reconcile 是可重建服务层里的运行辅助系统。前者把链事件和 supplier profile 转成可重试通知意图；后者检查 submission、projection 和链确认状态是否需要修复。

## Notifications 代码入口

| 文件 | 职责 |
| --- | --- |
| `src/notifications/service.ts` | notification profile、delivery intent、retry、dead-letter。 |
| `src/notifications/config.ts` | delivery adapter 和 runtime 配置。 |
| `src/notifications/profile.ts` | supplier notification profile。 |
| `src/api/routes/notifications.ts` | supplier/admin notification routes。 |

## Notification 来源

通知可以从这些事实派生：

- `HookReady`：某个环节已经 ready，需要通知对应执行方。
- order-level submitter authorization：谁有资格提交某个 signal。
- supplier identity projection：供应商是否 active/revoked。
- supplier contact profile：如何联系、通知偏好、负责人、可用时段。

通知派生自这些事实。delivery state 说明服务是否尝试发送、是否失败、是否进入 retry 或 dead-letter。

## Reconcile 代码入口

| 文件 | 职责 |
| --- | --- |
| `src/reconcile/worker.ts` | background reconciliation loop。 |
| `src/reconcile/status.ts` | reconcile status and diagnostics。 |
| `src/reconcile/index.ts` | module export。 |

Reconcile 主要检查：

- submission 是否有 tx hash 但 projection 还没看到对应 event。
- relayer retry/failure 是否需要操作员介入。
- indexer sync lag 是否影响 Product API readiness。
- projection 是否落后于 active deployment。

## 边界

- 通知成功是联系状态；signal submitted 看 state-machine event。
- dead-letter 是通知状态；业务失败由秩序/状态机语义表达。
- reconcile 可以提示修复或重试；链上状态只能由交易和事件改变。
- ops diagnostics 必须 redacted，private key、JWT secret、RPC secret 或 storage credential 不进入输出。
