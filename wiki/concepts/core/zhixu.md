# Zhixu DSL

Zhixu 是凝结核设计出的静态秩序定义。它不是订单，不是链上合约，也不是 Store 里的产品卡片。它是一份 DSL，用来声明一类可复用的生产关系：有哪些任务模式、每个任务有哪些阶段、阶段在哪条 source 因果链上、接收什么 signal、发出什么 signal、默认 supplier 是谁、哪些阶段能为其他阶段选择 executor、需要哪些资源。

代码入口是 `uvp-protocol/packages/compiler/src/types/index.ts` 的 `ZhixuDefinition`。

## 最小骨架

```yaml
apiVersion: uvp/v0
kind: Zhixu
metadata:
  name: africa-mro-master
  uid: zhixu-demo-africa-mro-master-v1
  annotations:
    version: "1"
spec:
  platform:
    type: blockchain
    provider: eth
    version: 0.1.3
  nucleation:
    id: africa-mro-demo
  taskPatterns:
    - name: master
      stages:
        - name: supplier_sourcing
          source: supply
          trigger: [SCOPE_READY]
          receiveSignals:
            SCOPE_READY: solution::master.technical_scope.cmp
          sendSignals: [str, cmp, err]
          executor:
            supplierType: zhixu
            supplierID: "{{ .supplier_sourcing_zhixu_uid }}"
            zhixuExecutorConfig:
              signalMap:
                str: sourcing::source.start.str
                cmp: sourcing::source.close.cmp
                err: sourcing::source.close.err
```

这段来自 Africa MRO demo。它说的是：主订单的 `master.supplier_sourcing` 阶段由 `solution::master.technical_scope.cmp` 触发；该阶段不是一个普通人直接完成，而是把另一条 `supplier-sourcing` Zhixu 当成执行接口来对接；外部执行秩序里的 `sourcing::source.close.cmp` 经 proof 校验和授权 submitter 桥接后，才能推动主订单。详见 [Zhixu 作为 Executor](../../execution/zhixu-as-executor.md)。

## 顶层字段

| 字段 | 解释 |
| --- | --- |
| `apiVersion` | DSL 版本，目前是 `uvp/v0`。 |
| `kind` | 对流程定义来说是 `Zhixu`。编译器也定义了 `SupplierDefinition`，但它不是同一种对象。 |
| `metadata.name` | 可读名称，也会参与计划身份。 |
| `metadata.uid` | 稳定 Zhixu ID。没有时会回退到名称。 |
| `metadata.labels` | 业务分类、行业、demo 标签。它们是元数据，不是链上权限。 |
| `metadata.annotations.version` | 计划版本。版本变化会进入 `planId`。 |
| `spec.platform` | 目标平台。EVM track 使用 `type=blockchain`、`provider=eth`。 |
| `spec.nucleation.id` | 秩序的发起核、设计者或组织域标识。详见 [Nucleation / 凝结核](nucleation.md)。 |
| `spec.taskPatterns` | 任务模式列表，里面包含 stages。 |

## Stage 字段

| 字段 | 解释 |
| --- | --- |
| `name` | 阶段名称。和 task pattern 名拼成 `stageIdentifier`。 |
| `source` | 该阶段 signal 所属的因果链，不等于用户角色。 |
| `trigger` | 哪些 hook ready 后会发出 `HookReady`，从而形成可处理任务。详见 [Trigger](trigger.md)。 |
| `receiveSignals` | hook key 到 Hook DSL 表达式的映射。 |
| `sendSignals` | 阶段完成后可能发出的 signal 名称。 |
| `executor` | 默认执行者配置，指向 supplier 或另一条 Zhixu。 |
| `selectedStages` | 当前阶段能为哪些目标阶段选择 executor。 |
| `fileResources` | 阶段协议、证据要求、资源清单等链下资源句柄。详见 [File Resources](file-resources.md)。 |

编译器把 `taskPattern.name + "." + stage.name` 变成 `stageIdentifier`。例如 `master.supplier_sourcing` 会被哈希为链上的 `stageId`。

## `trigger` 和 `receiveSignals`

`receiveSignals` 定义 hook 条件，`trigger` 决定哪些 hook 会变成 Product 任务。两者必须对齐：

```yaml
trigger:
  - SCOPE_READY
receiveSignals:
  SCOPE_READY: solution::master.technical_scope.cmp
```

如果 `trigger` 引用的 key 不存在，编译器会报错。不是所有 hook 都必须 trigger；非 trigger hook 可以用于内部依赖、signalMap 或观察，但不会直接发 `HookReady`。

## `selectedStages`

`selectedStages` 是选择权，不是 UI 上的“下一步”。例如 Phase 2 报关闭环中，买家的 selector stage 可以为 `customs-complete` 选择报关履约者。编译器把这个关系变成 selector binding，合约在 executor patch 时检查它。

```yaml
selectedStages:
  - customs-complete
```

没有 selector binding 的 stage，不能任意为目标 stage 改 executor。

## `executor`

`executor` 指向默认能力主体：

| `supplierType` | 含义 |
| --- | --- |
| `individual` | 个体执行者。 |
| `organization` | 组织、企业系统、服务商或团队。 |
| `zhixu` | 另一条 Zhixu 作为执行接口对接。 |

`supplierID` 是 Store/治理/部署材料中解析的 supplier 或 Zhixu 标识。它本身不等于订单里的 active executor 钱包。订单运行时可能通过 `StageExecutorPatchApplied` 选出具体 executor。

## `fileResources`

`fileResources` 记录阶段协议、证据要求、验收标准或资源句柄。它是句柄，不是文件明文。Africa MRO demo 中每个阶段都指向 Markdown protocol 文件和 SHA-256：

```yaml
fileResources:
  sourcing_contract:
    fileType: local
    resourceRole: stage_protocol
    mediaType: text/markdown
    localFile:
      path: ./uvp-periphery/demos/africa-mro-docking/resources/protocols/africa-mro-master/supplier_sourcing.md
      sha256: "0x3002..."
```

这些业务文件不进链。链上只记录哈希、URI 或 resource patch 事件。

## Zhixu、Plan、Order 的区别

| 概念 | 静态/动态 | 解释 |
| --- | --- | --- |
| Nucleation / 凝结核 | 组织主体 | 发起、设计和维护 Zhixu 的秩序组织者。 |
| Zhixu | 静态 DSL | 可复用的秩序定义。 |
| Plan | 链目标产物 | 某个 Zhixu 针对 EVM 编译出的 artifact、hash 和注册参数。 |
| Order | 动态实例 | 某个 Plan 的一次运行，包含 signal、hook runtime、stage overlay 和 proof。 |

一条 Zhixu 可以编译成多个不同平台或版本的 Plan；同一个 Plan 可以产生多个 Order。
