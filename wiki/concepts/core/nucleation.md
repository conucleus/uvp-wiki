# Nucleation / 凝结核

凝结核是秩序 (Zhixu) 的发起、设计和维护主体。先把它理解成可复用运营模型的 owner：采购运营团队、行业项目组织者、平台侧 workflow 设计者，或其他能长期维护这份规则书的组织。它对应 DSL 里的 `spec.nucleation.id`，用于标识“谁发起并维护这类秩序设计”。订单里的 executor、Store admin、trust registry 分别承担运行时执行、平台 workflow 和外部背书。

凝结核不自动等同于 Store operator、trust registry、registrar 或 submitter wallet。它可以出现在 workflow 材料和 Store 记录里，但链上权威仍然来自 plan attestation、publisher/registrar 权限、订单级 authorization 和参与方签名。

```yaml
spec:
  nucleation:
    id: procurement-nucleus
```

## 凝结核负责什么

凝结核负责秩序内部的设计和运行原则：

- 设计 Zhixu 的 task pattern、stage、source、signal、hook 和 trigger；
- 定义哪些 stage 需要哪些 supplier 能力；
- 设计选择权、资源要求、证据要求和公平规则；
- 组织供应商网络，并维护秩序内部的协作、公平和运转；
- 决定什么时候提交新版本、什么时候废弃旧版本。

这些责任先体现在 Zhixu DSL、resource handles、Product schema、supplier requirements 和发布材料里。编译后，它们进入 Plan artifact、plan hash 和可被 trust registry 审查的版本边界。

## 职责边界

| 相邻角色 | 分工 |
| --- | --- |
| Store admin | 提供平台工作台、审核材料、目录和发布流程。 |
| Trust registry | 外部判定者，负责背书 plan/supplier 是否可信、公平、可用。 |
| Supplier | 能力主体，可能被凝结核组织进秩序。 |
| Executor | 某个订单里的运行时执行者或 submitter。 |
| Registrar | 注册订单的授权主体。 |

## 和 Zhixu、Plan、Order 的关系

```text
Nucleation / 凝结核
  -> 设计 Zhixu
  -> 编译成 Plan
  -> 请求 trust registry 背书
  -> 创建或允许创建 Order
  -> 通过 proof 和 supplier network 维护秩序运转
```

秩序 (Zhixu) 是凝结核设计出的可复用规则书。Plan 是某个秩序版本的链目标产物。Order 是某个 Plan 的一次运行实例。凝结核可以维护多个秩序或多个版本；运行时仍经过 plan attestation、order registration、signal authorization 和 chain proof。

## 和 Store 的关系

Store 是凝结核的工作台和展示场。Store 可以帮助凝结核导入秩序、编译预览、组织供应商资料、展示履约 proof、发起 attestation request、维护 audit；链上 plan/supplier/order/signal 事实来自 registry 和 state-machine 事件。

Store 侧的产品视角见 [凝结核工作台](../../store/nucleation-workbench.md)。
