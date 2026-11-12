---
title: Supplier
type: explanation
audience: 协议读者
preread: ../README.md
status: verified
---

# Supplier

> 前置阅读：[核心概念](../README.md)
Supplier 是 Store 和凝结核组织的现实或数字能力主体，可以是个人、公司、报关行、物流商、AI 服务或企业系统。

Store 在链下维护 supplier 的显示名称、联系方式、能力标签、适用角色与阶段、私有匹配特征、审核和推荐记录（见 [秩序商店](../store/README.md)）。这些数据表达 Store 自己的经营判断，不是 UVP 合约认证。

`UVPIdentityRegistry` 可以在完成线下身份核验后，把 supplier 的 `subjectId` 绑定到一个或多个账户；身份域与信任分层见 [Trust 域](../trust/domains.md)。它回答“这个账户在本 Store 目录中代表谁”，不证明能力、信誉、适配性或履约结果。

## 谁使用

凝结核和 Store 组织供应商网络并维护目录资料；Registry operator 登记或撤销 subject/account binding；订单参与方通过 executor 绑定使用 supplier 的能力主体。

## 产生什么结果

supplier 资料进入 Store 目录和匹配展示；身份核验产生 `IdentityBindingRegistered`/`IdentityBindingRevoked` 事件；被选中的 supplier 派出钱包成为订单里的 executor 并提交 signal。

## 权威来自哪里

目录能力与推荐是 Store 链下判断；提交 Signal 的权利来自订单级显式 `SignalAuthorization` 与 EIP-712 签名（见 [Executor](executor.md)），合约只认授权与签名。

| 概念 | 来源 |
| --- | --- |
| 身份绑定 | `IdentityBindingRegistered` / `IdentityBindingRevoked`。 |
| 能力与推荐 | Store metadata 和 Store 自己的模型。 |
| 提交 Signal 的权利 | 订单级显式 `SignalAuthorization` 与 EIP-712 签名。 |

撤销身份绑定会停止目录的默认解析，但不会回滚已经发生的 Order、签名或链上事实，也不能阻止用户直接使用裸地址。

Supplier 和 Executor 始终是两个概念：Supplier 是 Store 的身份与能力目录对象；Executor 是某个 Order 动作实际获得授权的账户。一个 Supplier 可以对应多个账户，也可以在不同 Order 中使用不同 Executor。

一条 Zhixu 需要与另一条 Zhixu 协作时，由 B 侧发布独立 `kind: Dock` 文档声明静态 A→B 发射条件，目标阶段以 `executor.supplierType: dock` 承接，运行期在挂接 stage 选中 dock 执行者并写入 A 单号形成 binding；Supplier 只表达本 Store 目录中的能力主体。详见 [Executor](executor.md) 与 [Zhixu 作为 Executor](../apps/zhixu-as-executor.md)。
