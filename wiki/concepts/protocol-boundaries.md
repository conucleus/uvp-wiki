---
title: 协议边界（不变量总纲）
type: explanation
audience: 协议读者
preread: README.md
status: verified
---

# 协议边界（不变量总纲）

> 前置阅读：[核心概念](README.md)
本页是 UVP 协议边界的唯一权威陈述处。全站其他页面遇到这些边界时只做一句话引用并链接到这里，不再各自复述完整版本。协议事实以代码、`uvp-protocol/contracts/uvp-contracts/fixtures/`、链事件和 release 记录为准；本页表述与实现冲突时，以实现为准并修订本页。

## 事实源

合约和链事件是 plan、order、signal、hook、publication、deployment cutover 的唯一事实源。后端、Store、Order App、executor-kit 和 periphery adapter 只能消费、投影、展示、中继或扩展核心状态，不能改写它们。数据流与判定规则详见 [数据流与事实源](data-flow-and-truth.md)。

## 可重建性

Indexer 数据库、Product BFF database、Store workflow 状态等一切链下持久化都必须能从配置的 deployment block 起由链事件擦除重建。它们可以缓存、加速和丰富体验，但不能成为事实源，也不能在重建后残留无法解释的状态。操作口径见 [Storage、Migration 与 Runtime Profile](services/storage-runtime.md)。

## 读模型边界

Store metadata 是读模型：供应商能力、标签、声誉、搜索排序、推荐、联系信息、审核状态、通知状态、docking session 与 operator audit 都是 Store 或 Product 侧的链下商业与 workflow 数据，不构成协议事实。业务是否推进永远看 registry/state-machine 事件（如 `PlanFinalized`、`OrderRegistered`、`SignalSubmitted`、`HookReady`）。典型例子：`approved_for_broadcast` 只表示 Store 愿意执行下一步，Plan 是否可用以 `UVPStateMachine` 中是否 finalized 为准。

## 身份边界

`UVPIdentityRegistry` 只登记线下 subject 与钱包的可撤销绑定（`IdentityBindingRegistered` / `IdentityBindingRevoked`），帮助解析"这个账户代表谁"。它不认证 Plan，不记录能力或信誉，不是 StateMachine 准入条件；能力判断属于凝结核与 Store 链下判断。详见 [Contracts 与 Registries](contracts-and-registries.md) 与 [Store or external institution](trust/domains.md)。

## 授权与签名

- 业务签名只能来自被授权参与方的钱包；relayer 可以广播交易、代付 gas，但不生成业务签名。
- Signal 提交受订单级 `SignalSubmitterAuthorized` 与 active executor overlay 约束，签名采用 EIP-712 typed data。
- 同一个 `(planId, orderId, sourceId, signalId)` 只允许一次成功写入（first-writer-wins）；重复提交因 `SignalAlreadyExists` 回滚。技术细节见 [Signal](core/signal.md) 与 [EIP-712 与 Relayer](trust/eip712-relayer.md)。

## Plan 生命周期

Plan 通过 `commitPlan()` 提交并绑定 publisher 签名与 hooks/metadata hash，再经 `finalizePlan()` 一次冻结 metadata；只有 finalized Plan 可以创建 Order。Plan 身份由发布者与提交内容共同确定（`planId = hash(publisher, planHash)`）。部署时冻结的 modules 不能被 owner 替换；升级必须部署新 StateMachine 并经 Deployment Registry 显式 cutover。详见 [Contracts 与 Registries](contracts-and-registries.md)、[Canonical Hash](artifacts/canonical-hashes.md) 与 [Plan 与订单生命周期](lifecycle.md)。

## 订单与证据边界

Order 一旦注册即是一条独立事实流；核心协议不为 Order 定义 running/completed/cancelled 等终态，Product 展示的完成度来自授权 signal 与 proof。合同、发票、物流单据、照片、OCR 原文等业务材料不明文上链——链上只保存 payloadHash、metadata URI、资源 manifest hash、签名与事件。Proof row 应能追溯到 tx、block、log、合约、chain id、事件与 payload context。详见 [File Resources](core/file-resources.md)、[Evidence、Proof 与 File Resource](services/evidence-proof.md)。

## 产品表面与服务边界

Product API 可以准备 typed data、验证签名、调用 relayer 并返回 proof，但授权检查始终由合约执行；Store review 是平台 workflow，不等于 trust publication；Order App 与 executor-kit 不暴露 HookPlan/sourceId/ABI/calldata/gas 细节，也不能绕过订单级 signal 授权。角色名称只负责展示，权利来自链上授权状态。

## 外围适配

funding、USDC、escrow、guarantee、settlement、支付、物流和企业系统 adapter 都属于 periphery 语境（`uvp-periphery/`）：它们围绕核心状态机运行，消费 `UVPStateMachine`、可选的 Identity Registry 名称解析、Product DTO 或 executor-kit 接口，但不得把资金、担保、付款、释放、退款、争议等状态改造成新的核心事实源。

## 公共接口纪律

ABI、event topic、EIP-712 typed data domain、canonical hash domain、artifact schema、Product DTO、deployment manifest、HTTP API 契约与 release evidence 都是公共接口；任何变更必须显式更新 fixture、通过 `pnpm verify:protocol-freeze` 并同步 adapter/indexer/executor/部署脚本。事件名清单见 [合约与事件](../reference/contracts-and-events.md)，接口地图见 [公共接口](../reference/public-interfaces.md)，变更 checklist 见 [日常开发](../how-to/development.md)。

## 运行环境纪律

每个运行时配置都是显式声明；任何 profile 背后都不存在 demo 或 mock 模式。Product API 没有 demo 数据源——空投影返回空数组、缺失明细返回 `detail_unavailable`，不存在 `?fallback=demo` 参数和 `UVP_PRODUCT_DEMO_MODE` 键；前端同样没有 demo 模式，Store 访问级别只来自环境变量与登录会话。`CHAIN_SERVICES_DATABASE_DRIVER` 与 `CHAIN_SERVICES_DATABASE_URL` 全环境必填，缺失即启动失败，报错信息包含键名。

Staging/testnet profile 必须 fail-closed：拒绝 memory/SQLite 存储、localhost RPC、permissive authorization 与 Anvil 默认私钥；所有 bootstrap 入口都要求显式部署私钥（`--private-key` 或 `UVP_ETH_DEPLOYER_PRIVATE_KEY`）。私钥、RPC secret、JWT secret、object storage credential 只写 redacted 口径，不进仓库、日志或文档。

本页同时固定一条「对应」原则：系统承诺对应而非真实——每条记录必须对应某个主体的真实表达。持钥者以私钥作假，是其本意的行使，系统不得另设裁决层代为裁决；相应地，系统绝不代笔内容、不冒充成功、不以静默缺省顶替人的决定。

执行细则见 [Storage、Migration 与 Runtime Profile](services/storage-runtime.md) 与 [排障](../how-to/troubleshooting.md)。
