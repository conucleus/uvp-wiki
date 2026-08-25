---
title: 文档规则
type: meta
audience: 文档贡献者
status: verified
---

# 文档规则

Wiki 的目标是让人读懂项目，并把源码、测试、ABI fixture、PRD 记录和 release evidence 整理成同一套阅读路径。协议事实仍以代码、链事件和可复跑证据为准。

## 内容类型（Diátaxis）

每个页面必须唯一归入以下五类之一，并用 front-matter 的 `type` 字段声明：

| type | 目录 | 回答的问题 |
| --- | --- | --- |
| `tutorial` | `tutorials/` | "带我第一次走通它"——叙事 + 上手，愿景论证放 `tutorials/why-uvp.md` 或根 `whitepaper.md` |
| `explanation` | `concepts/` | "我该如何理解它"——协议对象、架构、组件、边界解释 |
| `how-to` | `how-to/` | "我要完成某件事"——按读者目标组织的步骤，每页声明前置条件与验证命令 |
| `reference` | `reference/` | "权威事实是什么"——API、CLI、事件、哈希、版本速查，以代码与 fixtures 为真值核对 |
| `meta` | 根 README/SUMMARY、`meta/` | 导航、项目状态、文档规则等元信息 |

## Front-matter

每个 md 页面（stub 除外）顶部必须有：

```yaml
---
title: <与 H1 一致>
type: tutorial | explanation | how-to | reference | meta
audience: 协议读者 | 应用开发者 | 工程贡献者 | 运维 | 全部读者 | 文档贡献者
preread: <可选；建议先读页面的相对路径>
status: verified | prototype | planned | archived
---
```

- `status` 口径与 [项目状态](status.md) 一致：verified=有代码/测试/replay 支撑；prototype=demo/部分实现；planned=仅 PRD/计划；archived 仅用于兼容旧路径的重定向 stub。
- stub 是唯一允许省略部分字段的页面形态：一行说明迁移去向即可。

## 写作原则

- 先写读者要做什么，再链接到源码和 PRD。
- 首次出现专有名词时用中文优先写法，例如"秩序 (Zhixu)"和"订单 (Order)"。
- 每个协议对象页按「是什么 / 谁使用 / 产生什么结果 / 权威来自哪里」组织；需要硬边界时用一句话引用 [协议边界](../concepts/protocol-boundaries.md)。
- **协议不变量只有一个定义处**（`concepts/protocol-boundaries.md`）。其他页面只做一句话概括并链接，禁止整段复述。
- 区分已实现、fixture/local demo、staging evidence、planned PRD；拿不准的事实标 `<!-- TODO(confirm): ... -->`，禁止编写内容填补；页面发布前把注释转换为「待确认」引用块，避免构建站渲染出转义乱码。
- Front-matter 字段固定为 `title` / `type` / `audience` / `preread` / `status`；`preread` 只写一个裸相对路径（如 `../core/executor.md`），不加引号、不写成 markdown 链接；正文 H1 下的「前置阅读」引用块须与该字段保持一致。
- Store metadata、database row、relayer queue 标注为读模型或 workflow 状态；协议事实标注为 registry/state-machine event。
- funding、USDC、escrow、guarantee 写在 periphery 边界内。
- 私钥、RPC secret、JWT secret、object storage credential 只写 redacted 口径。

## 信息架构规则

- `SUMMARY.md` 是唯一导航真相。每个正文页面在 SUMMARY 中恰好出现一次；stub 不进入 SUMMARY。
- 一级栏目固定为六类：学习路径、核心概念、架构与运行时、操作指南、参考、项目元信息（可按需细分二级条目）。
- 同一个文件只在 SUMMARY 中挂载一次；不同侧面通过正文互链表达。
- 英文主体名用 `Nucleus`，`nucleation` 只用于 `spec.nucleation.id` 等字段或成核上下文。
- 移动或合并页面时必须在旧路径留下 `status: archived` 的 stub，避免外链失效。
- `en/` 是中文源的英文镜像，目录结构与 zh 保持同构；两侧行动保持同步，以 zh 为准。
- `wiki/site/` 是可重建静态输出，已被 `.gitignore` 排除，不提交。

## 文档放置

| 内容 | 放哪里 |
| --- | --- |
| 新人入口 | `wiki/README.md`、`tutorials/` |
| 协议对象与架构解释 | `concepts/`（含 `core/`、`state-machine/`、`artifacts/`、`trust/`、`product/`、`services/`、`store/`、`apps/`） |
| 可执行操作步骤 | `how-to/` |
| API/CLI/模块/事件速查 | `reference/` |
| 项目状态、部署证据、文档规则 | `meta/` |

PRD 仍放在 `docs/product/`。Release record 仍放在 `uvp-deploy/deploy/releases/`。模块局部命令仍放在各模块 `README.md`。

## 更新 checklist

改协议 public interface 时：

- 更新 [公共接口](../reference/public-interfaces.md)；
- 更新 [合约与事件](../reference/contracts-and-events.md)；
- 更新 [Canonical Hash](../concepts/artifacts/canonical-hashes.md) 与 [链上注册参数](../concepts/artifacts/solidity-registration.md)；
- 确认 fixture verifier 命令仍正确（步骤见 [排障](../how-to/troubleshooting.md)）；
- 若涉及不变量表述，更新 [协议边界](../concepts/protocol-boundaries.md)。

改 Product API 时：

- 更新 [Product API 端点速查](../reference/product-api-endpoints.md)；
- 更新 [Product DTO 与用户表面](../concepts/product/README.md) 与相关 services 页；
- 同步 Store / Order App / Executor Kit 相关 how-to 与概念页。

改 Store / Supplier / Zhixu 管理路径时：

- 更新 [秩序商店](../concepts/store/README.md) 及其子页；
- 说明相关状态属于读模型还是链上事件（引用协议边界，不复述）；
- 保持凝结核内部治理、Store 平台 workflow、Store or external institution 外部材料审核三者边界清晰。

改 Executor / executor-kit / docked Zhixu 路径时：

- 更新 [Executor Kit](../concepts/apps/executor-kit.md)、[Zhixu 作为 Executor](../concepts/apps/zhixu-as-executor.md)、[Order App](../concepts/apps/order-app.md)；
- CLI 语法同步 [CLI 与配置](../reference/cli-and-config.md)。

改 release/staging gate 时：

- 更新 [Base Sepolia 预发](../how-to/base-sepolia-staging.md)、[发布与验证](../how-to/release-checklist.md)、[项目状态](status.md)；
- 不写 secret 值。

新增 periphery adapter 时：

- 说明它消费哪些 core interface；
- 说明它不拥有哪些事实；
- adapter event 标注为 adapter 侧事实，order/trust/funding source of truth 分别引用对应 core interface 或 periphery 合约。
