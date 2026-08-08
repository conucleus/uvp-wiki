# Compiler 与 Hook Core

Compiler 和 Hook Core 是协议语义进入链上前的入口。它们不处理订单运行、数据库、资金或前端 UI，只负责把 DSL 变成确定性语义产物。

## Hook Core

`uvp-protocol/packages/hook-core` 负责：

- 解析 `source::condition`。
- 支持 `&`、`|`、`~`、delay，以及带目标的 `OUTSIDE@(…)`、`OUTSOURCE@(…)` wrapper；裸 `OUTSIDE` / `OUTSOURCE` 已删除。
- Stage 的 `externalSignals` 由 compiler 保留为 backend/executor 直接输入契约，不会编译成 Hook。
- 把 `~A` 解释为“A signal 尚未出现在当前订单事件集中”。signal 一旦出现就不会消失，所以这里是单调存在逻辑。
- 抽取 positive、negative、timer dependencies。
- 提供本地 evaluator，供 compiler 和 reference runtime 共享。

Hook Core 的输出仍然是平台中立语义，不含 Solidity ABI。

## Compiler

`uvp-protocol/packages/compiler` 负责：

- 加载 YAML/JSON Zhixu。
- 校验 stage、trigger、receiveSignals、selectedStages、executor reachability。
- 生成 `OnchainHookPlanArtifact`。
- 生成 Solidity `registerPlan` 参数。
- 计算 `planId`、`planHash`、hook/stage/source/signal/dependency/route id。

## Compiler 的输入输出边界

Compiler 的输出是确定性的计划产物和注册参数。订单参与者、钱包授权、合约部署、supplier identity、escrow 或 funding 由后续的 Product、registry、deployment 或 periphery 层处理。Compiler 只回答一个问题：这份静态 Zhixu 能否被确定性地编译成 EVM 可注册计划。

## 为什么它是架构核心

Compiler 的确定性保证各方得到同一个 plan hash。合约注册 compact hooks，publisher 对 plan hash 签名，Product DTO 显示该 Plan 对应的任务。哈希与 schema 可复现，整条链路才能审计。
