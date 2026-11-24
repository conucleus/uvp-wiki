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

`UVPIdentityRegistry` 的 subject 命名空间可以在完成线下身份核验后，把 `subjectId` 与账户绑定；supplier 命名空间则把 SID 永久绑定到一个 supplier account（一对一、不可轮换）。身份域与信任分层见 [Trust 域](../trust/domains.md)。两者都不证明能力、信誉、适配性或履约结果。

## 谁使用

凝结核和 Store 组织供应商网络并维护目录资料；Registry operator 登记或撤销 subject/account binding；订单参与方通过 executor 绑定使用 supplier 的能力主体。

## 产生什么结果

supplier 资料进入 Store 目录和匹配展示；身份核验产生 `IdentityBindingRegistered`/`IdentityBindingRevoked` 事件；SID 注册/状态变化产生 `SupplierRegistered`/`SupplierStatusChanged`。被选中的 SID 的永久 supplier account 成为订单里的 executor 账户并提交 signal。

## 权威来自哪里

目录能力与推荐是 Store 链下判断；提交 Signal 的权利来自 source 阶段当前生效的 assigned supplier account 与 EIP-712 签名（见 [Executor](executor.md)），合约只认 `accountOf(supplierId)`、SID active 状态与签名。

| 概念 | 来源 |
| --- | --- |
| 身份绑定 | `IdentityBindingRegistered` / `IdentityBindingRevoked`（subject 命名空间）；`SupplierRegistered` / `SupplierStatusChanged`（supplier 命名空间）。 |
| 能力与推荐 | Store metadata 和 Store 自己的模型。 |
| 提交 Signal 的权利 | source 阶段 assigned supplier account（`UVPIdentityRegistry.accountOf`，SID active）与 EIP-712 签名。 |

撤销 subject 身份绑定会停止目录的默认解析；suspend/revoke supplier SID 会立即取消该阶段发信权。两者都不会回滚已经发生的 Order、签名或链上事实。

Supplier 和 Executor 始终是两个概念：Supplier 是 Store 的身份与能力目录对象；Executor 是某个 Order 动作实际使用的角色词。链上 SID 与 supplier account 永久一对一、不可轮换；一个 supplier 不会对应多个可切换账户，换地址必须注册新 SID 并显式迁移 zhixu/plan。

一条 Zhixu 需要与另一条 Zhixu 协作时，由 B 侧发布独立 `kind: Dock` 文档声明静态 A→B 发射条件，目标阶段以 `executor.supplierType: dock` 承接，运行期在挂接 stage 选中 dock supplier 并写入 A 单号形成 binding；Supplier 只表达本 Store 目录中的能力主体。详见 [Executor](executor.md) 与 [Zhixu 作为 Executor](../apps/zhixu-as-executor.md)。
