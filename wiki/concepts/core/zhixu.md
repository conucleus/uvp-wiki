---
title: 秩序 (Zhixu) DSL
type: explanation
audience: 协议读者
preread: ../README.md
status: verified
---

# 秩序 (Zhixu) DSL

> 前置阅读：[核心概念](../README.md)
`Zhixu` 是“秩序”的拼音。在本仓库里，秩序 (Zhixu) 是凝结核设计出的可复用协作规则书。它用 DSL 声明一类可复用的生产关系：有哪些任务模式、每个任务有哪些阶段、阶段在哪条 source 因果链上、接收什么 signal、发出什么 signal、是否按事实代铸订单、默认 executor 是谁、哪些阶段能为其他阶段选择 executor、需要哪些资源，以及可选的 dock interface。

代码入口是 `uvp-protocol/packages/compiler/src/types/index.ts` 的 `ZhixuDefinition`。订单 (Order) 是这份规则书编译、注册之后的一次运行实例。

## 谁使用

凝结核和秩序设计者编写 Zhixu DSL；compiler 把它编译成链上产物；Store、publisher 和 registrar 负责审核、发布和用它创建订单。普通参与者通常只通过 Product/Store 投影间接消费它。

## 产生什么结果

一条 Zhixu 编译出确定性的 HookPlanArtifact 和 OnchainHookPlanArtifact，经 `commitPlan` + `finalizePlan` 注册后成为可创建 Order 的 Plan；同一个 Plan 可以运行出多个 Order。

## 权威来自哪里

DSL 文本本身只是设计稿。计划身份由编译产物哈希和链上注册决定，订单运行时事实来自 `UVPStateMachine` 事件；本页字段说明与 compiler 类型定义保持同步。

## 最小骨架

```yaml
apiVersion: uvp/v0
kind: Zhixu
metadata:
  name: cross-border-procurement
  uid: zhixu-cross-border-procurement-v1
  annotations:
    version: "1"
spec:
  platform:
    type: blockchain
    provider: eth
    network: base
    version: 0.1.3 <!-- 示例值，以 compiler 当前版本为准 -->
  nucleation:
    id: procurement-nucleus
  taskPatterns:
    - name: master
      stages:
        - name: intake
          source: customer
          mint: per-fact
          receiveSignals:
            REQUESTED: "::ANCHOR(@customer::request.submit.requested)"
          sendSignals: [str, cmp, err]
          executor:
            supplierType: organization
            supplierID: "{{ .intake_executor_uid }}"
        - name: supplier_sourcing
          source: supply
          receiveSignals:
            SCOPE_READY: customer::master.intake.cmp
          sendSignals: [str, cmp, err]
          executor:
            supplierType: zhixu
            zhixuExecutorConfig:
              schemaVersion: uvp.dock.v1
              target:
                zhixu: supplier-sourcing
                version: "1"
              order:
                idPolicy: derived-v1
              inputMap:
                start: intake
              signalMap:
                str: start
                cmp: complete
                err: failed
```

这段示例说明三件事：`mint: per-fact` 阶段通过 `ANCHOR(@...)` 订阅事实并按事实纯函数代铸一个订单；普通阶段通过 `receiveSignals` 继续推进；委托阶段把另一条 Zhixu 作为执行接口，并以目标端口名配置 `inputMap/signalMap`。linked 秩序的输出经 proof 校验和授权 submitter 映射后推动本地秩序继续运行。`signalMap` 的协议语义与运行时对接详见 [Zhixu 作为 Executor](../apps/zhixu-as-executor.md) 和 [Executor](executor.md)。

## 顶层字段

| 字段 | 解释 |
| --- | --- |
| `apiVersion` | DSL 版本，目前是 `uvp/v0`。 |
| `kind` | 当前 DSL 顶层对象固定为 `Zhixu`。 |
| `metadata.name` | 必填的非空可读名称，也会参与计划身份。 |
| `metadata.uid` | 稳定 Zhixu ID。没有时会回退到名称。 |
| `metadata.labels` | 业务分类、行业、demo 标签。链上权限由 order authorization 和 overlay 决定。 |
| `metadata.annotations.version` | 计划版本。版本变化会进入 `planId`。 |
| `spec.platform` | 目标平台。EVM track 使用 `type=blockchain`、`provider=eth`，可显式写 `network=base`。不写 `network` 时保持当前主网默认路径。 |
| `spec.nucleation.id` | 秩序的发起核、设计者或组织域标识。详见 [Nucleus / 凝结核](nucleation.md)。 |
| `spec.taskPatterns` | 任务模式列表，里面包含 stages。 |

## Stage 字段

| 字段 | 解释 |
| --- | --- |
| `name` | 阶段名称。和 task pattern 名拼成 `stageIdentifier`。 |
| `source` | 该阶段 signal 所属的因果链；用户角色由 Product/authorization 另行解释。 |
| `mint` | 可选的出生策略，目前唯一取值为 `per-fact`；声明后每个订阅事实最多代铸一个订单。 |
| `receiveSignals` | hook key 到 Hook DSL 表达式的映射。 |
| `sendSignals` | 阶段完成后可能发出的 signal 名称。 |
| `executor` | 默认执行者配置，指向 supplier 或另一条 Zhixu。 |
| `selectedStages` | 当前阶段能为哪些目标阶段选择 executor。 |
| `fileResources` | 阶段协议、证据要求、资源清单等链下资源句柄。详见 [File Resources](file-resources.md)。 |

编译器把 `taskPattern.name + "." + stage.name` 变成 `stageIdentifier`。例如 `master.supplier_sourcing` 会被哈希为链上的 `stageId`。

## `receiveSignals` 与 `mint`

`receiveSignals` 定义 Hook 条件。普通表达式在当前订单上下文中求值；跨源订阅使用空标头的 `::ANCHOR(@source::task.stage.signal)`，由事实路由层逐事件投递。阶段是否是出生阶段只由 `mint: per-fact` 声明决定，不再通过 `trigger` 或 `externalSignals` 声明入口：

```yaml
mint: per-fact
receiveSignals:
  REQUESTED: "::ANCHOR(@customer::request.submit.requested)"
```

`mint` 只能取 `per-fact`，出生阶段必须包含至少一个 `ANCHOR(@...)` 订阅，并使用静态的 individual/organization executor；编译器会拒绝自环和无界的跨源代铸环。没有 `mint` 的阶段可以用普通 `source::condition` hook，也可以用 `ANCHOR(@...)` 做通道监听；其订单身份由现有订单路由或执行器自报创建。旧的 `trigger`、`externalSignals`、`::OUTSIDE@`、`::MERGE@` 和旧 `::ANCHOR@(…)` 形态均已退役，编译器会显式拒绝。

## `selectedStages`

`selectedStages` 是某个 stage 对目标 stage 的 executor patch 能力。例如在报关闭环中，买家提交的阶段可以为 `customs.complete` 指定具体执行者。编译器把这个关系变成 selector binding，合约在 executor patch 时检查这个 stage-to-target 绑定。

```yaml
selectedStages:
  - customs.complete
```

只有存在 selector binding 的 stage 才能为对应目标 stage 改 executor。

## `executor`

`executor` 指向默认能力主体：

| `supplierType` | 含义 |
| --- | --- |
| `individual` | 个体执行者。 |
| `organization` | 组织、企业系统、服务商或团队。 |
| `zhixu` | 另一条 Zhixu 作为执行接口对接；目标身份放在 `zhixuExecutorConfig.target`。 |

`supplierID` 只适用于 `individual`/`organization` executor。`supplierType=zhixu` 时禁止 `supplierID`，必须提供 `zhixuExecutorConfig`：它固定 dock schema、目标 Zhixu/version、派生订单策略，以及本地输入到目标入口端口的 `inputMap` 和本地输出到目标端口的 `signalMap`。目标 definition/artifact/interface 身份由发布系统提供的 `uvp.dock.resolution.v1` manifest 解析；不能用显示名称代替 UID。订单里的 active executor 钱包由订单注册授权或 `StageExecutorPatchApplied` 运行时事件决定。

## `fileResources`

`fileResources` 记录阶段协议、证据要求、验收标准或资源句柄。一个阶段可以指向链下 protocol 文件、manifest URI 或对象存储资源，并带上哈希：

```yaml
fileResources:
  sourcing_contract:
    fileType: manifest
    resourceRole: stage_protocol
    resourceType: document
    mediaType: application/json
    manifest:
      manifestURI: "urn:uvp:resource-manifest:supplier-sourcing:v1"
      manifestHash: "0x3002..."
      policyHash: "0x7120..."
      visibility: protected
```

这些业务文件不进链。链上只记录哈希、URI 或 resource patch 事件。

## Zhixu、Plan、Order 的区别

| 概念 | 静态/动态 | 解释 |
| --- | --- | --- |
| Nucleus / 凝结核 | 组织主体 | 发起、设计和维护 Zhixu 的秩序组织者；`nucleation` 是字段和成核上下文。 |
| 秩序 (Zhixu) | 静态 DSL | 可复用协作规则书。 |
| Plan | 链目标产物 | 某个 Zhixu 针对 EVM 编译出的 artifact、hash 和注册参数。 |
| Order | 动态实例 | 某个 Plan 的一次运行，包含 signal、hook runtime、stage overlay 和 proof。 |

一条 Zhixu 可以编译成多个不同平台或版本的 Plan；同一个 Plan 可以产生多个 Order。
