---
title: Supplier Directory、能力与联系
type: reference
audience: Store operator、supplier 接入方
preread: README.md
status: verified
---

# Supplier Directory、能力与联系

> 前置阅读：[秩序商店（Store）](README.md)
Supplier Directory 是 Store 的链下工作台：维护 supplier 目录、名称、联系信息、能力标签、匹配特征和履约 proof。Identity Registry 只提供线下 subject 与钱包的对应，不能替 Store 证明能力——权威边界见 [README.md](README.md)「信息对象与权威来源」表与 [../protocol-boundaries.md](../protocol-boundaries.md)。

## 三类身份与标签来源

| 标签层 | 谁维护 | 含义 | 权威边界 |
| --- | --- | --- | --- |
| 凝结核内部标签 | 凝结核 / 秩序组织者 | 某 supplier 适合某 stage、role slot、resource/evidence 类型。 | 能力判断由凝结核负责，发信权在 Order 的 `stage -> supplierId` 指派中产生。 |
| Store 平台标签 | Store operator | catalog 分类、搜索、行业、风险、运营可见性。 | Store 自己承担解释和运营责任。 |
| Identity binding | Identity Registry owner | 线下 subject 对应哪个钱包。 | 不包含能力，也不创建订单权限。 |

Supplier “打标”分成不同层。Store 平台标签、凝结核内部标签、外部合规材料和订单授权分别展示。

## Supplier 信息层与 Capability Passport

Capability passport 先展示身份、能力资料、可用阶段和 proof，再展示联系人和通知配置。下表同时是 supplier 信息层的定义与 passport 区块结构：

| 层 / 区块 | 内容 | 权威 |
| --- | --- | --- |
| Identity | display name、subject id、wallet、组织说明、metadata URI；Registry binding status、revocation reason、proof rows。 | Store metadata + `UVPIdentityRegistry` projection。 |
| Nucleus fit / usage | 可服务的 Zhixu、stage、role slot、resource/evidence 类型；被哪些凝结核组织进哪些 Zhixu。 | 凝结核组织语义。 |
| Capability | logistics、customs、inspection、pricing、quality-review、document-verification 等 catalog tags；可承接 stage、支持的 Product task intent、是否可做 selector。 | Store metadata + audit。 |
| Contact / Operations | 联系人、通知渠道、SLA、可用区域与时段、升级路径、operational notes。 | Store metadata；不进链上明文。 |
| Participation / Runtime | recent orders、open tasks、historical proof、failure/timeout history、active supplier assignments。 | `UVPStateMachine` / Product projection。 |
| Dock | 可参与的 `kind: Dock` 静态声明（`dkid`）、`signalMap` 输出面、adapter endpoints、试配记录。 | Store workflow + 链上 `DockRegistered` 投影；身份绑定看 Identity Registry。 |

## 供应商组织路径

```text
凝结核定义 supplier requirements
  -> Store 记录 supplier profile / contact / platform tags
  -> 凝结核把 supplier 组织进某些 stage 或 role slots
  -> Store 线下核验身份材料
  -> Registry owner register identity binding
  -> indexed IdentityBindingRegistered
  -> 订单注册后由 stage supplier patch 指派 supplierId
  -> 履约 proof 反哺 supplier passport
```

每一步的权威不同：凝结核组织内部候选，Store 维护平台目录和 audit，Identity Registry 解析 subject/wallet（见 [README.md](README.md) 权威表）；当前订单是否可提交 signal 由 `UVPStateMachine` 授权决定。

## Store admin 展示口径

- 凝结核决定某个 supplier 如何进入内部环节。
- Identity Registry 只判定当前目录如何把 subject 解析到钱包。
- 平台 capability tag 用作目录、搜索和匹配，由 Store 对其解释与维护负责。
- 联系人或通知成功属于 operational workflow；业务完成看链上 signal/proof（[../protocol-boundaries.md](../protocol-boundaries.md)）。
- supplier profile 用作能力材料；当前订单提交权限看 `stage -> supplierId` 与 SID active 状态。

## 作为 Dock 对接方

一条 Zhixu 以两种角色进入跨秩序协作：作为 B 侧发布独立 `kind: Dock` 文档，把自身某个 `executor.supplierType: dock` 阶段开放成 A 侧事实驱动的输出面；或作为 A 侧被 `spec.from.zhixu` / `spec.from.source` 引用，提供事实源。Store 按定义 uid（`zx-<32hex>`）展示 peer Zhixu、版本化 Plan、相关 Dock 声明的 `signalMap` 输出面，以及链上事实：`DockRegistered`、`StageDockSupplierSelected`、`DockBindingPoked`、`DockOutputSubmitted` 与两侧订单的 signal / proof。B 订单推进以自身授权 signal / proof 为准。接入流程与字段细节见 [Dock 协作](../apps/zhixu-as-executor.md)。
