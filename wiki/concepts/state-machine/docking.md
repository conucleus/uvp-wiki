# Docked Zhixu Runtime

Docked Zhixu 是状态机运行时里的 order-to-order 对接能力。它允许一条 local order 把某个 stage 交给另一条 linked Zhixu / linked order 执行，再把 linked order 中已经发生的 signal 映射回 local order。

这不是 Store sandbox 草稿，也不是普通后端联动。正式运行态要落到 `UVPStateMachine` 的 docking module 事件和 proof 上。

## 状态机对象

| 对象 | 含义 |
| --- | --- |
| local order | 当前订单，等待 peer Zhixu 的输出推动本地阶段。 |
| linked order | 被 dock 进来的另一条 Zhixu order，有自己的 plan、授权、signal 和 proof。 |
| docking link | local order 与 linked order 的绑定关系，包含 selector stage、linked plan、link hash、nonce 和 metadata URI。 |
| signal binding | linked source/signal 到 local source/signal 的映射。 |
| mapped signal | linked order 里已存在的 signal 被映射成本地 order 可消费的 signal proof。 |

## 链上事件

| 事件 | 说明 |
| --- | --- |
| `DockedOrderLinked` | 记录 local order 和 linked order 的对接关系。 |
| `DockedSignalMapped` | 记录 linked signal 与 local signal 的绑定。 |
| `DockedSignalSubmitted` | linked order 的已提交 signal 被映射回 local order。 |

`UVPStateMachineLens` 暴露 `getActiveDockedOrderLink` 和 `getActiveDockedSignalBinding`，用于读取当前 active docking relation。

## 运行路径

```text
local stage HookReady
  -> Store/Product 或 adapter 选择 linked Zhixu order
  -> linkDockedOrder / linkDockedOrderFor
  -> linked order 按自己的 Plan 运行
  -> linked SignalSubmitted 出现
  -> submitDockedSignal
  -> local order 出现 DockedSignalSubmitted
  -> local hooks 继续求值
```

如果 local stage 通过 `externalSignals` 打开 docking workflow，backend/executor 必须先完成外部事实的验签、去重和规范化；该输入不会自动生成 Hook 或推进 UVP。若入口来自另一个订单的 canonical signal，应使用显式的 `OUTSIDE@(source::task.stage.signal)` 或 `OUTSOURCE@(source::task.stage.signal)` wrapper，并经过 signal binding、docking link 和 mapped signal proof。linked order 的 `str/cmp/err` 等输出不会自动推进 local order。

## 边界

- local order 和 linked order 都是独立链上订单。
- linked Zhixu 的 plan publication、order registration、signal authorization 和 proof 独立存在。
- Store docking session 只是试拼和审核材料；正式 proof 看 `DockedOrderLinked`、`DockedSignalMapped`、`DockedSignalSubmitted` 和两边订单事件。
- `signalMap` 描述可映射接口，不等于自动完成业务。
- `submitDockedSignal` 映射的是 linked order 已存在的 signal，不替 linked order 生成业务事实。

更完整的执行者视角见 [Docked Zhixu / Zhixu 作为 Executor](../../execution/zhixu-as-executor.md)。
