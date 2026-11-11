---
title: 秩序 (Zhixu) DSL
type: explanation
audience: 协议读者
preread: ../README.md
status: verified
---

# 秩序 (Zhixu) DSL

> 前置阅读：[核心概念](../README.md)
`Zhixu` 是“秩序”的拼音。在本仓库里，秩序 (Zhixu) 是凝结核设计出的可复用协作规则书。它用 DSL 声明一类可复用的生产关系：有哪些阶段、每个阶段在哪条 source 因果链上、接收什么 signal、发出什么 signal、是否承担出生入口（trigger）、默认 executor 是谁、哪些阶段能为其他阶段选择 executor、需要哪些资源，以及可选的 dock interface。

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
spec:
  platform:
    type: blockchain
    provider: eth
    network: base
    version: 0.1.3 <!-- 示例值，以 compiler 当前版本为准 -->
  nucleation:
    id: procurement-nucleus
  stages:
    - name: intake
      source: customer
      trigger: [requested]
      sendSignals: [{name: requested}, {name: str}, {name: cmp}, {name: err}]
      executor:
        supplierType: organization
        supplierID: "{{ .intake_executor_uid }}"
    - name: supplier_sourcing
      source: supply
      receiveSignals:
        SCOPE_READY: customer::intake.cmp
      sendSignals: [{name: str}, {name: cmp}, {name: err}]
      executor:
        supplierType: zhixu
        zhixuExecutorConfig:
          target:
            zhixu: supplier-sourcing
          interface: sourcing_service
          order:
            mode: new
          inputMap:
            SCOPE_READY: intake   # key 必须是本 stage 声明的 receiveSignals 通道（D005），value 是目标接口 input 端口名
          signalMap:
            str: start
            cmp: complete
            err: failed
```

这段示例说明三件事：`trigger` 阶段把 `requested` 声明为出生信号，空 `orderId` 提交命中后建单并写首事实；普通阶段通过 `receiveSignals` 继续推进；委托阶段把另一条 Zhixu 作为执行接口，并以目标端口名配置 `inputMap/signalMap`。linked 秩序的输出经 proof 校验和授权 submitter 映射后推动本地秩序继续运行。`signalMap` 的协议语义与运行时对接详见 [Zhixu 作为 Executor](../apps/zhixu-as-executor.md) 和 [Executor](executor.md)。

## 顶层字段

| 字段 | 解释 |
| --- | --- |
| `apiVersion` | DSL 版本，目前是 `uvp/v0`。 |
| `kind` | 当前 DSL 顶层对象固定为 `Zhixu`。 |
| `metadata.name` | 必填 slug（`^[a-z][a-z0-9_-]{0,99}$`）；DSL 内引用目标定义的键（`target.zhixu` 即目标的 `metadata.name`）。名字到实体的解析由各轨权威完成：云轨按唯一 name 注册查得，链轨由发布面解析到内容派生身份。 |
| `metadata.uid` | 不是 DSL 字段：出现即按未知字段响亮拒绝。DSL 壳不携带任何派生身份；身份方案按轨分治（链轨内容派生、云轨数据库权威）。 |
| `metadata.labels` | 业务分类、行业、demo 标签；是定义内容的一部分（链轨身份派生包含 labels——链轨内幕；云轨仅作内容）。链上权限由 order authorization 和 overlay 决定。 |
| `metadata.annotations` | 自由注解，永不参与身份或哈希推导（Zhixu 无原生版本语义，`version` 键无特殊待遇）。 |
| `spec.platform` | 目标平台。EVM track 使用 `type=blockchain`、`provider=eth`，可显式写 `network=base`。不写 `network` 时保持当前主网默认路径。 |
| `spec.nucleation.id` | 秩序的发起核、设计者或组织域标识。详见 [Nucleus / 凝结核](nucleation.md)。 |
| `spec.stages` | 阶段列表；stage 名在秩序内全局唯一。 |

## Stage 字段

| 字段 | 解释 |
| --- | --- |
| `name` | 阶段名称，即 `stageIdentifier` 本身，在秩序内全局唯一。 |
| `source` | 该阶段 signal 所属的因果链；用户角色由 Product/authorization 另行解释。 |
| `trigger` | 可选的出生信号集，必须是本 stage `sendSignals` 的子集；空/省略=不能建单，每个条目合成一条 order-trigger hook。 |
| `receiveSignals` | hook key 到 Hook DSL 表达式的映射。 |
| `sendSignals` | 阶段完成后可能发出的 signal，条目是对象 `{name, validWhen?}`——`validWhen` 是发射适格声明（表达式列表，见 [Signal](signal.md)）。 |
| `executor` | 默认执行者配置，指向 supplier 或另一条 Zhixu。 |
| `selectedStages` | 当前阶段能为哪些目标阶段选择 executor。 |
| `fileResources` | 阶段协议、证据要求、资源清单等链下资源句柄。详见 [File Resources](file-resources.md)。 |

编译器把 stage 的 `name` 直接作为 `stageIdentifier`。例如 `supplier_sourcing` 会被哈希为链上的 `stageId`。

## `receiveSignals` 与 `trigger`

`receiveSignals` 定义同单 Hook 条件，表达式在当前订单上下文中求值。出生入口由 stage 的 `trigger` 显式声明：

```yaml
trigger: [requested]
sendSignals: [{name: requested}, {name: str}]
```

- `trigger` 可省略或为空（不能建单）；非空时必须是本 stage `sendSignals` 的子集、条目不重复，每个条目合成一条 order-trigger hook。一个 stage 可有多个 trigger 信号，一个 plan 可有多个 trigger stage，且 trigger stage 不必是首个 stage。
- 空 `orderId` 提交触发 trigger 判定：signal 不在本 stage `trigger` 集合内即拒绝；命中时先在空订单上下文求值该信号的 `validWhen`，不通过拒绝 `SignalAdmissionRejected`，通过后按出生事实派生 oid、建单并写首事实；同一出生事实重试幂等。
- 带 `orderId` 时 trigger 信号就是普通订单内信号，trigger 身份无关。
- trigger stage 必须使用静态的非 `zhixu` executor（`supplierID` 必填），不能作为 executor patch 目标；编译器拒绝不满足该约束的 trigger stage。
- 同秩序普通事实连接使用 `receiveSignals` 的 `source::condition`；跨秩序连接使用 `spec.dockInterface` 与 `executor.zhixuExecutorConfig`，不存在 Hook DSL 形式的跨秩序订阅。

## `selectedStages`

`selectedStages` 是某个 stage 对目标 stage 的 executor patch 能力。例如在报关闭环中，买家提交的阶段可以为 `complete` 指定具体执行者。编译器把这个关系变成 selector binding，合约在 executor patch 时检查这个 stage-to-target 绑定。

```yaml
selectedStages:
  - complete
```

只有存在 selector binding 的 stage 才能为对应目标 stage 改 executor。

## `executor`

`executor` 指向默认能力主体：

| `supplierType` | 含义 |
| --- | --- |
| `individual` | 个体执行者。 |
| `organization` | 组织、企业系统、服务商或团队。 |
| `zhixu` | 另一条 Zhixu 作为执行接口对接；目标引用放在 `zhixuExecutorConfig.target`。 |

`supplierID` 只适用于 `individual`/`organization` executor。`supplierType=zhixu` 时禁止 `supplierID`，必须提供 `zhixuExecutorConfig`：它声明目标定义引用（`target.zhixu`，即目标定义的 `metadata.name`，或 `null` 留给运行时选择）、目标接口名（`interface`）、订单方式（`order.mode` ∈ {new, existing}），以及本地通道/信号到目标接口端口的 `inputMap`/`signalMap`（至少一张非空；`mode=new` 恰好一条 input 绑定）。名字到目标 definition/artifact/interface 实体的解析由各轨权威完成：core linker 按 `uvp.dock.resolution.v2` manifest 的 name 目录查找，链轨发布面在该 manifest 上内嵌定义全文、由 TS 编译器重算内容派生身份做内容寻址（链轨内幕），云轨按唯一 name 查库。订单里的 active executor 钱包由订单注册授权或 `StageExecutorPatchApplied` 运行时事件决定。

## `fileResources`

`fileResources` 记录阶段协议、证据要求、验收标准或资源句柄。一个阶段可以指向链下 protocol 文件或对象存储资源，`fileType` 取值是闭集 `local` / `http` / `txcloud` / `plain_text`（详见 [File Resources](file-resources.md)）：

```yaml
fileResources:
  sourcing_contract:
    fileType: http
    httpFile:
      url: "https://example.com/protocols/supplier-sourcing-v1.json"
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
