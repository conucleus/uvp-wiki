---
title: Canonical Hash
type: reference
audience: 工程贡献者
status: verified
---

# Canonical Hash

`uvp-eth` 使用带 domain 的 canonical hash。这样同样的 JSON 内容在不同用途下不会撞到同一个语义空间。

## PlanId

`planId` 把某个 publisher 与某份链上产物绑定为一个计划版本：

```text
planId = keccak256(abi.encode(
  keccak256("uvp.plan.id.v1"), // domain
  publisher,                   // address
  planHash                     // 来自 OnchainHookPlanArtifact 的 EVM-facing planHash
))
```

实现见 `uvp-protocol/packages/compiler/src/onchain-hook-plan.ts` 的 `planIdForPublisher()` 和 `UVPStateMachine.sol` 的 `planIdFor()`。改变 publisher 或 planHash 都会改变 `planId`；同一个 publisher 对同一份产物的 `planId` 是确定的。

## HookPlan planHash

```text
hashCanonical("uvp:hook-plan-artifact:v1", payload)
```

这是历史对外产物的 domain。现 HookPlan 仅作编译器内部 IR，不再是 Store/import/deploy 的公开流程，见 [编译输入](compiler-input.md)。payload 曾包含 canonicalized source Zhixu、编译器信息、平台信息、hook、依赖和 route。

## 链上 planHash

链上产物使用独立 domain：

```text
uvp:onchain-hook-plan-artifact:v1
```

这个哈希覆盖 compact hooks 与 metadata 承诺。publisher 对提交内容签名，`UVPStateMachine` 在 commit/finalize 时检查这个 EVM-facing `planHash`；Identity Registry 不参与。

## 稳定 ID

EVM 产物常见稳定 ID：

```text
hookId = keccak256(stageIdentifier#hookName)
stageId = keccak256(stageIdentifier)
hookName = keccak256(hookName)
sourceId = keccak256(source)
signalId = keccak256(task.stage.signal)
signalKey = keccak256(abi.encode(sourceId, signalId))
routeId = keccak256(stageIdentifier#executorRoute)
selectorBindingHash = hashCanonical("uvp:onchain-stage-selector-binding:v1", ...)
```

对于 `bytes32,bytes32`，编译器字节拼接与 Solidity `abi.encode(sourceId, signalId)` 在字节内容上保持一致。

## fileResources 缺省与 ZERO_HASH

route 与 plan 的哈希公式里，`fileResources` 是可选输入。当 plan/route **未声明** `fileResources` 时，协议规定以 ZERO_HASH（32 字节全零 `0x0000…0000`）作为 `resourcesHash` 参与计算：

```text
resourcesHash = fileResources 未声明 ? ZERO_HASH : keccak256(canonicalJSON(fileResources))

routeHash = hashCanonical("uvp:onchain-hook-route:v1", {
  stageId, stageIdentifier, executorHash, resourcesHash
})
```

`routeHash` 再进入链上 `planHash`（`uvp:onchain-hook-plan-artifact:v1`）的承诺范围。这是协议常量定义，不是实现细节的默认值：任何语言的重实现（TypeScript 见 `compileExecutorRoute()` / `onchainRouteHash()`，Rust 及其它编译器后端）都必须使用同一个 ZERO_HASH 常量表示「未声明」，不得改用空串哈希、省略字段或其它占位方式，否则同一份定义会算出不同的 routeHash/planHash，破坏跨实现的可复现性。

## Canonical JSON 规则

Canonical hash 会对对象 key 排序，规范化数值，并把 domain 与 canonical JSON 一起哈希。开发时不要手写临时 JSON 来替代编译脚本，否则很容易得到不可复现的 hash。
