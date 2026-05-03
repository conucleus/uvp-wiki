# Nucleation / 凝结核

凝结核是 Zhixu 的发起核、设计者和秩序组织者。它对应 Zhixu DSL 里的 `spec.nucleation.id`，用于标识“谁发起并维护这类秩序设计”，而不是某个订单里的 executor，也不是 Store admin。

```yaml
spec:
  nucleation:
    id: africa-mro-demo
```

## 凝结核负责什么

凝结核负责秩序内部的设计和运行原则：

- 设计 Zhixu 的 task pattern、stage、source、signal、hook 和 trigger；
- 定义哪些 stage 需要哪些 supplier 能力；
- 设计选择权、资源要求、证据要求和公平规则；
- 组织供应商网络，并维护秩序内部的协作、公平和运转；
- 决定什么时候提交新版本、什么时候废弃旧版本。

这些责任先体现在 Zhixu DSL、resource handles、Product schema、supplier requirements 和发布材料里。编译后，它们进入 Plan artifact、plan hash 和可被 trust domain 审查的版本边界。

## 凝结核不是什么

| 不是 | 原因 |
| --- | --- |
| Store admin | Store 提供平台工作台、审核材料、目录和发布流程，不替凝结核设计秩序内部规则。 |
| Trust domain | Trust domain 是外部判定者，负责背书 plan/supplier 是否可信、公平、可用。 |
| Supplier | Supplier 是能力主体，可能被凝结核组织进秩序，但不等于秩序发起核。 |
| Executor | Executor 是某个订单里的运行时执行者或 submitter。 |
| Registrar | registrar 可以注册订单，但不因此拥有秩序设计权。 |

## 和 Zhixu、Plan、Order 的关系

```text
Nucleation / 凝结核
  -> 设计 Zhixu
  -> 编译成 Plan
  -> 请求 trust domain 背书
  -> 创建或允许创建 Order
  -> 通过 proof 和 supplier network 维护秩序运转
```

Zhixu 是凝结核设计出的静态秩序定义。Plan 是某个 Zhixu 版本的链目标产物。Order 是某个 Plan 的一次运行实例。凝结核可以维护多个 Zhixu 或多个版本，但不能绕过 plan attestation、order registration、signal authorization 和 chain proof。

## 和 Store 的关系

Store 是凝结核的工作台和展示场，不是凝结核的替代者。Store 可以帮助凝结核导入 Zhixu、编译预览、组织供应商资料、展示履约 proof、发起 attestation request、维护 audit；但 Store metadata、标签、review、通知和 audit 都不能替代链上 plan/supplier/order/signal 事实。

Store 侧的产品视角见 [凝结核工作台](../../store/nucleation-workbench.md)。
