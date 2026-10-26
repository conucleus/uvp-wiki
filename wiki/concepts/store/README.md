---
title: 秩序商店（已退役）
type: meta
audience: 协议读者
preread: ../protocol-bindings.md
status: retired
---

# 秩序商店（已退役）

Store/workbench 前端已删除；`zhixu-store/registry/` 现在只提供 `@uvp-eth/zhixu-registry` 数据层：

- 只登记 `ZhixuRecord`（planId/planHash、descriptor、schemaHash、version、registeredBy 签名）与 `IdentityClaim`（wallet、subject、descriptor、签名、opaque attestationRefs）；
- permissionless 写入，无 allowlist、审核、推荐、排名、supplier workflow 或 KYC；
- 登记 ≠ 背书；身份声明不参与订单授权，订单授权仍由链上 plan/slot/signal 决定。

边界见 [模块地图](../../reference/module-map.md) 与 [协议边界](../protocol-boundaries.md)。
