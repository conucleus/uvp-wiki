---
title: 项目状态
type: meta
audience: 全部读者
status: verified
---

# 项目状态

本页只描述当前代码基线。具体版本以[版本与语义矩阵](../reference/version-matrix.md)及仓库内的可执行校验为准。

## 当前主干

| 区域 | 当前能力 |
| --- | --- |
| Core / compiler | Rust core 定义 Hook 规范语义；编译器生成确定性的 HookPlan 与 EVM artifact。 |
| Contracts | `UVPStateMachine` 处理 Plan、Order、授权、Signal、timer 与 Hook；部署时登记的 modules 随部署冻结。 |
| Identity Registry | `UVPIdentityRegistry` 记录线下 subject 与钱包绑定，并支持绑定撤销。 |
| Chain Services | 从链事件重建 Plan、Order、task、proof、identity 与 deployment 投影，并承载链下工作流数据。 |
| Store | 维护 Zhixu 展示、供应商资料、搜索匹配、推荐、联系与治理审计等 Store 数据。 |
| Order App / executor-kit | 参与者读取被分配的任务、准备签名、提交业务动作并核对证明。 |

## 当前边界

- Plan 由 `UVPStateMachine` 发布，Plan 身份由发布者与提交内容共同确定。
- Order 只保存执行所需的引用、参与者与授权。
- Supplier 能力、标签、声誉、匹配和推荐属于 Store 的链下数据。
- Identity Registry 只证明某个 Registry 对 subject/account 绑定作过登记；业务授权由 Plan 能力与 Order 明确授权共同产生。
- 链上事件可重放；Store 的名称、联系信息、搜索数据和工作流状态需要独立持久化与备份。
- `uvp-order-app` 已是独立 participant app 边界，但尚未被同一条 Base Sepolia Product API 真实任务流完整证明。

## 验证入口

```bash
pnpm check
pnpm verify:protocol-freeze
pnpm no-spend:safety
pnpm -r --if-present --workspace-concurrency=1 run test
```

合约测试在 `uvp-protocol/contracts/uvp-contracts` 中运行 `forge test`。Store 前端在 `zhixu-store/app` 中运行 `pnpm build`。
