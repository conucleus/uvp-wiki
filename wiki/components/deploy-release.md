# 部署与证据

部署与证据组件负责把本地闭环、Base Sepolia rehearsal、address manifest、release record 和 staging gate 组织成可审计工程证据。

## 阅读路径

| 页面 | 作用 |
| --- | --- |
| [Periphery 与部署](../concepts/architecture/components/periphery-deploy.md) | deploy 目录、periphery adapter 和 release boundary 的关系。 |
| [Base Sepolia Staging](../tasks/base-sepolia-staging.md) | testnet preflight、broadcast rehearsal、secret 环境和证据输出。 |
| [发布与验证](../operations/release-and-verification.md) | local baseline、Product baseline、staging gate、release evidence、claim 语言。 |
| [项目状态](../status/README.md) | 当前 verified/prototype/planned/blocked 状态。 |

## 证据边界

- `uvp-deploy/deploy/` 是本仓库 deployment state 的位置，不依赖 sibling `uvp-deploy` repo。
- Generated logs、temporary address manifests、Playwright trace、DB dump、object bytes 不应作为 release record 提交。
- Release record 只写 redacted、可审计摘要。
- Base Sepolia rehearsal 是 staging/testnet evidence，不是 production-ready。
