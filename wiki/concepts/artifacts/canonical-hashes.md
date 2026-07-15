# Canonical Hash

`uvp-eth` 使用带 domain 的 canonical hash。这样同样的 JSON 内容在不同用途下不会撞到同一个语义空间。

## PlanId

`planId` 标识一个编译计划版本：

```text
hashCanonical("uvp:hook-plan-id:v1", {
  compiler,
  platform,
  version,
  zhixuId,
  zhixuName
})
```

改变平台、版本或 Zhixu 标识都会改变 `planId`。

## HookPlan planHash

可读 HookPlan 的 artifact hash 使用：

```text
hashCanonical("uvp:hook-plan-artifact:v1", payload)
```

payload 包含 canonicalized source Zhixu、编译器信息、平台信息、hook、依赖和 route。

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

## Canonical JSON 规则

Canonical hash 会对对象 key 排序，规范化数值，并把 domain 与 canonical JSON 一起哈希。开发时不要手写临时 JSON 来替代编译脚本，否则很容易得到不可复现的 hash。
