# Compiler 与 Hook Core

Compiler 和 Hook Core 是协议语义进入链上前的入口。它们不处理订单运行、数据库、资金或前端 UI，只负责把 DSL 变成确定性语义产物。

## Hook Core

`uvp-protocol/packages/hook-core` 负责：

- 解析 `source::condition`。
- 支持 `&`、`|`、`~`、delay、`OUTSIDE`、`OUTSOURCE`。
- 抽取 positive、negative、timer dependencies。
- 提供本地 evaluator，供 compiler 和 reference runtime 共享。

Hook Core 的输出仍然是平台中立语义，不含 Solidity ABI。

## Compiler

`uvp-protocol/packages/compiler` 负责：

- 加载 YAML/JSON Zhixu。
- 校验 stage、trigger、receiveSignals、selectedStages、executor reachability。
- 生成 `HookPlanArtifact`。
- 生成 `OnchainHookPlanArtifact`。
- 生成 Solidity `registerPlan` 参数。
- 计算 `planId`、`planHash`、hook/stage/source/signal/dependency/route id。

## 编译器不做什么

Compiler 不选择订单参与者，不创建钱包授权，不部署合约，不判断 supplier 是否可信，也不执行 escrow 或 funding。它只回答一个问题：这份静态 Zhixu 能否被确定性地编译成 EVM 可注册计划。

## 为什么它是架构核心

如果 compiler 不确定，后面所有 trust attestation 都失去意义。Trust domain 背书的是 plan hash；合约注册的是 compact hooks；Product DTO 显示的是 Plan 对应的任务。任何一个哈希或 schema 不可复现，整条链路就不可审计。
