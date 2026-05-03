# Docking Sandbox

Docking Sandbox 用来让凝结核试拼外部 Zhixu、supplier signal map、adapter workflow 或 executor integration。它是配置和验证工具，不是发布路径本身，也不是 Store admin 替凝结核治理 peer Zhixu。

## 可以做什么

- 创建 sandbox session；
- validate signal map、role slot、stage 和 capability plugin 的匹配；
- 保存 draft；
- 生成 operator review 材料；
- 帮助判断一个 supplier、adapter 或 peer Zhixu 是否能接入目标秩序。
- 预览local stage trigger 后要创建的 linked order 或 adapter job；
- 检查 peer Zhixu plan trust 和 supplier trust projection；
- 生成 signalMap proof checklist。

## 不能做什么

- 不能发布正式 Zhixu。
- 不能注册 plan。
- 不能创建 order。
- 不能创建 signal authorization。
- 不能把 sandbox validation 说成 trust attestation。
- 不能把 Store 保存的 relation metadata 说成凝结核已经完成内部治理。

## 页面提示

Docking 页面必须持续标注：

```text
试拼不等于发布。
```

正式发布仍要走 Zhixu 配置与发布、governance attestation、registerPlan/registerOrder 和 Product projection 路径。

## Docking Session 建议结构

| 字段 | 说明 |
| --- | --- |
| localPlanId / localStage | 本地 Zhixu 中要开放给外部执行接口的 stage。 |
| nucleationId | 发起这次试拼的凝结核。 |
| executorType | `zhixu`、enterprise adapter、MCP agent、manual supplier。 |
| peerZhixu | 目标 Zhixu subject、active plan、trust status。 |
| signalMap | `str/cmp/err` 映射和 source validation 结果。 |
| resourceNeeds | local/linked 两侧资源句柄、manifest、证据要求。 |
| contact | peer operator、adapter endpoint、notification policy。 |
| proofChecklist | linked order 注册、linked signal、local mapped signal 的 proof 要求。 |
| review | operator note、风险、审批状态。 |

## `supplierType=zhixu` 的特别检查

- `signalMap` 必须至少包含 `str` 和 `cmp`。
- 同一个 `signalMap` 应引用同一个 linked source。
- peer Zhixu 的 plan trust 要可见。
- linked order lifecycle 不能只存在 Store DB；它必须能落到 state-machine events。
- local order继续推进前，local order上必须出现授权 mapped signal。
