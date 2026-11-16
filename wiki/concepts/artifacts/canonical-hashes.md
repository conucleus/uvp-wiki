---
title: Canonical Hash
type: reference
audience: 工程贡献者
status: verified
---

# Canonical Hash

`uvp-eth` 使用带 domain 的 canonical hash。这样同样的 JSON 内容在不同用途下不会撞到同一个语义空间。分域哈希函数是 `keccak256(domain + ":" + canonicalJSON(payload))` 或对 ABI 编码后的 tuple 做 `keccak256(abi.encode(...))`，实现见 `uvp-protocol/packages/compiler/src/onchain/` 与 `uvp-core/crates/uvp-ir`。

## 定义身份（uid）

定义身份是内容派生 uid：

```text
uid = zx-<32hex>
preimage = keccak256("uvp:definition-uid:v2:" + canonical(定义文档剔除 metadata.name / metadata.annotations))
```

`metadata.labels` 是定义内容，参与派生；`metadata.name` 与 `metadata.annotations` 只作展示、不参与。同一份内容跨环境、跨轨得到同一 uid；重复发布是幂等 no-op，内容一变即新身份。权威实现是 `uvp_ir::derive_definition_uid`，链轨 TS 编译器同公式并用 `uvp-core/fixtures/commitments/golden-vectors.v1.json` 跨语言互钉。

## PlanId

`planId` 把某个 publisher 与某份链上产物绑定为一个计划版本：

```text
planId = keccak256(abi.encode(
  keccak256("uvp.plan.id.v1"), // domain
  publisher,                   // address
  planHash                     // 链上 runtime planHash（见下节）
))
```

实现见 `UVPStateMachine.sol` 的 `planIdFor()` 与链轨编译器；改变 publisher 或 planHash 都会改变 `planId`。

## 链上 runtime planHash

链上 runtime `planHash` 覆盖 hooks、三张能力表的树根与 supplier 绑定树根：

```text
planHash = keccak256(abi.encode(
  keccak256("uvp.plan.runtime.v7"),   // domain
  hooksHash,                          // keccak256(abi.encode(CompactHook[]))
  capabilitiesRoot,                   // 三张能力表的单棵 Merkle root
  supplierBindingsRoot                // (stageId, supplierId, kind) default/candidate 绑定的单棵 Merkle root
))
```

publisher 对六字段 PlanCommit（publisher、hooksHash、capabilitiesRoot、supplierBindingsRoot、birthAuthorizer、deadline）做 EIP-712 签名，`UVPStateMachine` 在 commit/finalize 时检查这个 runtime `planHash`；`birthAuthorizer` 不进 preimage，Identity Registry 不参与。`hooksHash` 覆盖 compact hook 的 `(hookId, stageId, hookName, flags, instructions, dependencyKeys)`；executor routeId/routeHash 是链下路由元数据，不进 `hooksHash` 也不进 runtime `planHash`。

## Artifact 身份

- 编译器内部 hook plan artifact（`uvp.hookPlan.v8`）的 `planHash` 用域 `uvp:hook-plan-artifact:v1`，payload 含定义快照、platform、compiled hooks、依赖索引、executor routes 等。
- 公开 on-chain artifact（`uvp.onchainHookPlan.v8`）的 `planHash` 用域 `uvp:onchain-hook-plan-artifact:v1`，preimage 是 artifact payload 去掉派生读面 `triggers[]`。它作为注册参数里的 `artifactHash` 追溯源产物，不替代链上 runtime `planHash`；artifact 的 `sourcePlanHash` 锚定内部 hook plan。
- 两边都不手写 JSON：产物必须由脚本从定义可重复生成。

## capabilitiesRoot（三张能力表）

signal capability、selector binding 与 file writer 三张表不逐条上链注册。编译器在链下把它们混编进同一棵域分隔排序配对 Merkle 树（排序去重、奇数尾叶提升、`keccak256(min ‖ max)` 逐层），链上只存 root；成员资格由使用方按「用字段重算叶 + 携 proof」验证。叶公式：

```text
signalCapabilityLeaf = keccak256(abi.encode(
  keccak256("UVP_SIGNAL_CAPABILITY_V1"),  // 叶域
  stageId, targetSourceId, signalId, relation))

selectorBindingLeaf = keccak256(abi.encode(
  keccak256("UVP_SELECTOR_BINDING_V1"),   // 叶域
  selectorStageId, targetStageId))

fileWriterLeaf = keccak256(abi.encode(
  keccak256("UVP_FILE_WRITER_V1"),        // 叶域
  targetStageId, writerStageId))

supplierBindingLeaf = keccak256(abi.encodePacked(
  keccak256("UVP_SUPPLIER_BINDING_V1"),   // 叶域
  stageId, supplierId, kind))
```

前三种叶混入 `capabilitiesRoot`，`supplierBindingLeaf` 组成独立的 `supplierBindingsRoot`（随 PlanCommit 签名承诺）。空表时 root 为 `keccak256("")`。叶子公式与合约 `UVPPlanMetadataModule` 的 `signalCapabilityLeaf`/`selectorBindingLeaf`/`fileWriterLeaf` 以及编译器 `supplierBindingLeaf` 逐字节一致；权威实现是 `uvp-protocol/packages/compiler/src/onchain/capabilities-root.ts` 与 `supplier-bindings.ts`。

## Dock 身份、binding 与文件 patch

Dock 是独立 `kind: Dock` 文档，身份内容派生：

```text
docHash = keccak256("uvp:dock-uid:v1:" + canonical(Dock 文档剔除 metadata.name / metadata.annotations))
dkid     = zd-<32hex>          // 展示形态
链上 dkid word = bytes32(bytes16(docHash))   // 注册调用使用的 bytes32
```

内容一变即新 dkid，重复发布幂等。构件与字段校验见 `uvp-protocol/packages/compiler/src/dock-artifact.ts`（`uvp.dock.v1`）。

binding 的身份维度是 7 个 32-byte word，不含 payload hash/generation：

```text
bindingId = keccak256(abi.encode(
  keccak256("uvp.dock.binding_id.v1"),  // domain
  dkid, toPlanId, toOrderId, toStageId, fromPlanId, fromOrderId))
```

`dock_link` 文件项的 `contentHash` 只在 poke 时认证载荷正文，不匹配即 `DockBindingContentHashMismatch`；它不进 bindingId、事件、view 或事实 provenance。窗口当前值由读面 live 求值，历史窗口时间不上链。

阶段文件 patch 的 canonical digest：

```text
filesDigest = keccak256(abi.encode(
  keccak256("UVP_FILE_PATCH_V1"),
  planId, orderId, targetStageId, baseHash, writerStageId, ops))
```

`writerProof` 是证明见证、不参与 digest。阶段 executor patch 的 payload hash 用域 `uvp:stage-executor-patch-payload:v1`，覆盖 selector/target stage、executor、role、metadata hash、mode、previousExecutor、approval source/signal、nonce 与 metadata URI，不含文件字段。

## 稳定 ID

EVM 产物常见稳定 ID：

```text
hookId = keccak256(stageIdentifier#hookName)
stageId = keccak256(stageIdentifier)
hookName = keccak256(hookName)
sourceId = keccak256(source)
signalId = keccak256(signalName)
signalKey = keccak256(abi.encode(sourceId, signalId))
routeId = keccak256(stageIdentifier#executorRoute)
selectorBindingHash = hashCanonical("uvp:onchain-stage-selector-binding:v1", ...)
```

对于 `bytes32,bytes32`，编译器字节拼接与 Solidity `abi.encode(sourceId, signalId)` 在字节内容上保持一致。

## routeHash 与 fileResources 缺省

executor route 是链下路由元数据，route 的哈希公式里 `fileResources` 是可选输入。当 route/plan **未声明** `fileResources` 时，协议规定以 ZERO_HASH（32 字节全零 `0x0000…0000`）作为 `resourcesHash` 参与计算：

```text
resourcesHash = fileResources 未声明 ? ZERO_HASH : keccak256(canonicalJSON(fileResources))

routeHash = hashCanonical("uvp:onchain-hook-route:v1", {
  stageId, stageIdentifier, executorHash, resourcesHash
})
```

`routeId`/`routeHash` 只作为 artifact 内的路由身份与读面调度使用，不进入链上 runtime `planHash`。这是协议常量定义，不是实现细节的默认值：任何语言的重实现都必须使用同一个 ZERO_HASH 常量表示「未声明」，不得改用空串哈希、省略字段或其它占位方式，否则同一份定义会算出不同的 routeHash 与 artifact 身份，破坏跨实现的可复现性。

## Canonical JSON 规则

Canonical hash 会对对象 key 排序、拒绝浮点数字面量、把 domain 与 canonical JSON 一起哈希。开发时不要手写临时 JSON 来替代编译脚本，否则很容易得到不可复现的 hash。
