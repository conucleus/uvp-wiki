---
title: 秩序 (Zhixu) DSL
type: explanation
audience: 协议读者
preread: ../README.md
status: verified
---

# 秩序 (Zhixu) DSL

> 前置阅读：[核心概念](../README.md)
`Zhixu` 是“秩序”的拼音。在本仓库里，秩序 (Zhixu) 是凝结核设计出的可复用协作规则书：用 DSL 声明一类可复用的生产关系——有哪些阶段、每个阶段在哪条 source 因果链上、接收什么 signal、发出什么 signal、是否承担出生入口（`sendSignals` 条目上的 `trigger: true`）、默认 executor 是谁（静态 plain executor，或由 `supplierType: dock` 声明、运行期选定的 dock 执行者）、哪些阶段能为其他阶段选择 executor、需要哪些文件资源，以及跨秩序协作时对端需要声明哪些静态 Dock。

代码入口是 `uvp-protocol/packages/compiler/src/types/index.ts` 的 `ZhixuDefinition`。订单 (Order) 是这份规则书编译、注册之后的一次运行实例。字段与语义的权威是语言层正本 `uvp-core/docs/zhixu-dsl-grammar.md`；本页只给概念入口。

## 谁使用

凝结核和秩序设计者编写 Zhixu DSL；compiler 把它编译成链上产物；Store、publisher 和 registrar 负责审核、发布和用它创建订单。普通参与者通常只通过 Product/Store 投影间接消费它。

## 产生什么结果

一条 Zhixu 编译出确定性的 hook plan 与 on-chain artifact（`uvp.hookPlan.v7` / `uvp.onchainHookPlan.v7`），经 `commitPlan` + `finalizePlan` 注册后成为可创建 Order 的 Plan；同一个 Plan 可以运行出多个 Order。跨秩序协作的 A→B 发射条件写在独立的 `kind: Dock` 文档里，编出 `uvp.dock.v1`，不进入 `Zhixu.spec`。

## 权威来自哪里

DSL 文本本身只是设计稿。定义身份是内容派生 uid `zx-<32hex>`（剔除 `metadata.name`/`metadata.annotations` 后的 canonical JSON，按域 `uvp:definition-uid:v2` 求哈希）；Plan 身份由编译产物哈希和链上注册决定；订单运行时事实来自 `UVPStateMachine` 事件。本页字段说明与语言层正本、compiler 类型定义保持同步。

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
  nucleation:
    id: procurement-nucleus
  stages:
    - name: intake
      source: customer
      sendSignals: [{name: requested, trigger: true}, {name: str}, {name: cmp}, {name: err}]
      executor:
        supplierType: organization
        supplierID: "{{ .intake_executor_uid }}"
    - name: supplier_sourcing
      source: supply
      receiveSignals:
        SCOPE_READY: customer::intake.cmp
      sendSignals: [{name: str}, {name: cmp}, {name: err}]
      executor:
        supplierType: dock
```

这段示例说明三件事：`intake` 把 `requested` 声明为出生信号——空 `orderId` 提交命中后建单并写首事实；`supplier_sourcing` 通过 `receiveSignals` 等待订单内的同单事实；`supplier_sourcing` 是 dock 阶段——执行者由运行期一次性选定，跨秩序 A→B 的发射条件由另一份独立 `kind: Dock` 文档声明：

```yaml
apiVersion: uvp/v0
kind: Dock
metadata:
  name: sourcing_service
spec:
  from:
    zhixu: zx-9c41f0d27a3e5b86c4d1af0b7e285c36   # 已发布定义的内容派生 uid
    source: supply
  to:
    zhixu: zx-2f7a1c9b4e6d8053a1c2b3d4e5f60718
    stage: supplier_sourcing
  signalMap:
    cmp: "supply::supplier_sourcing.str"
```

Dock 声明与 binding 的运行期语义见 [Executor](executor.md) 和语言层正本 §7；Dock 不创建订单。

## 顶层字段

| 字段 | 解释 |
| --- | --- |
| `apiVersion` | DSL 版本，目前是 `uvp/v0`。 |
| `kind` | 当前 DSL 顶层对象是 `Zhixu`；跨秩序声明是并列的 `kind: Dock`（独立文档，见上）。 |
| `metadata.name` | 必填 slug（`^[a-z][a-z0-9_-]{0,99}$`），是纯展示属性，不是身份也不是寻址键；跨秩序引用一律按内容派生 uid（`spec.from.zhixu`/`spec.to.zhixu`）。 |
| `metadata.uid` | 不是 DSL 字段：出现即按未知字段响亮拒绝。DSL 壳不携带任何派生身份。 |
| `metadata.labels` | 业务分类、行业、demo 标签；是定义内容的一部分，参与内容派生身份。 |
| `metadata.annotations` | 自由注解，永不参与身份或哈希推导（Zhixu 无原生版本语义，`version` 键无特殊待遇）。 |
| `spec.platform` | 轨道声明：EVM track 使用 `type=blockchain`、`provider=eth`，可显式写 `network=base`。 |
| `spec.nucleation.id` | 秩序的发起核、设计者或组织域标识。详见 [Nucleus / 凝结核](nucleation.md)。 |
| `spec.stages` | 阶段列表；stage 名在秩序内全局唯一。 |

## Stage 字段

| 字段 | 解释 |
| --- | --- |
| `name` | 阶段名称，即 `stageIdentifier` 本身，在秩序内全局唯一。 |
| `source` | 该阶段 signal 所属的因果链（秩序内局部命名空间，可被多个阶段共享）；用户角色由 Product/authorization 另行解释。 |
| `sendSignals` | 出站信号声明，条目是对象 `{name, validWhen?, trigger?}`：`name` 必填且归一后不可重复；`validWhen` 是发射适格声明（表达式列表，见 [Signal](signal.md)）；条目标记 `trigger: true` 即出生信号。 |
| `receiveSignals` | 同单 hook：通道名 → Hook DSL 表达式，只在本订单上下文求值。 |
| `executor` | 执行者声明：plain（`individual`/`organization` + `supplierID`）或 `supplierType: dock`（运行期选定）。 |
| `selectedStages` | 当前阶段能为哪些目标阶段选择/绑定 executor。 |
| `fileResources` | 阶段协议、证据要求、资源清单等链下资源句柄。详见 [File Resources](file-resources.md)。 |
| `fileWriters` | 跨阶段文件写授权 allowlist：声明哪些阶段可以写本阶段的文件映射（本阶段自身隐式可写、不自引用）。 |

编译器把 stage 的 `name` 直接作为 `stageIdentifier`。例如 `supplier_sourcing` 会被哈希为链上的 `stageId`。

## 出生信号

出生入口由 `sendSignals` 条目上的 `trigger: true` 声明：

```yaml
sendSignals: [{name: requested, trigger: true}, {name: str}, {name: cmp}, {name: err}]
```

- 出生信号条目必须属于本阶段 `sendSignals`、同阶段内不重复，出生集编译期固定并随 plan 承诺进入链上产物与云侧投影。
- 一个阶段可有多个出生信号；一个 plan 可有多个出生阶段；出生阶段不必是首个阶段。
- 出生阶段必须由静态 plain 执行者承接（`individual`/`organization` + `supplierID`），出生权不随 dock 绑定或运行时 patch 漂移。
- 空订单号 + 出生信号：先在空订单上下文（无 facts/files——负条件为真、存在/延时条件为假）求值该信号的 `validWhen`，通过后按出生事实纯函数派生订单号、创建订单并把该信号写为首条事实；同一出生事实重试幂等。空订单号 + 非出生信号被具名拒绝；带订单号的出生信号是普通订单内事实。
- 链轨运行期有三条出生通道：outside-trigger 开放提交、order-link 派生建单、治理分叉 `forkOrder`（见 [Order](order.md)）；Dock 在既有订单上以 binding 承载发射，不创建订单。

## `receiveSignals` 与同单事实连接

`receiveSignals` 的每个 value 是 `{source}::{condition}` 形式的同单 Hook，在订单上下文内求值，可引用本秩序内任意阶段已声明的信号。它表达“本订单里某条事实是否已经发生”，不是跨秩序订阅：

```yaml
receiveSignals:
  SCOPE_READY: customer::intake.cmp
```

跨秩序没有 Hook DSL 形式的订阅：B 侧发布独立 `kind: Dock` 文档声明 A→B 发射条件，目标阶段声明 `executor.supplierType: dock`，运行期在挂接 stage 建立 binding 后由 dock 发射把 B 输出写成本订单事实。

## `selectedStages`

`selectedStages` 是某个 stage 对目标 stage 的 executor patch 能力。例如在报关闭环中，买家提交的阶段可以为 `complete` 指定具体执行者。编译器把这个关系变成 selector binding，合约在 executor patch 时检查这个 stage-to-target 绑定。

```yaml
selectedStages:
  - complete
```

只有存在 selector binding 的 stage 才能为对应目标 stage 改 executor；patch 的目标必须命中 Plan 承诺的执行者候选集，出生阶段与 dock 阶段的执行者不走通用 patch。

## `executor`

`executor` 指向默认能力主体：

| `supplierType` | 含义 |
| --- | --- |
| `individual` | 个体执行者。 |
| `organization` | 组织、企业系统、服务商或团队。 |
| `dock` | 由另一条秩序对接的 dock 执行者：定义面只声明类型，执行者身份在运行期由订单在挂接 stage 一次性选定，选中后固定。 |

`supplierID` 只适用于 `individual`/`organization` executor（必填）。`supplierType: dock` 时不给 `supplierID`，该阶段必须以 `receiveSignals` 声明绑定面，且不进入 Plan 级执行者路由与候选集；选中/换选与 binding 建立见 [Executor](executor.md)。

## `fileResources` 与 `fileWriters`

`fileResources` 记录阶段协议、证据要求、验收标准或资源句柄。一个阶段可以指向链下 protocol 文件或对象存储资源，`fileType` 取值是闭集 `local` / `http` / `txcloud` / `plain_text`（详见 [File Resources](file-resources.md)）：

```yaml
fileResources:
  sourcing_contract:
    fileType: http
    httpFile:
      url: "https://example.com/protocols/supplier-sourcing-v1.json"
```

这些业务文件不进链。链上只记录内容哈希、句柄与阶段文件 patch 事件；运行期改写由 `UVPFileResourceModule` 承载（`key -> (contentHash, handle)`），授权走 `fileWriters` allowlist。

## Zhixu、Plan、Order 的区别

| 概念 | 静态/动态 | 解释 |
| --- | --- | --- |
| Nucleus / 凝结核 | 组织主体 | 发起、设计和维护 Zhixu 的秩序组织者；`nucleation` 是字段和成核上下文。 |
| 秩序 (Zhixu) | 静态 DSL | 可复用协作规则书。 |
| Plan | 链目标产物 | 某个 Zhixu 针对 EVM 编译出的 artifact、hash 和注册参数。 |
| Order | 动态实例 | 某个 Plan 的一次运行，包含 signal、hook runtime、stage executor patch、阶段文件 patch、dock binding 和 proof。 |

一条 Zhixu 可以编译成多个不同平台或版本的 Plan；同一个 Plan 可以产生多个 Order。
