# 编译输入

编译输入是 `ZhixuDefinition`。编译器不会只做字符串搬运，它会先验证定义是否能生成确定性的协议产物。

## 进入产物的字段

| 字段 | 用途 |
| --- | --- |
| `metadata.name` | 计划可读名称和缺省标识输入。 |
| `metadata.uid` | Zhixu 稳定标识。 |
| `metadata.annotations.version` | 计划版本。 |
| `spec.platform` | 平台目标，参与哈希。 |
| `taskPatterns[].name` | stage 标识的一部分。 |
| `stages[].name` | stage 标识的一部分。 |
| `stages[].source` | hook source 和 `sourceId` 输入。 |
| `stages[].receiveSignals` | 生成 receive hook。 |
| `stages[].trigger` | 决定哪些 hook Ready 时发 `HookReady`。 |
| `stages[].executor` | executor route 和 reachability。 |
| `stages[].selectedStages` | selector binding 和 executor closure。 |
| `stages[].sendSignals` | 出站 signal 描述。 |
| `stages[].fileResources` | 产品资源要求和 resource patch 输入。 |

## 编译器会拒绝什么

编译器会在哈希前拒绝这些形状：

- 缺少必要的 `metadata`、`spec`、`taskPatterns` 或 stage。
- `selectedStages` 指向不存在的 stage。
- executor route 无法被静态 executor 或 selector 触达。
- hook 表达式格式不合法。
- signal 引用不是 `task.stage.signal` 形式。
- receive signal 或 signal map 引用不存在的阶段或信号。
- stage selector binding 无法形成确定关系。

这些错误要在编译期暴露，而不是等到合约注册或订单执行时才发现。

## Source Zhixu 也参与哈希

`OnchainHookPlanArtifact` 的 `planHash` 包含 canonicalized source Zhixu。也就是说，影响协议语义的源定义变化会改变计划哈希。编译产物不是手写 JSON，应由脚本从源定义可重复生成。
