# Wiki Summary

## 学习路径

- [Wiki 入口](README.md)
- [为什么需要 UVP](tutorials/why-uvp.md)
- [学习路径导览](tutorials/README.md)
- [一个订单故事](tutorials/one-order-story.md)
- [Local Anvil 与 Product 本地闭环](tutorials/local-anvil-loop.md)

## 核心概念

- [核心概念入口](concepts/README.md)
- [协议边界（不变量总纲）](concepts/protocol-boundaries.md)
  - [秩序商店（Store）核心概念](concepts/core/store.md)
  - [秩序 (Zhixu) DSL](concepts/core/zhixu.md)
  - [订单 (Order)](concepts/core/order.md)
  - [Signal](concepts/core/signal.md)
  - [Plan](concepts/core/plan.md)
  - [Hook](concepts/core/hook.md)
  - [Trigger](concepts/core/trigger.md)
  - [Source 因果链](concepts/core/source.md)
    - [Source 建模例子集](concepts/core/modeling-examples.md)
  - [Executor](concepts/core/executor.md)
  - [Supplier](concepts/core/supplier.md)
  - [Nucleus / 凝结核](concepts/core/nucleation.md)
  - [File Resources](concepts/core/file-resources.md)

## 架构与运行时

- [架构总览](concepts/architecture.md)
- [数据流与事实源](concepts/data-flow-and-truth.md)
- [Plan 与订单生命周期](concepts/lifecycle.md)
- [Compiler 与 Hook Core](concepts/compiler-and-hooks.md)
- [Contracts 与 Registries](concepts/contracts-and-registries.md)
- [Product BFF 与提交入口](concepts/product-bff.md)
- [Periphery 与部署](concepts/periphery-and-deploy.md)
- [UVPStateMachine 与状态机](concepts/state-machine/README.md)
  - [Hook 求值](concepts/state-machine/evaluation.md)
  - [计时器与状态](concepts/state-machine/timers-and-status.md)
  - [Stage Overlay：Executor Patch 与 Resource Patch](concepts/state-machine/stage-overlay.md)
    - [Executor Patch](concepts/state-machine/executor-patch.md)
    - [Resource Patch](concepts/state-machine/resource-patch.md)
  - [Docked Zhixu Runtime](concepts/state-machine/docking.md)
  - [事件 Replay](concepts/state-machine/replay.md)
- [身份、发布与授权边界](concepts/trust/README.md)
  - [Store or external institution](concepts/trust/domains.md)
  - [Signal 授权](concepts/trust/signal-authorization.md)
  - [EIP-712 与 Relayer](concepts/trust/eip712-relayer.md)
  - [Stage Patch 授权](concepts/trust/stage-patch.md)
- [产物与哈希](concepts/artifacts-and-hashes.md)
  - [编译输入](concepts/artifacts/compiler-input.md)
  - [Canonical Hash](concepts/artifacts/canonical-hashes.md)
  - [链上注册参数](concepts/artifacts/solidity-registration.md)
- [Chain Services](concepts/services/chain-services.md)
  - [Indexer 与投影](concepts/services/indexer-projections.md)
  - [Submissions 与 Stage Patch](concepts/services/submissions-stage-patch.md)
  - [Storage、Migration 与 Runtime Profile](concepts/services/storage-runtime.md)
  - [Product API](concepts/services/product-api.md)
  - [Relayer](concepts/services/relayer.md)
  - [Evidence、Proof 与 File Resource](concepts/services/evidence-proof.md)
  - [Store Console、Supplier 与 Governance API](concepts/services/store-api.md)
  - [Notifications 与 Reconcile](concepts/services/notifications-reconcile.md)
  - [API Routes](concepts/services/api-routes.md)

## 产品表面

- [Product DTO 与用户表面](concepts/product/README.md)
  - [Product DTO](concepts/product/dto.md)
  - [Signal Container](concepts/product/signal-container.md)
  - [事件投影](concepts/product/projections.md)
  - [Store 与 Order App](concepts/product/apps.md)
- [秩序商店（Store 工作台）](concepts/store/README.md)
  - [Zhixu Catalog、配置与发布](concepts/store/zhixu-management.md)
  - [Supplier Directory、能力与联系](concepts/store/supplier-directory.md)
  - [履约状态、Proof 与 Trust 校验](concepts/store/runtime-proof.md)
  - [联系与通知](concepts/store/contact-notifications.md)
  - [Operator 权限、治理与 Audit](concepts/store/governance-audit.md)
  - [Docking Sandbox 与 signalMap](concepts/store/docking-sandbox.md)
- [Order App](concepts/apps/order-app.md)
- [Executor Kit](concepts/apps/executor-kit.md)
- [Order App 与 Executor Kit](concepts/apps/order-app-vs-executor-kit.md)
- [Zhixu 作为 Executor](concepts/apps/zhixu-as-executor.md)

## 操作指南

- [快速开始](how-to/quick-start.md)
- [日常开发](how-to/development.md)
- [运行服务和前端](how-to/run-services-and-apps.md)
- [Base Sepolia 预发](how-to/base-sepolia-staging.md)
- [发布与验证](how-to/release-checklist.md)
- [排障](how-to/troubleshooting.md)

## 参考

- [版本与语义矩阵](reference/version-matrix.md)
- [公共接口](reference/public-interfaces.md)
- [合约与事件](reference/contracts-and-events.md)
- [Product API 端点速查](reference/product-api-endpoints.md)
- [CLI 与配置](reference/cli-and-config.md)
- [模块地图](reference/module-map.md)
- [核心术语表](reference/glossary.md)

## 项目元信息

- [项目状态](meta/status.md)
- [部署与证据](meta/deploy-release.md)
- [文档规则](meta/documentation-rules.md)
- [后记：第零个理解者](meta/epilogue.md)
