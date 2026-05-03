# Wiki Summary

## 入门

- [Wiki 入口](README.md)
- [项目状态](status/README.md)
- [一个订单故事](getting-started/one-order-story.md)
- [核心术语表](reference/glossary.md)
- [读者入口](getting-started/README.md)
- [快速开始](getting-started/quick-start.md)

## 核心概念

- [核心概念入口](core/README.md)
- [核心对象总览](concepts/overview.md)
  - [秩序 (Zhixu) DSL](concepts/core/zhixu.md)
  - [Nucleation / 凝结核](concepts/core/nucleation.md)
  - [Supplier](concepts/core/supplier.md)
  - [Executor](concepts/core/executor.md)
  - [Source 因果链](concepts/core/source.md)
  - [Signal](concepts/core/signal.md)
  - [Hook](concepts/core/hook.md)
  - [Trigger](concepts/core/trigger.md)
  - [File Resources](concepts/core/file-resources.md)
  - [Plan](concepts/core/plan.md)
  - [订单 (Order)](concepts/core/order.md)
- [信任与授权](concepts/trust-and-authorization.md)
  - [Trust Domain](concepts/trust/domains.md)
  - [Signal 授权](concepts/trust/signal-authorization.md)
  - [EIP-712 与 Relayer](concepts/trust/eip712-relayer.md)
  - [Stage Patch 授权](concepts/trust/stage-patch.md)

## 核心组件

- [核心组件入口](components/README.md)
- [组件链路与模块边界](components/architecture.md)
- [语义、Hook Core 与 Compiler](components/semantics-and-compiler.md)
  - [Hook Core 与 Compiler](concepts/architecture/components/compiler-hook-core.md)
  - [产物与哈希](concepts/artifacts-and-hashes.md)
  - [编译输入](concepts/artifacts/compiler-input.md)
  - [Canonical Hash](concepts/artifacts/canonical-hashes.md)
  - [链上注册参数](concepts/artifacts/solidity-registration.md)
- [链上执行、State Machine 与 Replay](components/onchain-runtime.md)
  - [Contracts 与 Registries](concepts/architecture/components/contracts-registries.md)
  - [State Machine](concepts/state-machine.md)
  - [Hook 求值](concepts/state-machine/evaluation.md)
  - [计时器与状态](concepts/state-machine/timers-and-status.md)
  - [Stage Overlay](concepts/state-machine/stage-overlay.md)
  - [事件 Replay](concepts/state-machine/replay.md)
- [非可信执行层：Chain Services](components/chain-services.md)
  - [Indexer 与投影](components/chain-services-indexer-projections.md)
  - [Relayer](components/chain-services-relayer.md)
  - [Submissions 与 Stage Patch](components/chain-services-submissions-stage-patch.md)
  - [Evidence、Proof 与 File Resource](components/chain-services-evidence-proof.md)
  - [Product API](components/chain-services-product-api.md)
  - [Product BFF](concepts/architecture/components/chain-services-bff.md)
  - [Store Console、Supplier 与 Governance API](components/chain-services-store-api.md)
  - [Notifications 与 Reconcile](components/chain-services-notifications-reconcile.md)
  - [Storage、Migration 与 Runtime Profile](components/chain-services-storage-runtime.md)
  - [API Routes](components/chain-services-api-routes.md)
- [服务与接口](components/services-and-interfaces.md)
- [部署与证据](components/deploy-release.md)
- [模块地图](reference/module-map.md)

## 秩序商店

- [秩序商店入口](store/README.md)
- [Store 权威边界与信息架构](store/authority-and-ia.md)
- [凝结核工作台](store/nucleation-workbench.md)
- [Zhixu Catalog、配置与发布](store/zhixu-management.md)
- [Supplier Registry、能力与联系](store/supplier-registry.md)
- [履约状态、Proof 与 Trust 校验](store/runtime-proof.md)
- [联系与通知](store/contact-notifications.md)
- [Operator 权限、治理与 Audit](store/governance-audit.md)
- [Docking Sandbox](store/docking-sandbox.md)

## 执行者与集成

- [执行者与集成入口](execution/README.md)
- [Executor Kit](execution/executor-kit.md)
- [Zhixu 作为 Executor 接入另一个秩序](execution/zhixu-as-executor.md)
- [Order App 与 Executor Kit](concepts/architecture/components/order-app-executor-kit.md)
- [Periphery 与 Adapter](concepts/architecture/components/periphery-deploy.md)

## 产品与执行面

- [产品与执行面](product/README.md)
- [产品表面](concepts/product-surfaces.md)
  - [事件投影](concepts/product/projections.md)
  - [Product DTO](concepts/product/dto.md)
  - [Signal Container](concepts/product/signal-container.md)
  - [Store 与 Order App](concepts/product/apps.md)

## 本地 / 预发 / 发布

- [日常开发](tasks/development.md)
- [运行服务和前端](tasks/run-services-and-apps.md)
- [Local Anvil 协议闭环](tutorials/local-anvil.md)
- [Product 本地闭环](tutorials/product-local-loop.md)
- [Base Sepolia 预发](tasks/base-sepolia-staging.md)
- [发布与验证](operations/release-and-verification.md)
- [排障](operations/troubleshooting.md)

## 参考与证据

- [公共接口](reference/public-interfaces.md)
- [合约与事件](reference/contracts-and-events.md)
- [Product API](reference/product-api.md)
- [CLI 与配置](reference/cli-and-config.md)
- [阅读门槛审计](status/readability-audit-2026-05-03.md)

## 贡献

- [文档规则](contribute/documentation-rules.md)
