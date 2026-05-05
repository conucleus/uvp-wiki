# 一个订单穿过 UVP 组件

这篇是 [一个订单故事](one-order-story.md) 之后的第二遍阅读。第一遍从业务事实长出 Zhixu、Order、Signal 和 Proof；这一遍不再重新讲业务剧情，而是沿着同一条订单看它穿过哪些组件。

读的时候先不要背模块名。只要记住三段：

- 上链前：Store 把秩序草稿、参与方和发布材料组织起来，compiler 把 Zhixu 编译成可注册 Plan，protocol bindings 固定 ABI、typed data 和 hash。
- 上链中：trust registry 背书 Plan/Supplier，Product BFF 准备订单和权限，`UVPStateMachine` 接受注册、signal、patch 和 docking 事件。
- 上链后：Chain Services 从事件重建订单、任务、timeline、proof 和 trust projection，再翻译成 Product DTO，给 Store、Order App 和 executor-kit 使用。

先抓一条主线：

```text
Zhixu draft
  -> compile preview and deterministic artifacts
  -> plan/supplier attestation
  -> plan and order registration
  -> order-level signal authorization
  -> Product task or HookReady
  -> Order App / executor-kit signs and submits
  -> UVPStateMachine evaluates hooks
  -> Chain Services replays projections
  -> Product / Store / proof views
```

## 三段路径

| 段落 | 发生什么 | 主要入口 |
| --- | --- | --- |
| 设计与定版 | 凝结核在 Store 中组织 Zhixu、supplier、资源和发布材料；compiler 产出 deterministic Plan；公共接口固定后才能被合约、服务和前端共同消费。 | [核心对象总览](../core/README.md)、[从 Zhixu 到可注册 Plan](../components/semantics-and-compiler.md)、[Protocol Bindings 与公共接口](../components/services-and-interfaces.md) |
| 注册与推进 | Plan/Supplier 背书进入 trust registry；Product BFF 把 order draft、invite、participant wallet 和授权变成可提交路径；状态机记录 Order、Signal、HookReady、patch 和 docking proof。 | [Trust Registry 与授权边界](../concepts/trust-and-authorization.md)、[Product BFF 与提交入口](../concepts/architecture/components/chain-services-bff.md)、[UVPStateMachine](../components/onchain-runtime.md) |
| 重建与使用 | Chain Services 只做可重建 projection 和中继；Product DTO 把链上事实翻译成人能读的订单、任务和 proof；Store、Order App、executor-kit 分别面向凝结核、普通参与者和自动化执行者。 | [Chain Services](../components/chain-services.md)、[Product DTO 与用户表面](../product/README.md)、[Zhixu Store](../store/README.md)、[Executor Kit](../execution/README.md) |

下面的表是速查表。遇到一个模块时，先看它回答什么问题，再决定是否进入对应细页。

## 组件速查

| 订单走到哪一步 | 关键问题 | 当前代码入口 | 相关页面 |
| --- | --- | --- | --- |
| 设计秩序 | 这类协作怎么被写成可复用规则书？ | `zhixu-store/app/src/store/`、`uvp-protocol/packages/compiler/src/zhixu-loader.ts` | [核心对象总览](../core/README.md)、[Zhixu Store](../store/README.md) |
| 编译成 Plan | Zhixu 怎么变成可复现、可注册的链上材料？ | `uvp-protocol/packages/hook-core/src/`、`uvp-protocol/packages/compiler/src/` | [从 Zhixu 到可注册 Plan](../components/semantics-and-compiler.md) |
| 固定公共接口 | ABI、EIP-712、typed data 和 call data 谁来统一？ | `uvp-protocol/packages/protocol-bindings/src/` | [Protocol Bindings 与公共接口](../components/services-and-interfaces.md) |
| 背书与注册 | 谁证明 plan/supplier 被信任，谁能注册 plan/order？ | `ZhixuTrustRegistry.sol`、`UVPStateMachine.sol`、`UVPDeploymentRegistry.sol` | [Trust Registry 与授权边界](../concepts/trust-and-authorization.md) |
| 创建订单和权限 | 一次具体 Order 如何绑定参与者和 signal submitter？ | `uvp-chain-services/service/src/product/bff/`、`uvp-chain-services/service/src/submissions/` | [Product BFF 与提交入口](../concepts/architecture/components/chain-services-bff.md) |
| 提交业务信号 | 人、企业脚本或 agent 怎么把证据指纹签名提交？ | `uvp-order-app/app/src/`、`uvp-executor-kit/package/src/` | [Product BFF 与提交入口](../concepts/architecture/components/chain-services-bff.md)、[Order App](../execution/order-app.md)、[Executor Kit](../execution/README.md) |
| 链上求值 | 信号如何触发状态变化、HookReady、timer 或 overlay？ | `uvp-protocol/contracts/uvp-contracts/src/`、`uvp-protocol/packages/statemachine/src/` | [UVPStateMachine](../components/onchain-runtime.md) |
| 运行时变更 | 某个订单怎样选择/替换 executor，或替换 resource manifest？ | `UVPStagePatchModule.sol`、`uvp-chain-services/service/src/stage-patches/` | [UVPStateMachine](../components/onchain-runtime.md)、[Stage Overlay：Executor Patch 与 Resource Patch](../concepts/state-machine/stage-overlay.md) |
| 对接子秩序 | 一条 Zhixu 怎样作为另一条订单的 executor？ | `UVPDockingModule.sol`、`uvp-protocol/packages/protocol-bindings/src/`、`zhixu-store/app/src/store/StoreDockingPage.tsx` | [Docked Zhixu Runtime](../concepts/state-machine/docking.md)、[Executor Kit](../execution/README.md) |
| 看链上状态 | 如何从事件重建订单、任务、timeline、proof 和 trust？ | `uvp-chain-services/service/src/indexer/`、`uvp-chain-services/service/src/storage/`、`uvp-chain-services/service/src/product/` | [Chain Services](../components/chain-services.md) |
| 翻译成产品语言 | 普通用户看到的订单、任务、证明是什么 DTO？ | `uvp-protocol/packages/product-dto/src/`、`uvp-chain-services/service/src/api/routes/product-read.ts` | [Product DTO 与用户表面](../product/README.md) |
| Store 管理和通知 | 凝结核、operator、supplier、通知和 audit 怎么组织？ | `uvp-chain-services/service/src/store-console/`、`uvp-chain-services/service/src/store-suppliers/`、`uvp-chain-services/service/src/governance/`、`uvp-chain-services/service/src/notifications/` | [Zhixu Store](../store/README.md)、[Chain Services](../components/chain-services.md) |

## 不要混淆

- Store draft、review、audit、contact 和 notification 是 workflow 或 projection，不是链上事实。
- Chain Services 可以准备 typed data、验证签名、广播交易、投影 proof，但不能替参与者生成业务签名。
- Product DTO 是普通用户语言；合约、事件、EIP-712、ABI、canonical hash 仍是 public interface。
- Order App 和 executor-kit 是两个 signal producer 表面：一个面向人，一个面向脚本、企业系统和 supervised agent。

## 接着读

读完这篇后，进入 [核心对象总览](../core/README.md)。如果你已经清楚对象关系，可以按当前问题跳到 [从 Zhixu 到可注册 Plan](../components/semantics-and-compiler.md)、[Product BFF 与提交入口](../concepts/architecture/components/chain-services-bff.md)、[UVPStateMachine](../components/onchain-runtime.md)、[Chain Services](../components/chain-services.md)、[Zhixu Store](../store/README.md) 或 [Executor Kit](../execution/README.md)。
