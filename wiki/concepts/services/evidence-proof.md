---
title: Evidence、Proof 与 File Resource
type: explanation
audience: 工程贡献者
status: verified
---

# Evidence、Proof 与 File Resource

Evidence 和 proof 子系统处理链下材料的句柄、hash、metadata 和证明视图。它帮助 Product UI、Store、审计方和执行者确认“某个材料和某个链上事件是否对得上”。业务完成仍看状态机 signal/hook proof。

## 代码入口

| 文件 | 职责 |
| --- | --- |
| `src/evidence/hashing.ts` | evidence hash、metadata hash 计算。 |
| `src/evidence/service.ts` | evidence metadata 创建、查询、proof 组合。 |
| `src/evidence/store.ts` | storage contract。 |
| `src/evidence/sqlite-store.ts`、`postgres-store.ts` | durable evidence store。 |
| `src/evidence/storage.ts` | object storage adapter interface。 |
| `src/evidence/rehearsal-object-storage.ts` | 本地/演练 object storage adapter。 |
| `src/evidence/s3-object-storage.ts` | S3/R2 类 object storage adapter。 |
| `src/proof-verifier/service.ts` | metadata hash、evidence hash、Zhixu hash 对齐检查。 |
| `src/api/routes/evidence.ts` | evidence upload metadata 和 proof route。 |

## File Resource 是句柄

File Resource 是可验证的资源句柄：fileType、object namespace、URI policy 加上 metadata/content hash，最终落到链上 proof row；常见形态是 S3、R2、私有对象存储或本地 rehearsal adapter 这类链下对象。完整模型与类型定义见 [File Resources](../core/file-resources.md)。

## Proof verifier 做什么

- 检查 evidence metadata 和 hash 是否一致。
- 检查 evidence hash 是否和 signal payload 或 proof row 对齐。
- 检查 Zhixu hash / plan hash 是否和当前版本对齐。
- 把 mismatch 以 UI/API 能展示的形式报告出来。

Proof verifier 的边界：

- 货物是否真的送达由业务参与方、证据和争议/审查体系判断。
- Identity Registry publication 只表达线下主体与链上账户的绑定关系，不认证供应商能力或信誉；供应商能力/信誉属于 Store 链下经营数据。
- object handle 可访问性不能生成 `SignalSubmitted`。
- hash 对齐是证明条件；hook ready 来自状态机事件。

## 证据明文边界

合同、发票、物流、车辆、照片、OCR 原文等业务材料不应明文上链。链上只保存 hash、URI、签名、事件和必要 metadata。Chain Services 可以保存对象句柄和可重建 metadata，但必须避免把 private credential、RPC secret、JWT secret、database password 写入 docs、logs 或 proof output。
