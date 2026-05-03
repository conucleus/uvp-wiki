# 文档规则

Wiki 的目标是让人读懂项目，不是制造第二套事实源。

## 写作原则

- 先写读者要做什么，再链接到源码和 PRD。
- 区分已实现、fixture/local demo、staging evidence、planned PRD。
- 不把 PRD 计划写成已实现功能。
- 不把 Store metadata、database row、relayer queue 写成协议事实。
- 不把 funding、USDC、escrow、guarantee 写进 core protocol 边界。
- 不暴露私钥、RPC secret、JWT secret、object storage credential。

## 信息架构规则

- `SUMMARY.md` 是唯一导航真相。新增页面后必须放进合适的一级栏目。
- 一级栏目优先按工程读者路径划分：入门、核心概念、核心组件、秩序商店、执行者与集成、产品与执行面、本地/预发/发布、参考与证据、贡献规则。
- `core` 负责“对象是什么”；`components` 负责“系统怎么实现”；`store` 负责“秩序商店怎么组织和校验真实世界对象”；`execution` 负责“执行者、adapter、AI/MCP、docked Zhixu 怎么接入和提交 signal”。
- 同一个 Markdown 文件不要在 `SUMMARY.md` 里挂到多个一级目录。不同目录需要不同侧面时，新增侧面页；旧页可以通过正文链接引用。
- `store` 页面写 Store 平台 workflow 和凝结核工作台，不要把 Store admin 写成 Zhixu 内部治理者。
- 不把所有东西塞进 `concepts/`。Supplier、Executor、compiler、Store、Product API、Signal Container、release evidence 都是一级读者路径。
- 重排时先保留旧细页和旧链接，等新结构稳定后再合并重复内容。
- `wiki/site/` 是可重建静态输出，不是编辑源。

## 文档放置

| 内容 | 放哪里 |
| --- | --- |
| 新人入口 | `wiki/README.md`、`wiki/getting-started/` |
| 核心概念入口 | `wiki/core/` |
| 核心组件入口 | `wiki/components/` |
| 秩序商店入口 | `wiki/store/` |
| 凝结核工作台 | `wiki/store/nucleation-workbench.md` |
| 执行者与集成入口 | `wiki/execution/` |
| 产品与执行面入口 | `wiki/product/` |
| 状态摘要 | `wiki/status/` |
| 概念和架构细页 | `wiki/concepts/` |
| 端到端教程 | `wiki/tutorials/` |
| 可执行操作步骤 | `wiki/tasks/` |
| API/CLI/模块速查 | `wiki/reference/` |
| 发布、证据、排障 | `wiki/operations/` |
| 文档维护规则 | `wiki/contribute/` |

PRD 仍放在 `docs/product/`。Release record 仍放在 `uvp-deploy/deploy/releases/`。
模块局部命令仍放在各模块 `README.md`。

## 更新 checklist

改协议 public interface 时：

- 更新 [公共接口](../reference/public-interfaces.md)；
- 更新 [合约与事件](../reference/contracts-and-events.md)；
- 更新 [产物与哈希](../concepts/artifacts-and-hashes.md)；
- 确认 fixture verifier 命令仍正确。

改 Product API 时：

- 更新 [Product API 参考](../reference/product-api.md)；
- 更新 [产品与执行面](../product/README.md)；
- 更新 Store/Order App/Executor Kit 相关任务文档；
- 标明旧 route 是否只是 compatibility alias。

改 Store / Supplier / Zhixu 管理路径时：

- 更新 [秩序商店](../store/README.md)；
- 更新 [凝结核工作台](../store/nucleation-workbench.md)；
- 同步 [核心概念](../core/README.md) 中的对象边界；
- 说明 Store metadata、平台标签、联系信息、通知状态、审核状态、履约记录视图不能替代链上事件或 trust-domain 背书；
- 说明凝结核内部治理、Store 平台 workflow、trust-domain 外部背书三者的边界。

改 Executor / executor-kit / docked Zhixu 路径时：

- 更新 [执行者与集成](../execution/README.md)；
- 更新 [Executor](../concepts/core/executor.md)；
- 更新 [Zhixu 作为 Executor](../execution/zhixu-as-executor.md)；
- 说明 Product task、Store docking session、adapter job 不能替代链上 order/signal proof。

改 release/staging gate 时：

- 更新 [Base Sepolia Staging](../tasks/base-sepolia-staging.md)；
- 更新 [发布与验证](../operations/release-and-verification.md)；
- 更新 [项目状态](../status/README.md)；
- 不写 secret 值。

新增 periphery adapter 时：

- 说明它消费哪些 core interface；
- 说明它不拥有哪些事实；
- 不把 adapter event 当成 order/trust/funding source of truth。
