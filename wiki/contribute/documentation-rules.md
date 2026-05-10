# 文档规则

Wiki 的目标是让人读懂项目，并把源码、测试、ABI fixture、PRD 记录和 release evidence 整理成同一套阅读路径。协议事实仍以代码、链事件和可复跑证据为准。

## 写作原则

- 先写读者要做什么，再链接到源码和 PRD。
- 首次出现专有名词时用中文优先写法，例如“秩序 (Zhixu)”和“订单 (Order)”。
- 每个核心对象页先写“是什么 / 谁使用 / 产生什么结果 / 权威来自哪里”，再写边界检查。
- 优先用直接定义作为主解释结构；确实需要硬边界时，放到“边界检查”或 checklist。
- 区分已实现、fixture/local demo、staging evidence、planned PRD。
- PRD 计划按 planned/prototype 写，已实现功能需要代码、测试或 release evidence 支撑。
- Store metadata、database row、relayer queue 标注为读模型或 workflow 状态；协议事实标注为 registry/state-machine event。
- funding、USDC、escrow、guarantee 写在 adapter/periphery 边界内。
- 私钥、RPC secret、JWT secret、object storage credential 只写 redacted 口径。

## 信息架构规则

- `SUMMARY.md` 是唯一导航真相。新增页面后必须放进合适的一级栏目。
- 一级栏目优先按工程读者路径划分：入门、核心概念、核心组件、秩序商店、执行者与集成、Product DTO 与用户表面、本地/预发/发布、参考与证据、贡献规则。
- `core` 负责“对象是什么”；`components` 负责“系统怎么实现”；`store` 负责“秩序商店怎么组织和校验真实世界对象”；`execution` 负责“执行者、adapter、AI/MCP、docked Zhixu 怎么接入和提交 signal”。
- 同一个 Markdown 文件只在 `SUMMARY.md` 里挂到一个一级目录。不同目录需要不同侧面时，新增侧面页；旧页可以通过正文链接引用。
- `store` 页面写 Store 平台 workflow 和凝结核工作台；Store admin 是平台 workflow 角色，凝结核是秩序内部治理者。英文主体名用 `Nucleus`，`nucleation` 只用于 `spec.nucleation.id` 等字段或成核上下文。
- Supplier、Executor、compiler、Store、Product API、Signal Container、release evidence 都是一级读者路径，按读者入口分布。
- 重排时先保留旧细页和旧链接，等新结构稳定后再合并重复内容。
- `wiki/site/` 是可重建静态输出，编辑源在 Markdown。

## 文档放置

| 内容 | 放哪里 |
| --- | --- |
| 新人入口 | `wiki/README.md`、`wiki/getting-started/` |
| 核心概念入口 | `wiki/core/` |
| 深入组件章节 | `wiki/components/` |
| 秩序商店入口 | `wiki/store/` |
| 凝结核工作台 | `wiki/store/nucleation-workbench.md` |
| 执行者与集成入口 | `wiki/execution/` |
| Product DTO 与用户表面入口 | `wiki/product/` |
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
- 更新 [Product DTO 与用户表面](../product/README.md)；
- 更新 Store/Order App/Executor Kit 相关任务文档；
- 标明旧 route 是否只是 compatibility alias。

改 Store / Supplier / Zhixu 管理路径时：

- 更新 [秩序商店](../store/README.md)；
- 更新 [凝结核工作台](../store/nucleation-workbench.md)；
- 同步 [核心概念](../core/README.md) 中的对象边界；
- 说明 Store metadata、平台标签、联系信息、通知状态、审核状态、履约记录视图属于读模型或 workflow，链上事件和 trust-domain 背书另行展示；
- 说明凝结核内部治理、Store 平台 workflow、trust-domain 外部背书三者的边界。

改 Executor / executor-kit / docked Zhixu 路径时：

- 更新 [执行者与集成](../execution/README.md)；
- 更新 [Executor](../concepts/core/executor.md)；
- 更新 [Zhixu 作为 Executor](../execution/zhixu-as-executor.md)；
- 说明 Product task、Store docking session、adapter job 是工作流索引，链上 order/signal/docking proof 另行展示。

改 release/staging gate 时：

- 更新 [Base Sepolia Staging](../tasks/base-sepolia-staging.md)；
- 更新 [发布与验证](../operations/release-and-verification.md)；
- 更新 [项目状态](../status/README.md)；
- 不写 secret 值。

新增 periphery adapter 时：

- 说明它消费哪些 core interface；
- 说明它不拥有哪些事实；
- adapter event 标注为 adapter 侧事实，order/trust/funding source of truth 分别引用对应 core interface 或 periphery 合约。
